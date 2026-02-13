import type { Router } from 'vue-router'

declare global {
    interface Window {
        stdurl: (url: string | URL) => URL;
        std: (url: string | URL, opts?: Record<string, any>) => Promise<any>;
    }
}

function std() {
    window.stdurl = function(url: string | URL): URL {
        try {
            url = new URL(url);
        } catch {
            url = new URL(url, window.location.origin);
        }

        // Allow serving through Vue for hotloading
        if (url.hostname === 'localhost') url.port = '4999'

        return url;
    }

    /**
     * Standardize interactions with the backend API
     *
     * @param {URL|String} url      - Full URL or API fragment to request
     * @param {Object} [opts={}]    - Options
     */
    window.std = async function(url: string | URL, opts: Record<string, any> = {}) {
        url = window.stdurl(url);

        try {
            if (!opts.headers) opts.headers = {};

            if (!(opts.body instanceof FormData) && typeof opts.body === 'object' && !opts.headers['Content-Type']) {
                opts.body = JSON.stringify(opts.body);
                opts.headers['Content-Type'] = 'application/json';
            }

            if (localStorage.token && !opts.headers.Authorization) {
                opts.headers['Authorization'] = 'Bearer ' + localStorage.token;
            }

            const res = await fetch(url, opts);

            let bdy: any = {};

            if ((res.status < 200 || res.status >= 400) && ![401].includes(res.status)) {
                try {
                    bdy = await res.json();
                } catch {
                    throw new Error(`Status Code: ${res.status}`);
                }

                if (res.status === 403 && bdy.message === 'MFA Verification Required') {
                    delete localStorage.token;
                    window.location.reload();
                    return;
                }

                const err = new Error(bdy.message || `Status Code: ${res.status}`);
                (err as any).body = JSON.stringify(bdy);
                throw err;
            } else if (res.status === 401) {
                delete localStorage.token;
                window.location.reload();
                return;
            }

            const contentType = res.headers.get('content-type');
            if (contentType && contentType.split(';')[0] === 'application/json') {
                return await res.json();
            } else {
                return res;
            }
        } catch (err: any) {
            throw new Error(err.message);
        }
    }
}

export function stdclick($router: Router, event: MouseEvent | KeyboardEvent, path: string) {    
    if (event.ctrlKey === true) {    
        const routeData = $router.resolve(path);    
        window.open(routeData.href, '_blank');    
    } else {    
        $router.push(path);    
    }    
}


export default std;
