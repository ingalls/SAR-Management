<template>
    <div>
        <div class='page-wrapper'>
            <div class='page-header d-print-none'>
                <div class='container-xl'>
                    <div class='row g-2 align-items-center'>
                        <div class='col d-flex'>
                            <TablerBreadCrumb />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class='page-body'>
            <div class='container-xl'>
                <div class='row row-deck row-cards'>
                    <template v-if='!is_iam("Mission:View")'>
                        <div class='col-lg-12'>
                            <NoAccess title='Missions' />
                        </div>
                    </template>
                    <template v-else>
                        <div
                            v-if='!loading.initial'
                            class='col-lg-12'
                        >
                            <HeatMap :missions='list' />
                        </div>
                        <div class='col-lg-12'>
                            <CardMissions
                                label='Missions'
                                :search='true'
                                :auth='auth'
                                :iam='iam'
                                :limit='20'
                            />
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
import CardMissions from './cards/Missions.vue';
import TableHeader from './util/TableHeader.vue';
import HeatMap from './Mission/HeatMap.vue';
import TeamBadge from './util/TeamBadge.vue';

import {
    TablerNone,
    TablerEpochRange,
    TablerBreadCrumb,
} from '@tak-ps/vue-tabler';

export default {
    name: 'Missions',
    components: {
        TablerNone,
        NoAccess,
        TablerEpochRange,
        TableHeader,
        HeatMap,
        CardMissions,
        TeamBadge,
        TablerBreadCrumb
    },
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
                items: []
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

    }
}
</script>
