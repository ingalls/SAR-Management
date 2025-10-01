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
                    <div class='col-lg-12'>
                        <div class='card'>
                            <div class='card-header'>
                                <h1 class='card-title'>
                                    On Call Schedules
                                </h1>

                                <div class='ms-auto btn-list'>
                                    <IconPlus
                                        :size='32'
                                        stroke='1'
                                        class='cursor-pointer'
                                        @click='$router.push("/schedule/new")'
                                    />
                                </div>
                            </div>
                            <template v-if='loading.list'>
                                <TablerLoading desc='Loading Schedules' />
                            </template>
                            <template v-else-if='!list.items.length'>
                                <TablerNone
                                    label='Schedules'
                                    :create='false'
                                />
                            </template>
                            <div
                                v-else
                                class='table-responsive'
                            >
                                <table class='table card-table table-hover table-vcenter datatable'>
                                    <TableHeader
                                        v-model:sort='paging.sort'
                                        v-model:order='paging.order'
                                        v-model:header='header'
                                    />
                                    <tbody>
                                        <tr
                                            v-for='schedule in list.items'
                                            :key='schedule.id'
                                            class='cursor-pointer'
                                            @click='$router.push(`/schedule/${schedule.id}`)'
                                        >
                                            <template v-for='h in header'>
                                                <template v-if='h.display'>
                                                    <td><span v-text='schedule[h.name]' /></td>
                                                </template>
                                            </template>
                                        </tr>
                                    </tbody>
                                </table>

                                <TablerLoading v-if='loading.list' />
                                <TableFooter
                                    v-else
                                    :limit='paging.limit'
                                    :total='list.total'
                                    @page='paging.page = $event'
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import iamHelper from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import TableHeader from './util/TableHeader.vue';
import TableFooter from './util/TableFooter.vue';
import {
    IconPlus
} from '@tabler/icons-vue';
import {
    TablerNone,
    TablerLoading,
    TablerBreadCrumb
} from '@tak-ps/vue-tabler';

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
    schema: true,
    list: true
})

const paging = reactive({
    filter: '',
    sort: 'Name',
    order: 'asc',
    limit: 10,
    page: 0
})

const header = reactive([])

const list = reactive({
    total: 0,
    items: []
})

function is_iam(permission) { 
    return iamHelper(props.iam, props.auth, permission) 
}

async function listSchedules() {
    loading.list = true;
    const result = await window.std('/api/schedule');
    list.total = result.total;
    list.items = result.items;
    loading.list = false;
}

async function listSchedulesSchema() {
    loading.schema = true;
    const schema = await window.std('/api/schema?method=GET&url=/schedule');
    const baseHeaders = ['name', ].map((h) => {
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
    loading.schema = false;
}

onMounted(async () => {
    if (!is_iam("Oncall:View")) return;

    await listSchedulesSchema();
    await listSchedules();
})
</script>
