/* @flow */
import { ZalgoPromise } from 'zalgo-promise/src';

import { setFunctionName, getFunctionName } from './functions';
import { serializeArgs } from './serialize';

export function getEmptyObject() : {||} {
    // $FlowFixMe
    return {};
}

type MemoizeOptions = {|
  name? : string,
  time? : number,
  thisNamespace? : boolean
|};

const getDefaultMemoizeOptions = () : MemoizeOptions => {
    // $FlowFixMe
    return {};
};

export type Memoized<F> = F & {| reset : () => void |};

let memoizeGlobalIndex = 0;
let memoizeGlobalIndexValidFrom = 0;

export function memoize<F : Function>(method : F, options? : MemoizeOptions = getDefaultMemoizeOptions()) : Memoized<F> {
    const { thisNamespace = false, time: cacheTime } = options;

    let simpleCache;
    let thisCache;

    let memoizeIndex = memoizeGlobalIndex;
    memoizeGlobalIndex += 1;

    const memoizedFunction = function memoizedFunction(...args) : mixed {
        if (memoizeIndex < memoizeGlobalIndexValidFrom) {
            simpleCache = null;
            thisCache = null;
            memoizeIndex = memoizeGlobalIndex;
            memoizeGlobalIndex += 1;
        }

        let cache;

        if (thisNamespace) {
            thisCache = thisCache || new WeakMap();
            // $FlowFixMe
            cache = thisCache.getOrSet(this, getEmptyObject);
        } else {
            cache = simpleCache = simpleCache || {};
        }

        let cacheKey;

        try {
            cacheKey = serializeArgs(args);
        } catch {
            return method.apply(this, arguments);
        }

        let cacheResult = cache[cacheKey];

        if (cacheResult && cacheTime && (Date.now() - cacheResult.time) < cacheTime) {
            delete cache[cacheKey];
            cacheResult = null;
        }

        if (cacheResult) {
            return cacheResult.value;
        }

        const time  = Date.now();
        const value = method.apply(this, arguments);

        cache[cacheKey] = { time, value };

        return value;
    };

    memoizedFunction.reset = () => {
        simpleCache = null;
        thisCache = null;
    };

    // $FlowFixMe
    const result : F = memoizedFunction;

    return setFunctionName(result, `${ options.name || getFunctionName(method) }::memoized`);
}

memoize.clear = () => {
    memoizeGlobalIndexValidFrom = memoizeGlobalIndex;
};

// eslint-disable-next-line flowtype/no-weak-types
export function memoizePromise<R>(method : (...args : $ReadOnlyArray<any>) => ZalgoPromise<R>) : ((...args : $ReadOnlyArray<any>) => ZalgoPromise<R>) {
    let cache = {};

    // eslint-disable-next-line flowtype/no-weak-types
    function memoizedPromiseFunction(...args : $ReadOnlyArray<any>) : ZalgoPromise<R> {
        const key : string = serializeArgs(args);

        if (cache.hasOwnProperty(key)) {
            return cache[key];
        }

        cache[key] = ZalgoPromise.try(() => method.apply(this, arguments))
            .finally(() => {
                delete cache[key];
            });

        return cache[key];
    }

    memoizedPromiseFunction.reset = () => {
        cache = {};
    };

    return setFunctionName(memoizedPromiseFunction, `${ getFunctionName(method) }::promiseMemoized`);
}

// eslint-disable-next-line flowtype/no-weak-types
export function inlineMemoize<R>(method : (...args : $ReadOnlyArray<any>) => R, logic : (...args : $ReadOnlyArray<any>) => R, args : $ReadOnlyArray<any> = []) : R {
    // $FlowFixMe
    const cache : {| [string] : R |} = method.__inline_memoize_cache__ = method.__inline_memoize_cache__ || {};
    const key = serializeArgs(args);

    if (cache.hasOwnProperty(key)) {
        return cache[key];
    }

    const result = cache[key] = logic(...args);

    return result;
}
