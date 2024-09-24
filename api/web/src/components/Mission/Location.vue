<template>
    <div id="map" style='height: 350px;'></div>
</template>

<script>
import { bbox } from '@turf/bbox';
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

let map = null;

export default {
    name: 'LocationCard',
    props: {
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
    },
    data: function() {
        return {
            loaded: false
        }
    },
    watch: {
        modelValue: function() {
            if (!this.loaded || !map.getSource('point')) return;

            map.getSource('point').setData({
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: this.modelValue
                }]
            });
        }
    },
    mounted: async function() {
        this.$nextTick(() => { this.mountMap(); });
    },
    methods: {
        mountMap: function() {
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

            if (this.search) {
                const geocoder = new MapboxGeocoder({
                    accessToken: mapboxgl.accessToken,
                    mapboxgl: map
                });

                map.addControl(geocoder, 'top-left');
            }

            map.once('load', () => {
                if (this.modelValue) {
                    map.addSource('point', {
                        type: 'geojson',
                        data: {
                            type: 'FeatureCollection',
                            features: [{
                                type: 'Feature',
                                properties: {},
                                geometry: this.modelValue
                            }]
                        }
                    });
                } else {
                    map.addSource('point', {
                        type: 'geojson',
                        data: {
                            type: 'FeatureCollection',
                            features: []
                        }
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

                if (this.modelValue) {
                    map.fitBounds(bbox(this.modelValue), {
                        padding: {
                            top: 100,
                            bottom: 100,
                            left: 100,
                            right: 100,
                        },
                        maxZoom: 16
                    });
                }

                if (!this.disabled) {
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

                        this.$emit('update:modelValue', geometry);
                    });
                }

                this.loaded = true;
            });
        }
    }
}
</script>
