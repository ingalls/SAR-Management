<template>
    <div class='card'>
        <div class='card-body'>
            <div class='d-flex'>
                <h3 class='card-title'>
                    User Locations
                </h3>

                <div class='ms-auto'>
                    <div class='btn-list'>
                        <button
                            data-bs-toggle='dropdown'
                            type='button'
                            class='btn dropdown-toggle dropdown-toggle-split'
                            aria-expanded='false'
                        />
                        <div
                            class='dropdown-menu dropdown-menu-end'
                            style=''
                        >
                            <a
                                class='dropdown-item'
                                href='#'
                                @click='getExport'
                            >Export</a>
                        </div>
                    </div>
                </div>
            </div>
            <div class='row'>
                <div
                    id='map'
                    style='height: 350px;'
                />
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
            scale: 7,
        }
    },
    mounted: function() {
        this.fetch();
        this.$nextTick(() => { this.mountMap(); });
    },
    methods: {
        mountMap: function() {
            mapboxgl.accessToken = 'pk.eyJ1IjoiaW5nYWxscyIsImEiOiJsUDF2STRrIn0.S0c3ZNH4HmseIdPXY-CTlA';
            this.map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [-74.5, 40],
                zoom: 9,
                projection: 'globe'
            });
        },
        fetch: async function() {
            //const list = await window.std('/api/location');
        },
        getExport: async function() {
            const url = new URL('/api/total/export', window.location.origin);
            // Allow serving through Vue for hotloading
            if (url.hostname === 'localhost') url.port = '4999'
            window.open(url, "_blank")
        }
    }
}
</script>
