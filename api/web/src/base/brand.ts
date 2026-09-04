import { reactive } from 'vue';

/**
 * Server-level branding shared by the app header, login page and public
 * application form. Values are administered under Admin > Server Settings and
 * served unauthenticated from GET /api/config/brand
 */
export interface Brand {
    name: string;
    title: string;
    logo?: string;
    login: {
        username: string;
        contact?: string;
        brand: {
            enabled: 'default' | 'enabled' | 'disabled';
            logo?: string;
        };
        background: {
            enabled: boolean;
            color?: string;
        };
    };
}

export const DefaultLogo = '/logo.png';

export const brand = reactive<Brand & { loaded: boolean }>({
    loaded: false,
    name: 'Search & Rescue',
    title: 'Team Management',
    logo: undefined,
    login: {
        username: 'Username or Email',
        contact: undefined,
        brand: {
            enabled: 'default',
            logo: undefined
        },
        background: {
            enabled: false,
            color: undefined
        }
    }
});

let pending: Promise<void> | undefined;

/**
 * Load branding from the server, sharing a single in-flight request between
 * callers. Pass force=true after saving branding so the header updates live.
 * Branding must never block the app so failures fall back to the defaults.
 */
export function loadBrand(force = false): Promise<void> {
    if (pending && !force) return pending;

    pending = (async () => {
        try {
            const res = await window.std('/api/config/brand') as Brand;

            brand.name = res.name;
            brand.title = res.title;
            brand.logo = res.logo;
            brand.login = res.login;
        } catch (err) {
            console.warn('Failed to load branding', err);
        }

        brand.loaded = true;
    })();

    return pending;
}

/**
 * The "Contact Us" link on the login page accepts either an email address or a
 * full URL - bare email addresses are turned into mailto: links
 */
export function contactHref(contact?: string): string | undefined {
    if (!contact) return undefined;
    if (/^[a-z][a-z0-9+.-]*:/i.test(contact)) return contact;
    if (contact.includes('@')) return `mailto:${contact}`;
    return `https://${contact}`;
}
