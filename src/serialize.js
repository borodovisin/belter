/* @flow */
import { uniqueID } from './uniques';

let objectIDs;

export function getObjectID(obj : Object) : string {

    objectIDs = objectIDs || new WeakMap();

    if (obj === null || obj === undefined || (typeof obj !== 'object' && typeof obj !== 'function')) {
        throw new Error(`Invalid object`);
    }

    let uid = objectIDs.get(obj);

    if (!uid) {
        uid = `${ typeof obj }:${ uniqueID() }`;
        objectIDs.set(obj, uid);
    }

    return uid;
}

export function serializeArgs<T>(args : $ReadOnlyArray<T>) : string {
    try {
        // $FlowFixMe[method-unbinding]
        return JSON.stringify(Array.prototype.slice.call(args), (subkey, val) => {

            // Treat each distinct function as unique for purposes of memoization
            // e.g. even if someFunction.stringify() is the same, we may use a different memoize cache
            // if the actual function is different.
            if (typeof val === 'function') {
                return `memoize[${ getObjectID(val) }]`;
            }

            // Detect DOM elements
            // By default JSON.stringify(domElement) returns '{}'. This ensures that stays true even for non-standard
            // elements (e.g. React-rendered dom elements) with custom properties
            if (
                (typeof window !== 'undefined' && val instanceof window.Element) ||
              (val !== null && typeof val === 'object' && val.nodeType === 1 && typeof val.style === 'object' && typeof val.ownerDocument === 'object')
            ) {
                return {};
            }

            return val;
        });
    } catch (err) {
        throw new Error(`Arguments not serializable -- can not be used to memoize -- ${ err }`);
    }
}
