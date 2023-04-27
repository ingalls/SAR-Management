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
                <template v-if='!is_iam("Mission:View")'>
                    <div class="col-lg-12">
                        <NoAccess title='Missions'/>
                    </div>
                </template>
                <template v-else-if='loading.list'>
                    <div class="col-lg-12">
                        <TablerLoading/>
                    </div>
                </template>
                <template v-else>
                    <div class="col-lg-12">
                        <HeatMap :missions='list'/>
                    </div>
                    <div class="col-lg-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="d-flex">
                                    <div class="input-icon w-50">
                                        <input v-model='paging.filter' type="text" class="form-control" placeholder="Search…">
                                        <span class="input-icon-addon">
                                            <SearchIcon width='24'/>
                                        </span>
                                    </div>
                                    <div class='ms-auto'>
                                        <PlusIcon v-if='is_iam("Mission:Manage")' @click='$router.push("/mission/new")' class="cursor-pointer my-1"/>
                                    </div>
                                </div>
                            </div>
                            <table class="table card-table table-vcenter">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Location</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr :key='mission.id' v-for='mission in list.missions'>
                                        <td><a @click='$router.push(`/mission/${mission.id}`)' class='cursor-pointer' v-text='mission.title'></a></td>
                                        <td v-text='mission.location'></td>
                                        <td><EpochRange :start='mission.start_ts' :end='mission.end_ts'/></td>
                                    </tr>
                                </tbody>
                            </table>
                            <template v-if='!list.total'>
                                <None label='Missions' :create='false'/>
                            </template>
                            <TableFooter :limit='paging.limit' :total='list.total' @page='paging.page = $event'/>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import iam from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import None from './util/None.vue';
import EpochRange from './util/EpochRange.vue';
import TableFooter from './util/TableFooter.vue';
import HeatMap from './Mission/HeatMap.vue';
import {
    SearchIcon,
    PlusIcon
} from 'vue-tabler-icons';
import {
    TablerBreadCrumb,
    TablerLoading
} from '@tak-ps/vue-tabler';

export default {
    name: 'Missions',
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
                list: true
            },
            paging: {
                filter: '',
                assigned: null,
                limit: 100,
                page: 0
            },
            list: {
                total: 0,
                missions: []
            }
        }
    },
    watch: {
        paging: {
            deep: true,
            handler: async function() {
                this.$route.query = this.paging;
                await this.listMissions();
            },
        }
    },
    mounted: async function() {
        Object.assign(this.paging, this.$route.query);

        if (this.is_iam('Mission:View')) await this.listMissions();
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        listMissions: async function() {
            this.loading.list = true;
            const url = window.stdurl('/api/mission');
            url.searchParams.append('limit', this.paging.limit);
            url.searchParams.append('page', this.paging.page);
            url.searchParams.append('filter', this.paging.filter);
            url.searchParams.append('order', 'desc');
            if (this.paging.assigned) url.searchParams.append('assigned', this.paging.assigned);
            this.list = await window.std(url)
            this.loading.list = false;
        }
    },
    components: {
        None,
        SearchIcon,
        PlusIcon,
        NoAccess,
        EpochRange,
        TableFooter,
        TablerLoading,
        HeatMap,
        TablerBreadCrumb
    }
}
</script>
