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
            type: String,
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

            if (!this.disabled) {
                this.map.on('click', (e) => {
                    const coord = [e.lngLat.lng, e.lngLat.lat];
                });
            }
        }
    }
}
</script>
