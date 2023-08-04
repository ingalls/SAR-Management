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
                        </div>
                        <div class='table-responsive'>
                            <table class="table card-table table-hover table-vcenter datatable">
                                <TableHeader
                                    v-model:sort='paging.sort'
                                    v-model:order='paging.order'
                                    v-model:header='header'
                                />
                                <tbody>
                                    <tr :key='user.id' v-for='(user, user_it) in list.users'>
                                        <template v-for='h in header'>
                                            <template v-if='h.display'>
                                                    HERE
                                            </template>
                                        </template>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import iam from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import TableHeader from './util/TableHeader.vue';
import TableFooter from './util/TableFooter.vue';
import {
    PlusIcon
} from 'vue-tabler-icons';
import {
    TablerBreadCrumb
} from '@tak-ps/vue-tabler';

export default {
    name: 'Calendar',
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
            paging: {
                filter: '',
                sort: 'Name',
                order: 'asc',
                limit: 10,
                page: 0
            },
            list: {
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
            this.schedules = await window.std('/api/schedule');
        },
        listSchedulesSchema: async function() {
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
        },
    },
    components: {
        PlusIcon,
        TablerBreadCrumb,
        TableHeader,
        TableFooter,
        NoAccess,
    },
}
</script>
