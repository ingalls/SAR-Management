/**
 * Issue list filter state shared by the Issues page, the Issues card and the
 * IssueFilters panel. Mirrors base/mission-filters.js
 */

export function defaultFilters(overrides = {}) {
    return {
        filter: '',
        status: 'open',
        tag: [],
        assigned: false,
        author: false,
        poll: null,
        sort: 'created',
        order: 'desc',
        ...overrides
    };
}

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

export function fromQuery(query = {}, overrides = {}) {
    const filters = defaultFilters(overrides);

    if (typeof query.filter === 'string') filters.filter = query.filter;
    if (['open', 'closed', 'all'].includes(query.status)) filters.status = query.status;
    if (typeof query.sort === 'string') filters.sort = query.sort;
    if (query.order === 'asc' || query.order === 'desc') filters.order = query.order;
    filters.tag = parseList(query.tag);
    filters.assigned = parseBool(query.assigned) === true;
    filters.author = parseBool(query.author) === true;
    filters.poll = parseBool(query.poll);

    return filters;
}

export function toQuery(filters) {
    const query = {};
    const defaults = defaultFilters();

    if (filters.filter) query.filter = filters.filter;
    if (filters.status && filters.status !== defaults.status) query.status = filters.status;
    if (filters.tag && filters.tag.length) query.tag = filters.tag.join(',');
    if (filters.assigned) query.assigned = 'true';
    if (filters.author) query.author = 'true';
    if (filters.poll === true || filters.poll === false) query.poll = String(filters.poll);
    if (filters.sort && filters.sort !== defaults.sort) query.sort = filters.sort;
    if (filters.order && filters.order !== defaults.order) query.order = filters.order;

    return query;
}

/**
 * Apply filters to an /api/issue URL. "assigned"/"author" are resolved to the
 * current user here since the API works on user IDs
 */
export function applyFilters(url, filters, auth) {
    url.searchParams.set('sort', filters.sort || 'created');
    url.searchParams.set('order', filters.order || 'desc');
    url.searchParams.set('status', filters.status || 'open');

    if (filters.filter) url.searchParams.set('filter', filters.filter);
    if (filters.tag && filters.tag.length) url.searchParams.set('tag', filters.tag.join(','));
    if (filters.assigned && auth && auth.id) url.searchParams.set('assigned', auth.id);
    if (filters.author && auth && auth.id) url.searchParams.set('author', auth.id);
    if (filters.poll === true || filters.poll === false) url.searchParams.set('poll', String(filters.poll));

    return url;
}

export function activeCount(filters) {
    let count = 0;
    if (filters.tag && filters.tag.length) count++;
    if (filters.assigned) count++;
    if (filters.author) count++;
    if (filters.poll === true || filters.poll === false) count++;
    return count;
}

export const STATUS_OPTIONS = [
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
    { value: 'all', label: 'All' },
];

export const SORT_OPTIONS = [
    { label: 'Newest First', sort: 'created', order: 'desc' },
    { label: 'Oldest First', sort: 'created', order: 'asc' },
    { label: 'Recently Updated', sort: 'updated', order: 'desc' },
    { label: 'Title A-Z', sort: 'title', order: 'asc' },
    { label: 'Title Z-A', sort: 'title', order: 'desc' },
];
