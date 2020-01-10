import { EventEmitter } from 'events';
import * as readline from 'readline';

export const to_YYYYMMDD = (date: Date) =>
  `${date.getFullYear()}` +
  `${date.getMonth() + 1}`.padStart(2, '0') +
  `${date.getDate()}`.padStart(2, '0');

export const to_hhmmss = (date: Date) =>
  `${date.getHours()}`.padStart(2, '0') +
  `${date.getMinutes()}`.padStart(2, '0') +
  `${date.getSeconds()}`.padStart(2, '0');

export const to_YYYYMMDDThhmmss = (date: Date) => `${to_YYYYMMDD(date)}T${to_hhmmss(date)}`;

export const retryWithConfirmation =
  async <T>(retryFn: () => T | Promise<T>, confirmFn: (e: Error) => boolean | Promise<boolean>): Promise<T> => {
    while (true) {
      try {
        return await retryFn();
      } catch (e) {
        if (!await confirmFn(e)) {
          throw e;
        }
      }
    }
  }

export class ConcurrentlyOnceExecutor<T> {
  static readonly eventName = 'result';
  private ee?: EventEmitter;
  exec(fn: () => T | Promise<T>): Promise<T> {
    return new Promise(async resolve => {
      if (this.ee === undefined) {
        const ee = new EventEmitter();
        this.ee = ee;
        const result: T = await fn();
        resolve(result);
        ee.emit(ConcurrentlyOnceExecutor.eventName, result);
        this.ee = undefined;
      } else {
        this.ee.once(ConcurrentlyOnceExecutor.eventName, (result: T) => resolve(result));
      }
    });
  }
}

export const questionAsync = (rl: readline.Interface, query: string) =>
  new Promise<string>(resolve => rl.question(query, resolve));