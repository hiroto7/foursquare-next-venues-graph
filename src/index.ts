#!/usr/bin/env node
import retry from 'async-retry';
import Bluebird from 'bluebird';
import stringify from 'csv-stringify/lib/sync';
import * as fs from 'fs';
import * as readline from 'readline';
import rp from 'request-promise-native';
import { StatusCodeError } from 'request-promise-native/errors';
import 'source-map-support/register';
import { ConcurrentlyOneExecutor, is2Power, questionAsync, retryWithConfirmation, to_YYYYMMDDThhmmss } from './utils';
import type { Venue1, Venue2 } from './Venue';

const requestNextVenues = async ({ currentVenue, executor, client_id, client_secret, v, rl }: {
  currentVenue: Venue1,
  executor: ConcurrentlyOneExecutor<boolean>,
  client_id: string,
  client_secret: string,
  v: string,
  rl: readline.Interface,
}): Promise<readonly Venue1[]> => {
  const body = await retryWithConfirmation(
    () => retry(
      async bail => {
        try {
          return await rp({
            url: `https://api.foursquare.com/v2/venues/${currentVenue.id}/nextvenues`,
            method: 'GET',
            qs: { client_id, client_secret, v },
            json: true
          });
        } catch (e) {
          if (e instanceof StatusCodeError && e.statusCode === 403) {
            bail(e);
            return;
          }
          throw e;
        }
      },
      { onRetry: (e: Error, attempt: number) => console.error(e, attempt) }
    ),
    e => executor.exec(async () => {
      console.error(e);
      const answer = await questionAsync(rl, 'Retry? (yes) ');
      const result = answer === '' || answer[0].toLowerCase() === 'y';
      return result;
    })
  );
  const nextVenues: readonly Venue1[] = body.response.nextVenues.items;
  return nextVenues;
}

async function* getEdgeLists({ firstVenue, client_id, client_secret, v, rl }: {
  firstVenue: Venue1,
  client_id: string,
  client_secret: string,
  v: string,
  rl: readline.Interface,
}): AsyncGenerator<{
  iterationCount: number,
  requestCount: number,
  venues: ReadonlyMap<string, Venue1>,
  edgeList: readonly (readonly [Venue1, Venue1])[],
}, void, unknown> {
  const venues = new Map<string, Venue1>([[firstVenue.id, firstVenue]]);
  const edgeList: (readonly [Venue1, Venue1])[] = [];
  let nextVenues = [firstVenue];
  let requestCount = 0;
  let iterationCount = 0;

  try {
    while (true) {
      const currentVenues: readonly Venue1[] = nextVenues;
      nextVenues = [];

      const executor = new ConcurrentlyOneExecutor<boolean>(currentVenues.length);
      const currentAndNextsPairs = await Bluebird.map(
        currentVenues,
        async currentVenue => ({
          currentVenue,
          receivedNextVenues: await requestNextVenues({ currentVenue, executor, client_id, client_secret, v, rl }),
        }),
        { concurrency: 10 }
      );
      requestCount += currentAndNextsPairs.length;

      for (const { currentVenue, receivedNextVenues } of currentAndNextsPairs) {
        for (const nextVenue of receivedNextVenues) {
          const venue1 = venues.get(nextVenue.id);
          if (venue1 === undefined) {
            venues.set(nextVenue.id, nextVenue);
            edgeList.push([currentVenue, nextVenue]);
            nextVenues.push(nextVenue);
          } else {
            edgeList.push([currentVenue, venue1]);
          }
        }
      }

      iterationCount += 1;
      yield {
        iterationCount,
        requestCount,
        venues: new Map(venues),
        edgeList: [...edgeList],
      }

      if (nextVenues.length === 0) {
        return;
      }
    }
  } catch { }
};

const writeEdgeLists = async ({ iterationCount, venues, edgeList, dirName }: {
  iterationCount: number,
  venues: ReadonlyMap<string, Venue1>,
  edgeList: readonly (readonly [Venue1, Venue1])[],
  dirName: string,
}) => {
  const innerDirName = `${dirName}/${iterationCount}`;
  {
    const fileName = `${innerDirName}/venues.csv`;
    const output = stringify([...venues].map(([id, venue]) => [
      id,
      venue.name,
      venue.location.country,
      venue.location.state,
      venue.location.city,
    ]));
    await fs.promises.mkdir(innerDirName, { recursive: true });
    await fs.promises.writeFile(fileName, output);
  }
  {
    const fileName = `${innerDirName}/edge-list.csv`;
    const output = stringify(edgeList.map(([v0, v1]) => [v0.id, v1.id]));
    await fs.promises.mkdir(innerDirName, { recursive: true });
    await fs.promises.writeFile(fileName, output);
  }
};

const getNameForURL = (venue: Venue2) => {
  const re = new RegExp(`/(?<encodedNameForURL>[^/]+)/${venue.id}$`);
  const encodedNameForURL = venue.canonicalUrl.match(re)?.groups?.encodedNameForURL;
  if (encodedNameForURL === undefined) {
    return undefined;
  } else {
    return decodeURIComponent(encodedNameForURL);
  }
}

const f = async () => {
  const v = '20200126';

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const firstVenueId = process.argv[2];
    if (firstVenueId === undefined) {
      throw new Error();
    }

    const client_id = process.env.FOURSQUARE_CLIENT_ID;
    if (client_id === undefined) {
      throw new Error();
    }

    const client_secret = process.env.FOURSQUARE_CLIENT_SECRET;
    if (client_secret === undefined) {
      throw new Error();
    }

    const body = await rp({
      url: `https://api.foursquare.com/v2/venues/${firstVenueId}`,
      method: 'GET',
      qs: { client_id, client_secret, v },
      json: true
    });
    const firstVenue: Venue2 = body.response.venue;

    const now = new Date;
    const nameForURL = getNameForURL(firstVenue);
    if (nameForURL === undefined) {
      throw new Error();
    }
    const dirName = `${process.cwd()}/${to_YYYYMMDDThhmmss(now)}-${firstVenueId}-${nameForURL}`;
    console.log(now, firstVenue.name);

    let lastResult: {
      iterationCount: number,
      venues: ReadonlyMap<string, Venue1>,
      edgeList: readonly (readonly [Venue1, Venue1])[],
    } | undefined = undefined;
    for await (
      const { iterationCount, requestCount, venues, edgeList } of
      getEdgeLists({ firstVenue, client_id, client_secret, v, rl })
    ) {
      console.log(new Date, iterationCount, requestCount);
      if (is2Power(iterationCount)) {
        // iterationCount が2の冪乗数であれば、この時点での venues と edgeList をファイルに書き出す
        lastResult = undefined;
        await writeEdgeLists({ iterationCount, venues, edgeList, dirName });
      } else {
        lastResult = { iterationCount, venues, edgeList };
      }
    }

    if (lastResult !== undefined) {
      // 最後の反復での venues と edgeList をファイルに書き出す
      await writeEdgeLists({ ...lastResult, dirName });
    }
  } catch (e) {
    console.error(e);
  }

  rl.close();
}

f()
