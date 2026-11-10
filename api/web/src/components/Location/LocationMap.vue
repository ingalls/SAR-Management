<template>
    <div class='location-map position-relative w-100 h-100'>
        <div
            ref='container'
            class='w-100 h-100'
        />

        <div class='location-map-basemap btn-group shadow-sm'>
            <button
                v-for='option in Basemaps'
                :key='option.id'
                type='button'
                class='btn btn-sm'
                :class='{ "btn-primary": basemap === option.id }'
                @click='setBasemap(option.id)'
                v-text='option.label'
            />
        </div>

        <button
            v-if='expandable'
            v-tooltip='"Open large map"'
            type='button'
            class='location-map-expand btn btn-icon shadow-sm'
            aria-label='Open large map'
            @click='emit("expand")'
        >
            <IconArrowsMaximize
                :size='20'
                stroke='1.5'
            />
        </button>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import mapboxgl from 'mapbox-gl'
import { mapboxToken } from '../../base/mapbox.ts';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { IconArrowsMaximize } from '@tabler/icons-vue';

const Basemaps = [
    { id: 'satellite', label: 'Satellite', style: 'mapbox://styles/mapbox/satellite-streets-v12' },
    { id: 'topo', label: 'Topo', style: 'mapbox://styles/mapbox/outdoors-v12' }
];

const props = defineProps({
    modelValue: {
        type: Object,
        default: null
    },
    editable: {
        type: Boolean,
        default: false
    },
    search: {
        type: Boolean,
        default: false
    },
    // When false, zooming requires ctrl + scroll so the page can still be scrolled past the map
    scrollZoom: {
        type: Boolean,
        default: false
    },
    expandable: {
        type: Boolean,
        default: false
    },
    // Initial { center, zoom } used in place of the default view
    camera: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['update:modelValue', 'expand']);

const container = ref(null);
const basemap = ref(storedBasemap());

let map = null;
let marker = null;
let emitted = null;

function storedBasemap() {
    try {
        const stored = localStorage.getItem('location-basemap');
        if (Basemaps.some((option) => option.id === stored)) return stored;
    } catch {
        // Storage is unavailable in private windows
    }

    return 'satellite';
}

function coordinates(geometry) {
    if (!geometry || !Array.isArray(geometry.coordinates)) return null;
    const [lng, lat] = geometry.coordinates;
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
    return [lng, lat];
}

function setBasemap(id) {
    if (basemap.value === id) return;
    basemap.value = id;

    try {
        localStorage.setItem('location-basemap', id);
    } catch {
        // Storage is unavailable in private windows
    }

    if (map) map.setStyle(Basemaps.find((option) => option.id === id).style);
}

function setMarker(lnglat) {
    if (!lnglat) {
        if (marker) marker.remove();
        marker = null;
        return;
    }

    if (marker) {
        marker.setLngLat(lnglat);
        return;
    }

    marker = new mapboxgl.Marker({
        color: '#d63939',
        draggable: props.editable
    }).setLngLat(lnglat).addTo(map);

    marker.on('dragend', () => {
        const { lng, lat } = marker.getLngLat();
        update([lng, lat]);
    });
}

function update(lnglat) {
    emitted = {
        type: 'Point',
        coordinates: [
            Math.round(lnglat[0] * 1e6) / 1e6,
            Math.round(lnglat[1] * 1e6) / 1e6
        ]
    };

    setMarker(emitted.coordinates);
    emit('update:modelValue', emitted);
}

watch(() => props.modelValue, () => {
    if (!map) return;

    const lnglat = coordinates(props.modelValue);
    setMarker(lnglat);

    // Only move the camera for changes that came from outside of the map
    const own = emitted && lnglat
        && emitted.coordinates[0] === lnglat[0]
        && emitted.coordinates[1] === lnglat[1];

    if (lnglat && !own) {
        map.flyTo({
            center: lnglat,
            zoom: Math.max(map.getZoom(), 13),
            duration: 800
        });
    }
});

function getCamera() {
    if (!map) return null;
    const center = map.getCenter();
    return { center: [center.lng, center.lat], zoom: map.getZoom() };
}

defineExpose({ getCamera });

onMounted(() => {
    mapboxToken();

    const lnglat = coordinates(props.modelValue);

    let view = { center: [-105.477959, 39.116007], zoom: 5.5 };
    if (props.camera) view = props.camera;
    else if (lnglat) view = { center: lnglat, zoom: 13 };

    map = new mapboxgl.Map({
        container: container.value,
        style: Basemaps.find((option) => option.id === basemap.value).style,
        center: view.center,
        zoom: view.zoom,
        projection: 'globe',
        cooperativeGestures: !props.scrollZoom
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new mapboxgl.ScaleControl({ unit: 'imperial' }), 'bottom-right');

    if (props.search) {
        const geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl,
            marker: false,
            placeholder: 'Search for a place or address'
        });

        geocoder.on('result', (e) => {
            if (props.editable && e.result && Array.isArray(e.result.center)) {
                update(e.result.center);
            }
        });

        // Without a listener the geocoder throws on a failed search, it already shows the failure in its results
        geocoder.on('error', (e) => {
            console.error('Location search failed', e.error);
        });

        map.addControl(geocoder, 'top-left');
    }

    setMarker(lnglat);

    if (props.editable) {
        map.getCanvas().style.cursor = 'crosshair';

        map.on('click', (e) => {
            update([e.lngLat.lng, e.lngLat.lat]);
        });
    }
});

onBeforeUnmount(() => {
    if (map) map.remove();
    map = null;
    marker = null;
});
</script>

<style scoped>
.location-map {
    min-height: 200px;
}

.location-map-basemap {
    position: absolute;
    left: 10px;
    bottom: 36px;
    z-index: 2;
}

.location-map-expand {
    position: absolute;
    right: 10px;
    bottom: 62px;
    z-index: 2;
}
</style>
