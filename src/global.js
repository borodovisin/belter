/* @flow */

export function getGlobal() : Object {
    if (typeof window !== 'undefined') {
        return window;
    }
    if (typeof global !== 'undefined') {
        return global;
    }
    if (typeof __GLOBAL__ !== 'undefined') {
        return __GLOBAL__;
    }
    throw new Error(`No global found`);
}

export function getGlobalNameSpace<T : Object>({ name, version = 'latest' } : {| name : string, version? : string |}) : {| get : (string, defValue? : T) => T |} {

    const global = getGlobal();
    const globalKey = `__${ name }__${ version }_global__`;

    const namespace = global[globalKey] = global[globalKey] || {};

    return {
        get: (key : string, defValue? : T) : T => {
            // $FlowFixMe
            defValue = defValue || {};
            const item = namespace[key] = namespace[key] || defValue;
            return item;
        }
    };
}
