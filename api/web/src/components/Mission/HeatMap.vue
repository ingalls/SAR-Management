<template>
<div class="card col-12">
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
import bbox from '@turf/bbox';

export default {
    name: 'HeatMapCard',
    mounted: async function() {
        this.$nextTick(() => { this.mountMap(); });
    },
    props: {
        missions: {
            type: Object,
            required: true
        }
    },
    methods: {
        mountMap: function() {
            const data = {
                type: 'FeatureCollection',
                features: this.missions.missions.filter((mission) => {
                    return !!mission.location_geom;
                }).map((mission) => {
                    return {
                        type: 'Feature',
                        properties: {},
                        geometry: mission.location_geom
                    }
                })
            };

            mapboxgl.accessToken = 'pk.eyJ1IjoiaW5nYWxscyIsImEiOiJsUDF2STRrIn0.S0c3ZNH4HmseIdPXY-CTlA';
            const map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/dark-v11',
                projection: 'globe',
                bounds: bbox(data)
            });
            map.scrollZoom.disable();
            map.addControl(new mapboxgl.NavigationControl(), 'top-right');

            map.on('load', () => {

                map.addSource('points', { type: 'geojson', data });


                map.addLayer({
                    'id': 'missions-heat',
                    'type': 'heatmap',
                    'source': 'points',
                    'maxzoom': 9,
                    'paint': {
                    // Increase the heatmap weight based on frequency and property magnitude
                    'heatmap-weight': [
                    'interpolate',
                    ['linear'],
                    ['get', 'mag'],
                    0,
                    0,
                    6,
                    1
                    ],
                    // Increase the heatmap color weight weight by zoom level
                    // heatmap-intensity is a multiplier on top of heatmap-weight
                    'heatmap-intensity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    0,
                    1,
                    9,
                    3
                    ],
                    // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                    // Begin color ramp at 0-stop with a 0-transparancy color
                    // to create a blur-like effect.
                    'heatmap-color': [
                        'interpolate',
                    ['linear'],
                    ['heatmap-density'],
                    0,
                    'rgba(33,102,172,0)',
                    0.2,
                    'rgb(103,169,207)',
                    0.4,
                    'rgb(209,229,240)',
                    0.6,
                    'rgb(253,219,199)',
                    0.8,
                    'rgb(239,138,98)',
                    1,
                    'rgb(178,24,43)'
                    ],
                    // Adjust the heatmap radius by zoom level
                    'heatmap-radius': [
                        'interpolate',
                    ['linear'],
                    ['zoom'],
                    0,
                    2,
                    9,
                    20
                    ],
                    // Transition from heatmap to circle layer by zoom level
                    'heatmap-opacity': [
                        'interpolate',
                    ['linear'],
                    ['zoom'],
                    7,
                    1,
                    9,
                    0
                    ]
                    }
                },
                    'waterway-label'
                        );

map.addLayer(
{
'id': 'earthquakes-point',
'type': 'circle',
'source': 'points',
'minzoom': 7,
'paint': {
// Size circle radius by earthquake magnitude and zoom level
'circle-radius': [
'interpolate',
['linear'],
['zoom'],
7,
['interpolate', ['linear'], ['get', 'mag'], 1, 1, 6, 4],
16,
['interpolate', ['linear'], ['get', 'mag'], 1, 5, 6, 50]
],
// Color circle by earthquake magnitude
'circle-color': [
'interpolate',
['linear'],
['get', 'mag'],
1,
'rgba(33,102,172,0)',
2,
'rgb(103,169,207)',
3,
'rgb(209,229,240)',
4,
'rgb(253,219,199)',
5,
'rgb(239,138,98)',
6,
'rgb(178,24,43)'
],
'circle-stroke-color': 'white',
'circle-stroke-width': 1,
// Transition from heatmap to circle layer by zoom level
'circle-opacity': [
'interpolate',
['linear'],
['zoom'],
7,
0,
8,
1
]
}
},
'waterway-label'
);

            });
        }
    }
}
</script>