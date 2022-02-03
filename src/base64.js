/* @flow */

export function base64encode(str : string) : string {
    if (typeof btoa === 'function') {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (m, p1) => {
            return String.fromCharCode(parseInt(p1, 16));
        })).replace(/[=]/g, '');
    }

    if (typeof Buffer !== 'undefined') {
        return Buffer.from(str, 'utf8').toString('base64').replace(/[=]/g, '');
    }

    throw new Error(`Can not find window.btoa or Buffer`);
}

export function base64decode(str : string) : string {
    if (typeof atob === 'function') {
        // $FlowFixMe[method-unbinding]
        return decodeURIComponent(Array.prototype.map.call(atob(str), c => {
            // eslint-disable-next-line prefer-template
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }

    if (typeof Buffer !== 'undefined') {
        return Buffer.from(str, 'base64').toString('utf8');
    }

    throw new Error(`Can not find window.atob or Buffer`);
}
