<template>
<div class="card">
    <div class="card-body">
        <div class="d-flex">
            <h3 class="card-title">Top User Groups</h3>

            <div class='ms-auto'>
                <div class="btn-list">
                    <TablerSelect
                        :default='current'
                        :values='["Category", "Agency", "SubAgency", "Title", "ZipCode"]'
                        @select='fetch($event)'
                    />

                    <button data-bs-toggle="dropdown" type="button" class="btn dropdown-toggle dropdown-toggle-split" aria-expanded="false"></button>
                    <div class="dropdown-menu dropdown-menu-end" style="">
                        <a @click='getExport' class="dropdown-item" href="#">Export</a>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <table class="table card-table table-vcenter">
                <thead>
                    <tr>
                        <th>User Group</th>
                        <th colspan="2">Users</th>
                    </tr>
                </thead>
                <tbody>
                    <tr :key='a.name' v-for='a in agg'>
                        <td v-text='a.name'></td>
                        <td v-text='a.count'></td>
                        <td class="w-50">
                            <div class="progress progress-xs">
                                <div
                                    class="progress-bar bg-primary"
                                    :style='`width: ${a.percent * 100}%;`'
                                ></div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
</template>

<script>
import TablerSelect from '../util/Select.vue';

export default {
    name: 'TopStats',
    data: function() {
        return {
            agg: {},
            current: 'Agency',
            convert: {
                Category: 'businesscategory',
                Agency: 'o',
                SubAgency: 'ou',
                Title: 'title',
                ZipCode: 'postalcode'
            }
        }
    },
    mounted: function() {
        this.fetch();
    },
    methods: {
        fetch: async function(current) {
            if (this.current === current) return;
            if (current) this.current = current;

            const agg = await window.std(`/api/aggregate/${this.convert[this.current]}`);

            let aggs = [];
            let total = 0;
            for (const name in agg) {
                total += agg[name];
                aggs.push({
                    name,
                    count: agg[name]
                });
            }

            this.agg = aggs.map((agg) => {
                agg.percent = agg.count / total;
                return agg;
            }).sort((a, b) => {
                return b.percent - a.percent;
            }).splice(0, 6);
        },
        getExport: async function() {
            const url = new URL('/api/total/export', window.location.origin);
            // Allow serving through Vue for hotloading
            if (url.hostname === 'localhost') url.port = '4999'
            window.open(url, "_blank")
        }
    },
    components: {
        TablerSelect
    }
}
</script>
