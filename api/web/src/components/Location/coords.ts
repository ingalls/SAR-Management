/**
 * Parse & format WGS84 coordinates as Decimal Degrees, Degrees Decimal Minutes,
 * Degrees Minutes Seconds or UTM
 */

export type CoordFormat = 'dd' | 'ddm' | 'dms' | 'utm';

// [ longitude, latitude ]
export type LngLat = [number, number];

export const CoordFormats: Array<{ value: CoordFormat, label: string, example: string }> = [
    { value: 'dd', label: 'Decimal', example: '39.11601, -105.47796' },
    { value: 'ddm', label: 'Deg Min', example: '39° 06.960\' N, 105° 28.678\' W' },
    { value: 'dms', label: 'Deg Min Sec', example: '39° 06\' 57.6" N, 105° 28\' 40.7" W' },
    { value: 'utm', label: 'UTM', example: '13S 458680E 4329759N' }
];

const A = 6378137;
const F = 1 / 298.257223563;
const K0 = 0.9996;
const N = F / (2 - F);
const N2 = N * N;
const N3 = N2 * N;
const RADIUS = (A / (1 + N)) * (1 + N2 / 4 + (N2 * N2) / 64);
const ALPHA = [
    N / 2 - (2 * N2) / 3 + (5 * N3) / 16,
    (13 * N2) / 48 - (3 * N3) / 5,
    (61 * N3) / 240
];
const BETA = [
    N / 2 - (2 * N2) / 3 + (37 * N3) / 96,
    N2 / 48 + N3 / 15,
    (17 * N3) / 480
];
const DELTA = [
    2 * N - (2 * N2) / 3 - 2 * N3,
    (7 * N2) / 3 - (8 * N3) / 5,
    (56 * N3) / 15
];
const BANDS = 'CDEFGHJKLMNPQRSTUVWX';

const rad = (deg: number): number => deg * Math.PI / 180;
const deg = (rad: number): number => rad * 180 / Math.PI;

export interface UTM {
    zone: number;
    band: string;
    easting: number;
    northing: number;
}

export function toUTM(lnglat: LngLat): UTM | null {
    const [lng, lat] = lnglat;
    if (lat < -80 || lat > 84) return null;

    const zone = Math.min(60, Math.floor((lng + 180) / 6) + 1);
    const phi = rad(lat);
    const lambda = rad(lng - ((zone - 1) * 6 - 180 + 3));

    const c = 2 * Math.sqrt(N) / (1 + N);
    const t = Math.sinh(Math.atanh(Math.sin(phi)) - c * Math.atanh(c * Math.sin(phi)));
    const xi = Math.atan2(t, Math.cos(lambda));
    const eta = Math.atanh(Math.sin(lambda) / Math.sqrt(1 + t * t));

    let easting = eta;
    let northing = xi;
    for (let j = 1; j <= 3; j++) {
        easting += ALPHA[j - 1] * Math.cos(2 * j * xi) * Math.sinh(2 * j * eta);
        northing += ALPHA[j - 1] * Math.sin(2 * j * xi) * Math.cosh(2 * j * eta);
    }

    return {
        zone,
        band: BANDS[Math.min(19, Math.floor((lat + 80) / 8))],
        easting: 500000 + K0 * RADIUS * easting,
        northing: (lat < 0 ? 10000000 : 0) + K0 * RADIUS * northing
    };
}

export function fromUTM(zone: number, south: boolean, easting: number, northing: number): LngLat {
    const xi = (northing - (south ? 10000000 : 0)) / (K0 * RADIUS);
    const eta = (easting - 500000) / (K0 * RADIUS);

    let xip = xi;
    let etap = eta;
    for (let j = 1; j <= 3; j++) {
        xip -= BETA[j - 1] * Math.sin(2 * j * xi) * Math.cosh(2 * j * eta);
        etap -= BETA[j - 1] * Math.cos(2 * j * xi) * Math.sinh(2 * j * eta);
    }

    const chi = Math.asin(Math.sin(xip) / Math.cosh(etap));
    let phi = chi;
    for (let j = 1; j <= 3; j++) {
        phi += DELTA[j - 1] * Math.sin(2 * j * chi);
    }

    const lambda = Math.atan2(Math.sinh(etap), Math.cos(xip));

    return [
        (zone - 1) * 6 - 180 + 3 + deg(lambda),
        deg(phi)
    ];
}

function round(lnglat: LngLat): LngLat {
    return [
        Math.round(lnglat[0] * 1e6) / 1e6,
        Math.round(lnglat[1] * 1e6) / 1e6
    ];
}

function valid(lnglat: LngLat): boolean {
    return Number.isFinite(lnglat[0]) && Number.isFinite(lnglat[1])
        && Math.abs(lnglat[0]) <= 180 && Math.abs(lnglat[1]) <= 90;
}

function parseUTM(input: string): LngLat | null {
    const match = input.match(/^(\d{1,2})\s*([C-HJ-NP-X])?[\s,]+(\d{6,7}(?:\.\d+)?)\s*(?:M?E)?[\s,]+(\d{1,8}(?:\.\d+)?)\s*(?:M?N)?$/);
    if (!match) return null;

    const zone = Number(match[1]);
    if (zone < 1 || zone > 60) return null;

    const easting = Number(match[3]);
    const northing = Number(match[4]);
    if (easting < 100000 || easting >= 1000000 || northing > 10000000) return null;

    // The letter is a latitude band, bands before N are in the southern hemisphere
    const lnglat = fromUTM(zone, !!match[2] && match[2] < 'N', easting, northing);

    return valid(lnglat) ? round(lnglat) : null;
}

function parseComponent(tokens: string[]): number | null {
    const parts = tokens.map(Number);
    if (parts.some((part) => !Number.isFinite(part))) return null;

    const [d, m = 0, s = 0] = parts;
    if (m < 0 || m >= 60 || s < 0 || s >= 60) return null;
    // Only the final component can carry a fraction
    if (tokens.slice(0, -1).some((token) => token.includes('.'))) return null;

    const value = Math.abs(d) + m / 60 + s / 3600;
    return tokens[0].startsWith('-') ? -value : value;
}

function parseLatLng(input: string): LngLat | null {
    const cleaned = input
        .replace(/(LATITUDE|LONGITUDE|LAT|LNG|LONG|LON)\s*[:=]?/g, ' ')
        .replace(/[°º'"′″’”,;:]/g, ' ')
        .replace(/\bDEG\b/g, ' ');

    if (/[^\d\s.+\-NSEW]/.test(cleaned)) return null;

    const numbers = cleaned.match(/[-+]?\d+(?:\.\d+)?/g) || [];
    const letters = cleaned.match(/[NSEW]/g) || [];

    if (![2, 4, 6].includes(numbers.length)) return null;
    if (![0, 2].includes(letters.length)) return null;

    const half = numbers.length / 2;
    let first = parseComponent(numbers.slice(0, half));
    let second = parseComponent(numbers.slice(half));
    if (first === null || second === null) return null;

    let lnglat: LngLat;

    const [a, b] = letters;
    if (a && b) {
        const firstIsLat = 'NS'.includes(a);
        if (firstIsLat === 'NS'.includes(b)) return null;
        // A hemisphere and a negative sign together is ambiguous
        if (first < 0 || second < 0) return null;

        if ('SW'.includes(a)) first = -first;
        if ('SW'.includes(b)) second = -second;

        lnglat = firstIsLat ? [second, first] : [first, second];
    } else if (Math.abs(first) > 90 && Math.abs(second) <= 90) {
        lnglat = [first, second];
    } else {
        lnglat = [second, first];
    }

    return valid(lnglat) ? round(lnglat) : null;
}

/**
 * Parse user entered coordinates, returning null if they could not be understood.
 * Unlabelled pairs are read as latitude then longitude unless only the reverse is possible
 */
export function parseCoordinates(input: string): LngLat | null {
    const text = input.trim().toUpperCase().replace(/\s+/g, ' ');
    if (!text) return null;

    return parseUTM(text) || parseLatLng(text);
}

const pad = (value: number, width: number, decimals = 0): string => {
    return value.toFixed(decimals).padStart(width + (decimals ? decimals + 1 : 0), '0');
};

export function formatCoordinates(lnglat: LngLat, format: CoordFormat = 'dd'): string {
    const [lng, lat] = lnglat;
    const ns = lat < 0 ? 'S' : 'N';
    const ew = lng < 0 ? 'W' : 'E';

    if (format === 'utm') {
        const utm = toUTM(lnglat);
        if (utm) return `${utm.zone}${utm.band} ${Math.round(utm.easting)}E ${Math.round(utm.northing)}N`;
    } else if (format === 'ddm') {
        const part = (value: number, width: number): string => {
            const total = Math.round(Math.abs(value) * 60000);
            return `${pad(Math.floor(total / 60000), width)}° ${pad((total % 60000) / 1000, 2, 3)}'`;
        };

        return `${part(lat, 2)} ${ns}, ${part(lng, 3)} ${ew}`;
    } else if (format === 'dms') {
        const part = (value: number, width: number): string => {
            const total = Math.round(Math.abs(value) * 36000);
            return `${pad(Math.floor(total / 36000), width)}° ${pad(Math.floor((total % 36000) / 600), 2)}' ${pad((total % 600) / 10, 2, 1)}"`;
        };

        return `${part(lat, 2)} ${ns}, ${part(lng, 3)} ${ew}`;
    }

    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}
