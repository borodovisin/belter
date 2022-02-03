/* @flow */

export function getFunctionName <T : Function>(fn : T) : string {
    return fn.name || fn.__name__ || fn.displayName || 'anonymous';
}

export function setFunctionName <T : Function>(fn : T, name : string) : T {
    try {
        delete fn.name;
        fn.name = name;
    } catch (err) {
        // pass
    }

    fn.__name__ = fn.displayName = name;
    return fn;
}
