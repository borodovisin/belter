/* @flow */
import { memoize } from './memoize';

export function patchMethod(obj : Object, name : string, handler : Function) {
    const original = obj[name];

    obj[name] = function patchedMethod() : mixed {
        return handler({
            context:      this,
            // $FlowFixMe[method-unbinding]
            args:         Array.prototype.slice.call(arguments),
            original,
            callOriginal: () => original.apply(this, arguments)
        });
    };
}

export function extend<T : Object | Function>(obj : T, source : Object) : T {
    if (!source) {
        return obj;
    }

    if (Object.assign) {
        return Object.assign(obj, source);
    }

    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            obj[key] = source[key];
        }
    }

    return obj;
}

export function values<T>(obj : { [string] : T }) : $ReadOnlyArray<T> {
    if (Object.values) {
        // $FlowFixMe
        return Object.values(obj);
    }

    const result : Array<T> = [];
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            // $FlowFixMe[escaped-generic]
            result.push(obj[key]);
        }
    }

    // $FlowFixMe
    return result;
}

// eslint-disable-next-line no-undef
export const memoizedValues : <T>({ [string] : T }) => $ReadOnlyArray<T> = memoize(values);

export const constHas = <X : (string | boolean | number), T : { [string] : X }>(constant : T, value : X) : boolean => {
    return memoizedValues(constant).indexOf(value) !== -1;
};
