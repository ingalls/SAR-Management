<template>
    <div class='card col-12'>
        <div class='card-header'>
            <h3 class='card-title'>
                {{ mode === 'map' ? 'Mission Heat Map' : 'Mission Timeline' }}
            </h3>

            <div class='ms-auto btn-list align-items-center'>
                <div class='btn-group'>
                    <button
                        type='button'
                        class='btn'
                        :class='{ "active": mode === "map" }'
                        @click='mode = "map"'
                    >
                        Map
                    </button>
                    <button
                        type='button'
                        class='btn'
                        :class='{ "active": mode === "chart" }'
                        @click='mode = "chart"'
                    >
                        Chart
                    </button>
                </div>
                <TablerIconButton
                    :title='large ? "Minimize" : "Maximize"'
                    @click='large = !large'
                >
                    <IconArrowsMaximize
                        v-if='!large'
                        :size='32'
                        stroke='1'
                    />
                    <IconArrowsMinimize
                        v-else
                        :size='32'
                        stroke='1'
                    />
                </TablerIconButton>
            </div>
        </div>
        <div 
            v-show='mode === "map"'
            :style='{
                "height": large ? 600 + "px" : 350 + "px"
            }'
        >
            <div
                id='map'
                class='h-full w-full'
            />
        </div>
        <div
            v-show='mode === "chart"'
            class='card-body'
        >
            <div id='chart' />
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, nextTick } from 'vue';
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';
import bbox from '@turf/bbox';
import ApexCharts from 'apexcharts';

import {
    TablerIconButton
} from '@tak-ps/vue-tabler';
import {
    IconArrowsMaximize,
    IconArrowsMinimize
} from '@tabler/icons-vue'

const props = defineProps({
    missions: {
        type: Object,
        required: true
    }
});

let map = null;
let chart = null;
const mode = ref('map');
const large = ref(false);
const fc = reactive({
    type: 'FeatureCollection',
    features: []
});

watch(large, () => {
    nextTick(() => {
        map.resize();

        if (large.value) {
            map.scrollZoom.enable();
        } else {
            map.scrollZoom.disable();
        }
    });
});

watch(mode, () => {
    if (mode.value === 'map') {
        nextTick(() => {
            map.resize();
        });
    }
});

watch(() => props.missions, () => {
    fc.features = props.missions.items.filter((mission) => {
        return !!mission.location_geom;
    }).map((mission) => {
        return {
            type: 'Feature',
            properties: {},
            geometry: mission.location_geom
        }
    })

    if (!map || !map.getSource('points')) return;
    map.getSource('points').setData(fc);

    if (fc.features.length) {
        map.fitBounds(bbox(fc))
    }
});

const renderChart = async () => {
    const stats = await window.std('/api/mission/stats');

    const years = {};

    for (const key of Object.keys(stats.month)) {
        const year = key.split('-')[0];
        const month = parseInt(key.split('-')[1]) - 1;

        if (!years[year]) years[year] = new Array(12).fill(0);
        years[year][month] = stats.month[key];
    }

    const series = [];
    for (const year of Object.keys(years).sort()) {
        series.push({
            name: year,
            data: years[year]
        });
    }

    const options = {
        series: series,
        chart: {
            height: 350,
            type: 'bar',
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
            },
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent']
        },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        },
        fill: {
            opacity: 1
        },
    };

    if (chart) {
        chart.updateOptions(options);
    } else {
        chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();
    }
}

const mountMap = () => {
    const opts = {
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v11',
        projection: 'globe',
    }

    fc.features = props.missions.items.filter((mission) => {
        return !!mission.location_geom;
    }).map((mission) => {
        return {
            type: 'Feature',
            properties: {},
            geometry: mission.location_geom
        }
    })

    if (fc.features.length) {
        opts.bounds = bbox(fc)
    }

    mapboxgl.accessToken = 'pk.eyJ1IjoiaW5nYWxscyIsImEiOiJjbGt3eWx3bDUxNWY3M2NwZnJ5d3hjdXljIn0.J6HGVg8chm6rMsBQLRRxGw';
    map = new mapboxgl.Map(opts);
    map.scrollZoom.disable();
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', () => {
        map.addSource('points', { type: 'geojson', data: fc });

        map.addLayer({
            id: 'missions-heat',
            type: 'heatmap',
            source: 'points',
            maxzoom: 10,
            paint: {
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
                    9,
                    1,
                    10,
                    0
                    ]
                }
            }, 'waterway-label'
        );

        map.addLayer({
            'id': 'earthquakes-point',
            'type': 'circle',
            'source': 'points',
            'minzoom': 9,
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
                    9,
                    0,
                    10,
                    1
                ]
            }
        }, 'waterway-label');
    });
};

onMounted(async () => {
    nextTick(() => {
        mountMap();
        renderChart();
    });
});
</script>
