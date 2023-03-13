<template>
<div class="card">
    <div class="card-body">
        <div class="row">
            <div id="map" style='height: 350px;'></div>
        </div>
    </div>
</div>
</template>

<script>
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

export default {
    name: 'LocationCard',
    props: {
        modelValue: {
            type: [Object, null],
            required: true
        },
        disabled: {
            type: Boolean,
            default: true
        }
    },
    data: function() {
        return {
            geocoder: false,
            map: false,
        }
    },
    mounted: async function() {
        this.$nextTick(() => { this.mountMap(); });
    },
    methods: {
        mountMap: function() {
            mapboxgl.accessToken = 'pk.eyJ1IjoiaW5nYWxscyIsImEiOiJsUDF2STRrIn0.S0c3ZNH4HmseIdPXY-CTlA';
            this.map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/satellite-streets-v11',
                center: [ -105.477959, 39.116007 ],
                zoom: 5.5,
                projection: 'globe'
            });
            this.map.scrollZoom.disable();
            this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');

            this.geocoder = new MapboxGeocoder({
                accessToken: mapboxgl.accessToken,
                mapboxgl: this.map
            });

            this.map.addControl(this.geocoder, 'top-left');
            this.map.on('load', () => {
                if (this.modelValue) {
                    this.map.addSource('point', {
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
                    this.map.addSource('point', {
                        type: 'geojson',
                        data: {
                            type: 'FeatureCollection',
                            features: []
                        }
                    });
                }

                this.map.addLayer({
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

                if (!this.disabled) {
                    this.map.on('click', (e) => {
                        const geometry = {
                            type: 'Point',
                            coordinates: [e.lngLat.lng, e.lngLat.lat]
                        };

                        this.map.getSource('point').setData({
                            type: 'FeatureCollection',
                            features: [{
                                type: 'Feature',
                                properties: {},
                                geometry
                            }]
                        });

                        this.$emit('update:modelVaue', geometry);
                    });
                }
            });
        }
    }
}
</script>
