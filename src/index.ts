import retry from 'async-retry';
import Bluebird from 'bluebird';
import stringify from 'csv-stringify/lib/sync';
import * as fs from 'fs';
import * as readline from 'readline';
import rp from 'request-promise-native';
import { StatusCodeError } from 'request-promise-native/errors';
import 'source-map-support/register';
import { ConcurrentlyOnceExecutor, questionAsync, retryWithConfirmation, to_YYYYMMDDThhmmss } from './utils';
import { Venue1, Venue2 } from './Venue';

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

const f1 = async (firstVenue: Venue1) => {
  const venues = new Map<string, Venue1>([[firstVenue.id, firstVenue]]);
  const edgeLists: (readonly (readonly [Venue1, Venue1])[])[] = [[]];
  let nextVenues = [firstVenue];
  let requestsCount = 0;

  try {
    for (let i = 0; i < 50; i++) {
      const currentVenues = nextVenues;
      nextVenues = [];
      const edges = [...edgeLists[edgeLists.length - 1]];

      const currentAndNextsPairs = await Bluebird.map(
        currentVenues,
        async (currentVenue: Venue1) => ({
          currentVenue,
          nextVenues: await requestNextVenues(currentVenue),
        }),
        { concurrency: 10 }
      );
      requestsCount += currentAndNextsPairs.length;

      for (const { currentVenue, nextVenues: items } of currentAndNextsPairs) {
        for (const item of items) {
          const venue1 = venues.get(item.id);
          if (venue1 === undefined) {
            venues.set(item.id, item);
            edges.push([currentVenue, item]);
            nextVenues.push(item);
          } else {
            edges.push([currentVenue, venue1]);
          }
        }
      }

      edgeLists.push(edges);
      console.log(i, requestsCount);

      if (nextVenues.length === 0) {
        break;
      }
    }
  } catch { }

  const now = new Date;
  const dirName = `./out/${to_YYYYMMDDThhmmss(now)}-${firstVenue.name}`;
  await fs.promises.mkdir(dirName, { recursive: true });
  for (const [i, edges] of edgeLists.entries()) {
    const fileName = `${dirName}/${i}.csv`;
    const output = stringify(edges.map(([v0, v1]) => [v0.name, v1.name]));
    fs.promises.writeFile(fileName, output);
  }
};

const f2 = async () => {
  const FIRST_VENUE_ID = '4b19f917f964a520abe623e3';
  try {
    const body = await rp({
      url: `https://api.foursquare.com/v2/venues/${FIRST_VENUE_ID}`,
      method: 'GET',
      qs: { client_id, client_secret, v },
      json: true
    });
    const firstVenue: Venue2 = body.response.venue;
    await f1(firstVenue);
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

f2();