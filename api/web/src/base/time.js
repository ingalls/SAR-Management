import moment from 'moment';

/**
 * Parse a timestamp from the API. Postgres returns timestamptz columns as
 * "YYYY-MM-DD HH:mm:ss.SSS-06" which neither moment nor Date parse reliably
 * (the space and the colon-less offset) - normalise to ISO 8601 first
 */
export function parseTimestamp(ts) {
    if (ts === null || ts === undefined || ts === '') return moment.invalid();
    if (typeof ts === 'number' || ts instanceof Date) return moment(ts);

    const normalised = String(ts)
        .replace(' ', 'T')
        .replace(/([+-]\d{2})$/, '$1:00');

    return moment(normalised);
}

/**
 * Relative time ie: "3 hours ago"
 */
export function fromNow(ts) {
    const m = parseTimestamp(ts);
    return m.isValid() ? m.fromNow() : '';
}
