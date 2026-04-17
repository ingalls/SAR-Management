import type { Router } from 'vue-router'

declare global {
    interface Window {
        stdurl: (url: string | URL) => URL;
        std: (url: string | URL, opts?: {
            token?: string;
            download?: boolean | string;
            headers?: Record<string, string>;
            body?: unknown;
            method?: string;
        }) => Promise<unknown>;
    }
}

function std() {
    window.stdurl = function(url: string | URL): URL {
        try {
            url = new URL(url);
        } catch {
            url = new URL(url, window.location.origin);
        }

        return url;
    }

    /**
     * Standardize interactions with the backend API
     *
     * @param {URL|String} url      - Full URL or API fragment to request
     * @param {Object} [opts={}]    - Options
     */
    window.std = async function(
        url: string | URL,
        opts: {
            token?: string;
            download?: boolean | string;
            headers?: Record<string, string>;
            body?: unknown;
            method?: string;
        } = {}
    ): Promise<unknown> {
        url = window.stdurl(url);
        if (!opts) opts = {};

        if (!opts.headers) opts.headers = {};

        if (!(opts.body instanceof FormData) && typeof opts.body === 'object' && !opts.headers['Content-Type']) {
            opts.body = JSON.stringify(opts.body);
            opts.headers['Content-Type'] = 'application/json';
        }

        if (localStorage.token && !opts.headers.Authorization) {
            opts.headers['Authorization'] = 'Bearer ' + localStorage.token;
        } else if (opts.token) {
            opts.headers['Authorization'] = 'Bearer ' + opts.token;
        }

        const res = await fetch(url, opts as RequestInit);

        if ((res.status < 200 || res.status >= 400) && ![401].includes(res.status)) {
            let bdy: Record<string, unknown>;
            try {
                bdy = await res.json() as Record<string, unknown>;
            } catch (cause) {
                throw new Error(`Status Code: ${res.status}: ${cause instanceof Error ? cause.message : String(cause)}`, { cause });
            }

            if (res.status === 403 && bdy.message === 'MFA Verification Required') {
                delete localStorage.token;
                window.location.reload();
                return;
            }

            const err = new Error((bdy.message as string) || `Status Code: ${res.status}`);
            (err as unknown as Record<string, unknown>).body = bdy;
            throw err;
        } else if (res.status === 401) {
            delete localStorage.token;
            window.location.reload();
            return;
        }

        const ContentType = res.headers.get('Content-Type');
        const ContentDisposition = res.headers.get('Content-Disposition');

        if (opts.download) {
            let name = 'download';
            if (typeof opts.download === 'string') {
                name = opts.download;
            } else if (ContentDisposition) {
                const regex = /filename[^;=\n]*=(((['"]).*?\3)|[^;\n]*)/ ;
                const matches = regex.exec(ContentDisposition);
                if (matches && matches[1]) {
                    name = matches[1].replace(/['"]/g, '');
                }
            }

            const object = new File([await res.blob()], name);
            const file = window.URL.createObjectURL(object);

            const link = document.createElement('a');
            link.href = file;
            link.download = name;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(file);

            return res;
        } else if (ContentType && ContentType.includes('application/json')) {
            return await res.json();
        } else {
            return res;
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
