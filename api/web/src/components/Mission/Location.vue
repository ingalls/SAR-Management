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

export default {
    name: 'LocationCard',
    data: function() {
        return {
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
            this.map.addControl(new mapboxgl.NavigationControl());
        },
    }
}
</script>
