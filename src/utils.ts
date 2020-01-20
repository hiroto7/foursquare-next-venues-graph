import { EventEmitter } from 'events';
import type * as readline from 'readline';

export const to_YYYYMMDD = (date: Date) =>
  `${date.getFullYear()}` +
  `${date.getMonth() + 1}`.padStart(2, '0') +
  `${date.getDate()}`.padStart(2, '0');

export const to_hhmmss = (date: Date) =>
  `${date.getHours()}`.padStart(2, '0') +
  `${date.getMinutes()}`.padStart(2, '0') +
  `${date.getSeconds()}`.padStart(2, '0');

export const to_YYYYMMDDThhmmss = (date: Date) => `${to_YYYYMMDD(date)}T${to_hhmmss(date)}`;

/**
 * `retryFn` を実行する。 `retryFn` が拒否された場合、 `confirmFn` を実行する。
 * - `confirmFn` が `true` で解決された場合、 `retryFn` を再試行する。
 * - `confirmFn` が `false` で解決された場合、 `retryFn` の拒否理由をもって自身も拒否する。
 * @param retryFn 
 * @param confirmFn 
 */
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
  readonly #resolveEvent = 'resolve';
  readonly #rejectEvent = 'resolve';
  #ee?: EventEmitter;

  /**
   * ひとつのインスタンスにつき、あるタイミングでひとつの `fn` のみが実行されるようにする。
   * - ほかに未解決の `fn` がない状態でこの関数が呼ばれた場合、単純に引数で渡された `fn` を実行する。
   * - ほかに "未解決の `fn`" がある状態でこの関数が呼ばれた場合、
   *   1. 引数で渡された `fn` は実行せず、 "未解決の `fn`" が解決されるまで待機する。
   *   2. "未解決の `fn`" が解決されると、自身も同じ値で解決する。
   * @param fn ほかに未解決の `fn` がない状態で呼ばれた場合に実行される関数
   */
  exec(fn: () => T | Promise<T>): Promise<T> {
    return new Promise(async (resolve, reject) => {
      if (this.#ee === undefined) {
        const ee = new EventEmitter();
        this.#ee = ee;
        try {
          const result: T = await fn();
          resolve(result);
          ee.emit(this.#resolveEvent, result);
        } catch (reason) {
          reject(reason);
          ee.emit(this.#rejectEvent, reason);
        }
        this.#ee = undefined;
      } else {
        const ee = this.#ee;
        const onResolve = (result: T) => {
          resolve(result);
          ee.off(this.#rejectEvent, onReject);
        }
        const onReject = (reason: unknown) => {
          reject(reason);
          ee.off(this.#resolveEvent, onResolve);
        }
        ee.once(this.#resolveEvent, onResolve);
        ee.once(this.#rejectEvent, onReject);
      }
    });
  }
}

export const questionAsync = (rl: readline.Interface, query: string) =>
  new Promise<string>(resolve => rl.question(query, resolve));

/**
 * 引数として与えられた数値が、2の冪乗数であるかどうか判定する
 * @param n 
 */
export const is2Power = (n: number) => !(n & (n - 1));