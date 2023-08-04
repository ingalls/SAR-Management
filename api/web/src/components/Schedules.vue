<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <TablerBreadCrumb/>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div class="col-lg-12">
                    <div class="card">
                        <div class="card-header">
                            <h1 class='card-title'>On Call Schedules</h1>

                            <div class='ms-auto btn-list'>
                                <PlusIcon @click='$route.push("/schedule/new")' class='cursor-pointer'/>
                            </div>
                        </div>
                        <template v-if='loading.schema'>
                            <TablerLoading desc='Loading Schedules'/>
                        </template>
                        <template v-else-if='!list.schedules.length'>
                            <None label='Schedules' :create='false'/>
                        </template>
                        <div v-else class='table-responsive'>
                            <table class="table card-table table-hover table-vcenter datatable">
                                <TableHeader
                                    v-model:sort='paging.sort'
                                    v-model:order='paging.order'
                                    v-model:header='header'
                                />
                                <tbody>
                                    <tr :key='schedule.id' v-for='schedule in list.schedules'>
                                        <template v-for='h in header'>
                                            <template v-if='h.display'>
                                                <span v-text='schedule[h.name]'/>
                                            </template>
                                        </template>
                                    </tr>
                                </tbody>
                            </table>

                            <TablerLoading v-if='loading.list'/>
                            <TableFooter v-else :limit='paging.limit' :total='list.total' @page='paging.page = $event'/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

ading
<script>
import iam from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import None from './util/None.vue';
import TableHeader from './util/TableHeader.vue';
import TableFooter from './util/TableFooter.vue';
import {
    PlusIcon
} from 'vue-tabler-icons';
import {
    TablerLoading,
    TablerBreadCrumb
} from '@tak-ps/vue-tabler';

export default {
    name: 'OnCall',
    props: {
        iam: {
            type: Object,
            required: true
        },
        auth: {
            type: Object,
            required: true
        }
    },
    data: function() {
        return {
            loading: {
                schema: true,
                list: true
            },
            paging: {
                filter: '',
                sort: 'Name',
                order: 'asc',
                limit: 10,
                page: 0
            },
            header: [],
            list: {
                total: 0,
                schedules: []
            }
        }
    },
    mounted: async function() {
        if (!this.is_iam("Oncall:View")) return;

        await this.listSchedulesSchema();
        await this.listSchedules();
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        listSchedules: async function() {
            this.loading.list = true;
            this.schedules = await window.std('/api/schedule');
            this.loading.list = false;
        },
        listSchedulesSchema: async function() {
            this.loading.schema = true;
            const schema = await window.std('/api/schema?method=GET&url=/schedule');
            this.header = ['name', ].map((h) => {
                return { name: h, display: true };
            });

            this.header.push(...schema.query.properties.sort.enum.map((h) => {
                return {
                    name: h,
                    display: false
                }
            }).filter((h) => {
                for (const hknown of this.header) {
                    if (hknown.name === h.name) return false;
                }
                return true;
            }));
            this.loading.schema = false;
        },
    },
    components: {
        None,
        PlusIcon,
        TablerLoading,
        TablerBreadCrumb,
        TableHeader,
        TableFooter,
        NoAccess,
    },
}
</script>
