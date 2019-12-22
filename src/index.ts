import retry from 'async-retry';
import Bluebird from 'bluebird';
import * as fs from 'fs';
import rp from 'request-promise-native';
import { StatusCodeError } from 'request-promise-native/errors';
import 'source-map-support/register';
import { Venue, Venue1 } from './Venue';

const to_YYYYMMDD = (date: Date) =>
  `${date.getFullYear()}` +
  `${date.getMonth() + 1}`.padStart(2, '0') +
  `${date.getDate()}`.padStart(2, '0');

const to_hhmmss = (date: Date) =>
  `${date.getHours()}`.padStart(2, '0') +
  `${date.getMinutes()}`.padStart(2, '0') +
  `${date.getSeconds()}`.padStart(2, '0');

const to_YYYYMMDDThhmmss = (date: Date) => `${to_YYYYMMDD(date)}T${to_hhmmss(date)}`;

const f1 = async (firstVenue: Venue) => {
  const venues = new Map<string, Venue>([[firstVenue.id, firstVenue]]);
  const edgeLists: (readonly (readonly [Venue, Venue])[])[] = [[]];
  let nextVenues = [firstVenue];
  let requestsCount = 0;

  try {
    for (let i = 0; i < 50; i++) {
      console.log(i, requestsCount);
      const currentVenues = nextVenues;
      nextVenues = [];
      const edges = [...edgeLists[edgeLists.length - 1]];

      const currentAndNextsPairs = await Bluebird.map(currentVenues, async currentVenue => {
        const body = await retry(
          async bail => {
            try {
              return await rp({
                url: `https://api.foursquare.com/v2/venues/${currentVenue.id}/nextvenues`,
                method: 'GET',
                qs: {
                  client_id: '',
                  client_secret: '',
                  v: '20180323'
                },
                json: true
              });
            } catch (e) {
              if (e instanceof StatusCodeError && e.statusCode === 403) {
                bail(e);
              }
              throw e;
            }
          },
          { onRetry: (e: Error, attempt: number) => console.error(e, attempt) }
        );
        const nextVenues: Venue[] = body.response.nextVenues.items;
        return { currentVenue, nextVenues };
      }, { concurrency: 10 });
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
    }
  } catch (e) {
    console.error(e);
  }

  console.log(requestsCount);

  const now = new Date;
  const dirname = `./out/${to_YYYYMMDDThhmmss(now)}-${firstVenue.name}`;
  await fs.promises.mkdir(dirname, { recursive: true });
  for (const [i, edges] of edgeLists.entries()) {
    fs.promises.writeFile(`${dirname}/${i}.csv`, edges.map(([v0, v1]) => `"${v0.name}","${v1.name}"`).join('\n'));
  }
};

const f2 = async () => {
  const FIRST_VENUE_ID = '4b19f917f964a520abe623e3';
  try {
    const body = await rp({
      url: `https://api.foursquare.com/v2/venues/${FIRST_VENUE_ID}`,
      method: 'GET',
      qs: {
        client_id: '',
        client_secret: '',
        v: '20180323'
      },
      "json": true
    });
    const firstVenue: Venue1 = body.response.venue;
    await f1(firstVenue);
  } catch (e) {
    console.error(e);
  }
}
f2();