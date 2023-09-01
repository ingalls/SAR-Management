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
                <template v-else>
                    <div v-if='!loading.initial' class="col-lg-12">
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
                            <table class="table table-hover card-table table-vcenter">
                                <TableHeader
                                    v-model:sort='paging.sort'
                                    v-model:order='paging.order'
                                    v-model:header='header'
                                />
                                <tbody>
                                    <tr @click='$router.push(`/mission/${mission.id}`)' :key='mission.id' v-for='mission in list.missions' class='cursor-pointer'>
                                        <template v-for='h in header'>
                                            <template v-if='h.display'>
                                                <td v-if='h.name === "title"'>
                                                    <div class='row'>
                                                        <div class='d-flex'>
                                                            <a @click='$router.push(`/mission/${mission.id}`)' class='cursor-pointer' v-text='mission.title'></a>
                                                            <div class='ms-auto btn-list'>
                                                                <template v-for='team in mission.teams'>
                                                                    <TeamBadge :team='team'/>
                                                                </template>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td v-else-if='h.name === "date"'>
                                                    <TablerEpochRange :start='mission.start_ts' :end='mission.end_ts'/>
                                                </td>
                                                <td v-else>
                                                    <span v-text='mission[h.name]'></span>
                                                </td>
                                            </template>
                                        </template>
                                    </tr>
                                </tbody>
                            </table>
                            <template v-if='!list.total'>
                                <TablerNone label='Missions' :create='false'/>
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
import TableFooter from './util/TableFooter.vue';
import TableHeader from './util/TableHeader.vue';
import HeatMap from './Mission/HeatMap.vue';
import TeamBadge from './util/TeamBadge.vue';
import {
    SearchIcon,
    PlusIcon
} from 'vue-tabler-icons';
import {
    TablerNone,
    TablerEpochRange,
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
                initial: true,
                list: true
            },
            header: [],
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

        await this.listMissionsSchema();
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
            url.searchParams.append('order', this.paging.order);
            url.searchParams.append('sort', this.paging.sort);
            if (this.paging.assigned) url.searchParams.append('assigned', this.paging.assigned);
            this.list = await window.std(url)
            this.loading.list = false;
            this.loading.initial = false;
        },
        listMissionsSchema: async function() {
            const schema = await window.std('/api/schema?method=GET&url=/mission');
            this.header = ['title', 'externalid', 'location', 'date'].map((h) => {
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
        TablerNone,
        SearchIcon,
        PlusIcon,
        NoAccess,
        TablerEpochRange,
        TableFooter,
        TablerLoading,
        TableHeader,
        HeatMap,
        TeamBadge,
        TablerBreadCrumb
    }
}
</script>
