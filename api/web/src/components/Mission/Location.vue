<template>
    <div
        id='map'
        style='height: 350px;'
    />
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import { bbox } from '@turf/bbox';
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

const props = defineProps({
    modelValue: {
        type: Object,
    },
    search: {
        type: Boolean,
        default: true
    },
    disabled: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['update:modelValue']);

let map = null;
const loaded = ref(false);

watch(() => props.modelValue, () => {
    if (!loaded.value || !map || !map.getSource('point')) return;

    map.getSource('point').setData({
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            properties: {},
            geometry: props.modelValue
        }]
    });
});

const mountMap = () => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiaW5nYWxscyIsImEiOiJjbGt3eWx3bDUxNWY3M2NwZnJ5d3hjdXljIn0.J6HGVg8chm6rMsBQLRRxGw';
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/satellite-streets-v11',
        center: [ -105.477959, 39.116007 ],
        zoom: 5.5,
        projection: 'globe'
    });
    map.scrollZoom.disable();
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    if (props.search) {
        const geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: map
        });

        map.addControl(geocoder, 'top-left');
    }

    map.once('load', () => {
        const source = map.getSource('point');

        const fc = {
            type: 'FeatureCollection',
            features: props.modelValue ? [{
                type: 'Feature',
                properties: {},
                geometry: props.modelValue
            }] : []
        };

        if (source) {
            source.setData(fc)
        } else {
            map.addSource('point', {
                type: 'geojson',
                data: fc
            });
        }

        map.addLayer({
            id: 'point',
            type: 'circle',
            source: 'point',
            paint: {
                'circle-radius': 4,
                'circle-stroke-width': 2,
                'circle-color': 'red',
                'circle-stroke-color': 'white'
            }
        });

        if (props.modelValue) {
            map.fitBounds(bbox(props.modelValue), {
                padding: {
                    top: 100,
                    bottom: 100,
                    left: 100,
                    right: 100,
                },
                maxZoom: 16
            });
        }

        if (!props.disabled) {
            map.on('click', (e) => {
                const geometry = {
                    type: 'Point',
                    coordinates: [e.lngLat.lng, e.lngLat.lat]
                };

                map.getSource('point').setData({
                    type: 'FeatureCollection',
                    features: [{
                        type: 'Feature',
                        properties: {},
                        geometry
                    }]
                });

                emit('update:modelValue', geometry);
            });
        }

        loaded.value = true;
    });
};

onMounted(async () => {
    nextTick(() => { mountMap(); });
});
</script>
