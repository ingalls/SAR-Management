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
                                :initial='initial'
                                @query='onQuery'
                            />
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import iamHelper from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import CardMissions from './cards/Missions.vue';
import HeatMap from './Mission/HeatMap.vue';
import { fromQuery, applyFilters } from '../base/mission-filters.js';

import {
    TablerBreadCrumb,
} from '@tak-ps/vue-tabler';

const route = useRoute();
const router = useRouter();

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

// Filters restored from the URL so filtered views are shareable links
const initial = fromQuery(route.query);

const list = reactive({
    total: 0,
    items: []
})

function is_iam(permission) {
    return iamHelper(props.iam, props.auth, permission)
}

/**
 * The heat map shows every mission matching the current filters (not just
 * the current page of the list) so the map and list always agree
 */
async function listMissions(filters) {
    loading.list = true;
    const url = window.stdurl('/api/mission');
    applyFilters(url, filters, props.auth);
    url.searchParams.set('limit', '500');
    url.searchParams.set('page', '0');
    const result = await window.std(url)
    list.total = result.total;
    list.items = result.items;
    loading.list = false;
    loading.initial = false;
}

async function onQuery(query) {
    await router.replace({ query });
    await listMissions(fromQuery(query));
}

onMounted(async () => {
    if (is_iam('Mission:View')) await listMissions(initial);
})
</script>
