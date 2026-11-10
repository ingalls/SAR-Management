import mapboxgl from 'mapbox-gl';

/**
 * Apply the public Mapbox token supplied at build time via VITE_MAPBOX_TOKEN
 */
export function mapboxToken(): string {
    const token = import.meta.env.VITE_MAPBOX_TOKEN || '';

    if (!token) console.error('VITE_MAPBOX_TOKEN is not set, maps will not load');

    mapboxgl.accessToken = token;

    return token;
}
