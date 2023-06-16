<template>
<div class="card">
    <div class="card-body">
        <div class="d-flex">
            <h3 class="card-title">Registered Users</h3>

            <div class='ms-auto'>
                <div class="btn-list">
                    <TablerSelect
                        :values='["Last 30 Days", "Month To Date", "Current Quarter", "Year To Date", "All Time"]'
                    />

                    <button data-bs-toggle="dropdown" type="button" class="btn dropdown-toggle dropdown-toggle-split" aria-expanded="false"></button>
                    <div class="dropdown-menu dropdown-menu-end" style="">
                        <a @click='getExport' class="dropdown-item" href="#">Export</a>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <ApexChart
                type='line'
                height='350'
                :options='{
                    chart: {
                        id: "total-users",
                        zoom: {
                            enabled: false
                        },
                    },
                    xaxis: {
                        type: "datetime"
                    }
                }'
                :series='series'
            />
        </div>
    </div>
</div>
</template>

<script>
import VueApexCharts from 'vue3-apexcharts'
import TablerSelect from '../util/Select.vue';

export default {
    name: 'RegisteredCard',
    data: function() {
        return {
            scale: 7,
            series: [{
                name: 'users',
                data: []
            }]
        }
    },
    mounted: function() {
        this.fetch();
    },
    methods: {
        fetch: async function() {
            const list = await window.std('/api/total');

            this.series[0].data = list.totals.map((total) => {
                return { x: new Date(total.dt), y: total.count };
            });
        },
        getExport: async function() {
            const url = new URL('/api/total/export', window.location.origin);
            // Allow serving through Vue for hotloading
            if (url.hostname === 'localhost') url.port = '4999'
            window.open(url, "_blank")
        }
    },
    components: {
        TablerSelect,
        ApexChart: VueApexCharts
    }
}
</script>
