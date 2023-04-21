<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <BreadCrumb/>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div class="col-lg-12">
                    <NoAccess v-if='!is_iam("Mission:View")' title='Missions'/>
                    <TablerLoading v-else-if='loading.list'/>
                    <div v-else class="card">
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
import BreadCrumb from './util/BreadCrumb.vue';
import {
    PlusIcon
} from 'vue-tabler-icons';
import {
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
      'paging.page': async function() {
           await this.listMissions();
       },
       'paging.filter': async function() {
           await this.listMissions();
       },

    },
    mounted: async function() {
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
            url.searchParams.append('order', 'asc');
            this.list = await window.std(url)
            this.loading.list = false;
        }
    },
    components: {
        None,
        PlusIcon,
        NoAccess,
        EpochRange,
        TableFooter,
        TablerLoading,
        BreadCrumb
    }
}
</script>
