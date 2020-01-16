#!/usr/bin/env node
import retry from 'async-retry';
import Bluebird from 'bluebird';
import stringify from 'csv-stringify/lib/sync';
import * as fs from 'fs';
import * as readline from 'readline';
import rp from 'request-promise-native';
import { StatusCodeError } from 'request-promise-native/errors';
import 'source-map-support/register';
import { ConcurrentlyOnceExecutor, questionAsync, retryWithConfirmation, to_YYYYMMDDThhmmss } from './utils';
import type { Venue1, Venue2 } from './Venue';

const requestNextVenues = async (currentVenue: Venue1): Promise<readonly Venue1[]> => {
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

async function* getEdgeLists(firstVenue: Venue1): AsyncGenerator<{
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
      const currentVenues = nextVenues;
      nextVenues = [];

      const currentAndNextsPairs = await Bluebird.map(
        currentVenues,
        async currentVenue => ({
          currentVenue,
          receivedNextVenues: await requestNextVenues(currentVenue),
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

const f = async () => {
  const FIRST_VENUE_ID = '4b19f917f964a520abe623e3';
  try {
    const body = await rp({
      url: `https://api.foursquare.com/v2/venues/${FIRST_VENUE_ID}`,
      method: 'GET',
      qs: { client_id, client_secret, v },
      json: true
    });
    const firstVenue: Venue2 = body.response.venue;

    const now = new Date;
    const dirName = `./out/${to_YYYYMMDDThhmmss(now)}-${firstVenue.name}`;

    for await (const { iterationCount, requestCount, venues, edgeList } of getEdgeLists(firstVenue)) {
      console.log(iterationCount, requestCount);
      const innerDirName = `${dirName}/${iterationCount}`;
      {
        const fileName = `${innerDirName}/venues.csv`;
        const output = stringify([...venues].map(([id, venue]) => [id, venue.name]));
        await fs.promises.mkdir(innerDirName, { recursive: true });
        await fs.promises.writeFile(fileName, output);
      }
      {
        const fileName = `${innerDirName}/edge-list.csv`;
        const output = stringify(edgeList.map(([v0, v1]) => [v0.id, v1.id]));
        await fs.promises.mkdir(innerDirName, { recursive: true });
        await fs.promises.writeFile(fileName, output);
      }
    }
  } catch (e) {
    console.error(e);
  }
  rl.close();
}

const executor = new ConcurrentlyOnceExecutor<boolean>();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const { client_id, client_secret, v } = {
  client_id: '',
  client_secret: '',
  v: '20180323'
}

f();