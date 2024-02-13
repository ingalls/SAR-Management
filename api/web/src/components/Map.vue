<template>
<div class="col-12">
    <TablerLoading v-if='loading.list'/>
    <div v-else class="card-body">
        <div class="row">
            <div id="map" style='height: 1600px;'></div>
        </div>
    </div>
</div>
</template>

<script>
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';
import bbox from '@turf/bbox';

let map = null;

export default {
    name: 'HeatMapCard',
    mounted: async function() {
        await this.listMissions();

        this.$nextTick(() => {
            this.mountMap();
        });
    },
    data: function() {
        return {
            fc: {
                type: 'FeatureCollection',
                features: []
            },
            loading: {
                list: true
            },
            paging: {
                filter: '',
                assigned: null,
                limit: 100,
                sort: 'start_ts',
                order: 'desc',
                page: 0
            },
            list: {
                total: 0,
                missions: []
            }
        }
    },
    methods: {
        listMissions: async function() {
            this.loading.list = true;
            const url = window.stdurl('/api/mission');
            url.searchParams.append('limit', this.paging.limit);
            url.searchParams.append('page', this.paging.page);
            url.searchParams.append('filter', this.paging.filter);
            url.searchParams.append('order', this.paging.order);
            url.searchParams.append('sort', this.paging.sort);
            if (this.paging.assigned) url.searchParams.append('assigned', this.paging.assigned);
            this.list = await window.std(url)
            this.loading.list = false;
        },
        mountMap: function() {
            const opts = {
                container: 'map',
                style: 'mapbox://styles/mapbox/dark-v11',
                projection: 'globe',
            }

            this.fc.features = this.list.missions.filter((mission) => {
                return !!mission.location_geom;
            }).map((mission) => {
                return {
                    type: 'Feature',
                    properties: {},
                    geometry: mission.location_geom
                }
            })

            if (this.fc.features.length) {
                opts.bounds = bbox(this.fc)
            }

            mapboxgl.accessToken = 'pk.eyJ1IjoiaW5nYWxscyIsImEiOiJjbGt3eWx3bDUxNWY3M2NwZnJ5d3hjdXljIn0.J6HGVg8chm6rMsBQLRRxGw';
            map = new mapboxgl.Map(opts);
            map.scrollZoom.disable();
            map.addControl(new mapboxgl.NavigationControl(), 'top-right');

            map.on('load', () => {
                map.addSource('points', { type: 'geojson', data: this.fc });

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
        }
    }
}
</script>
