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

<script setup>
import { reactive, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import iamHelper from '../iam.js';
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

const route = useRoute();

const props = defineProps({
    iam: {
        type: Object,
        required: true
    },
    auth: {
        type: Object,
        required: true
    }
})

const loading = reactive({
    initial: true,
    list: true
})

const header = reactive([])

const paging = reactive({
    filter: '',
    assigned: null,
    limit: 100,
    sort: 'start_ts',
    order: 'desc',
    page: 0
})

const list = reactive({
    total: 0,
    items: []
})

function is_iam(permission) { 
    return iamHelper(props.iam, props.auth, permission) 
}

async function listMissions() {
    loading.list = true;
    const url = window.stdurl('/api/mission');
    url.searchParams.append('limit', paging.limit);
    url.searchParams.append('page', paging.page);
    url.searchParams.append('filter', paging.filter);
    url.searchParams.append('order', paging.order);
    url.searchParams.append('sort', paging.sort);
    if (paging.assigned) url.searchParams.append('assigned', paging.assigned);
    const result = await window.std(url)
    list.total = result.total;
    list.items = result.items;
    loading.list = false;
    loading.initial = false;
}

async function listMissionsSchema() {
    const schema = await window.std('/api/schema?method=GET&url=/mission');
    const baseHeaders = ['title', 'externalid', 'location', 'date'].map((h) => {
        return { name: h, display: true };
    });
    
    header.splice(0, header.length, ...baseHeaders);

    header.push(...schema.query.properties.sort.enum.map((h) => {
        return {
            name: h,
            display: false
        }
    }).filter((h) => {
        for (const hknown of header) {
            if (hknown.name === h.name) return false;
        }
        return true;
    }));
}

watch(paging, async () => {
    route.query = paging;
    await listMissions();
}, { deep: true })

onMounted(async () => {
    Object.assign(paging, route.query);

    await listMissionsSchema();
    if (is_iam('Mission:View')) await listMissions();
})
</script>
