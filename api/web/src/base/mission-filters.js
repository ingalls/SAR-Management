/**
 * Mission list filter state shared by the Missions page, the Missions card and
 * the MissionFilters panel. Serialises to/from URL query params so filtered
 * views are shareable links and survive a refresh.
 */

export function defaultFilters(overrides = {}) {
    return {
        filter: '',
        start: '',
        end: '',
        tag: [],
        team: [],
        agency: [],
        user: [],
        attended: false,
        geom: null,
        incidents: null,
        people: null,
        users_min: null,
        users_max: null,
        sort: 'start_ts',
        order: 'desc',
        ...overrides
    };
}

const LIST_KEYS = ['tag', 'team', 'agency', 'user'];
const BOOL_KEYS = ['geom', 'incidents', 'people'];
const INT_KEYS = ['users_min', 'users_max'];

function parseList(value) {
    if (Array.isArray(value)) value = value.join(',');
    if (typeof value !== 'string') return [];
    return value.split(',').map((v) => parseInt(v, 10)).filter((v) => Number.isInteger(v));
}

function parseBool(value) {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return null;
}

function parseInteger(value) {
    if (value === null || value === undefined || value === '') return null;
    const n = parseInt(value, 10);
    return Number.isInteger(n) ? n : null;
}

/**
 * Restore filters from a vue-router query object
 */
export function fromQuery(query = {}, overrides = {}) {
    const filters = defaultFilters(overrides);

    if (typeof query.filter === 'string') filters.filter = query.filter;
    if (typeof query.start === 'string') filters.start = query.start;
    if (typeof query.end === 'string') filters.end = query.end;
    if (typeof query.sort === 'string') filters.sort = query.sort;
    if (query.order === 'asc' || query.order === 'desc') filters.order = query.order;
    filters.attended = parseBool(query.attended) === true;

    for (const key of LIST_KEYS) filters[key] = parseList(query[key]);
    for (const key of BOOL_KEYS) filters[key] = parseBool(query[key]);
    for (const key of INT_KEYS) filters[key] = parseInteger(query[key]);

    return filters;
}

/**
 * Serialise filters to a flat object of string query params, omitting
 * anything at its default so URLs stay short
 */
export function toQuery(filters) {
    const query = {};
    const defaults = defaultFilters();

    if (filters.filter) query.filter = filters.filter;
    if (filters.start) query.start = filters.start;
    if (filters.end) query.end = filters.end;
    if (filters.attended) query.attended = 'true';

    for (const key of LIST_KEYS) {
        if (filters[key] && filters[key].length) query[key] = filters[key].join(',');
    }

    for (const key of BOOL_KEYS) {
        if (filters[key] === true || filters[key] === false) query[key] = String(filters[key]);
    }

    for (const key of INT_KEYS) {
        if (Number.isInteger(filters[key])) query[key] = String(filters[key]);
    }

    if (filters.sort && filters.sort !== defaults.sort) query.sort = filters.sort;
    if (filters.order && filters.order !== defaults.order) query.order = filters.order;

    return query;
}

/**
 * Apply filters to an /api/mission URL. `attended` is resolved against the
 * current user here since the API only knows about user IDs
 */
export function applyFilters(url, filters, auth) {
    url.searchParams.set('sort', filters.sort || 'start_ts');
    url.searchParams.set('order', filters.order || 'desc');

    if (filters.filter) url.searchParams.set('filter', filters.filter);
    if (filters.start) url.searchParams.set('start', filters.start);
    if (filters.end) url.searchParams.set('end', filters.end);
    if (filters.attended && auth && auth.id) url.searchParams.set('assigned', auth.id);

    for (const key of LIST_KEYS) {
        if (filters[key] && filters[key].length) url.searchParams.set(key, filters[key].join(','));
    }

    for (const key of BOOL_KEYS) {
        if (filters[key] === true || filters[key] === false) url.searchParams.set(key, String(filters[key]));
    }

    for (const key of INT_KEYS) {
        if (Number.isInteger(filters[key])) url.searchParams.set(key, String(filters[key]));
    }

    return url;
}

/**
 * Number of non-default filters applied (search text & sort excluded)
 */
export function activeCount(filters) {
    let count = 0;
    if (filters.start || filters.end) count++;
    if (filters.attended) count++;
    for (const key of LIST_KEYS) if (filters[key] && filters[key].length) count++;
    for (const key of BOOL_KEYS) if (filters[key] === true || filters[key] === false) count++;
    if (Number.isInteger(filters.users_min) || Number.isInteger(filters.users_max)) count++;
    return count;
}

/**
 * Local YYYY-MM-DD for a Date - the API date filters are calendar days
 */
export function isoDate(date) {
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const DATE_PRESETS = [
    { label: 'Last 7 Days', range: () => ({ start: isoDate(Date.now() - 7 * 86400000), end: '' }) },
    { label: 'Last 30 Days', range: () => ({ start: isoDate(Date.now() - 30 * 86400000), end: '' }) },
    { label: 'Last 90 Days', range: () => ({ start: isoDate(Date.now() - 90 * 86400000), end: '' }) },
    { label: 'This Year', range: () => ({ start: `${new Date().getFullYear()}-01-01`, end: '' }) },
    { label: 'Last Year', range: () => {
        const y = new Date().getFullYear() - 1;
        return { start: `${y}-01-01`, end: `${y}-12-31` };
    } },
];

export const SORT_OPTIONS = [
    { label: 'Newest First', sort: 'start_ts', order: 'desc' },
    { label: 'Oldest First', sort: 'start_ts', order: 'asc' },
    { label: 'Recently Updated', sort: 'updated', order: 'desc' },
    { label: 'Recently Created', sort: 'created', order: 'desc' },
    { label: 'Title A-Z', sort: 'title', order: 'asc' },
    { label: 'Title Z-A', sort: 'title', order: 'desc' },
];
