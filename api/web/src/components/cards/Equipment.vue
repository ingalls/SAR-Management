<template>
    <div class='card'>
        <div class='card-header'>
            <div class='col d-flex align-items-center'>
                <h3 class='card-title'>
                    <a
                        class='cursor-pointer'
                        @click='$router.push("/equipment")'
                        v-text='label'
                    />
                </h3>
                <div class='ms-auto btn-list'>
                    <TablerIconButton
                        v-if='create'
                        title='New Equipment'
                        @click='$router.push(`/equipment/new?parent=${parent}`)'
                    >
                        <IconPlus
                            :size='24'
                            :stroke='1'
                        />
                    </TablerIconButton>
                    <TablerIconButton
                        title='Export CSV'
                        @click='exportEquipment'
                    >
                        <IconDownload
                            :size='24'
                            :stroke='1'
                        />
                    </TablerIconButton>
                </div>
            </div>
        </div>

        <div
            v-if='search || userFilter'
            class='row g-2 mx-2 mt-1 mb-2 align-items-center'
        >
            <div
                v-if='search && userFilter'
                class='col-auto'
                style='width: calc(100% - 48px)'
            >
                <TablerInput
                    v-model='paging.filter'
                    icon='search'
                    placeholder='Search…'
                />
            </div>
            <div
                v-else-if='search'
                class='col-12'
            >
                <TablerInput
                    v-model='paging.filter'
                    icon='search'
                    placeholder='Search…'
                />
            </div>
            <div
                v-if='userFilter'
                class='col-auto'
            >
                <UserSelect
                    mode='icon'
                    title='Filter by User'
                    :height='40'
                    @selected='selectUser($event)'
                />
            </div>
        </div>
        <template v-if='loading.list'>
            <TablerLoading />
        </template>
        <template v-else-if='!list.items.length'>
            <TablerNone
                :create='false'
                label='No Equipment'
                :compact='true'
            />
        </template>
        <template v-else>
            <table class='table card-table table-hover table-vcenter'>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Assigned</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for='equip in list.items'
                        :key='equip.id'
                    >
                        <td>
                            <a
                                class='cursor-pointer'
                                @click='$router.push(`/equipment/${equip.id}`)'
                                v-text='equip.name'
                            />
                        </td>
                        <td>
                            <template v-if='equip.assigned.length'>
                                <Avatar
                                    :link='true'
                                    :user='equip.assigned[0]'
                                />
                                <span
                                    v-if='equip.assigned.length > 1'
                                    v-text='` + equip.assigned.length - 1`'
                                />
                            </template>
                            <template v-else>
                                None
                            </template>
                        </td>
                        <td v-text='equip.status' />
                    </tr>
                </tbody>
            </table>
        </template>

        <TableFooter
            v-if='footer'
            :limit='paging.limit'
            :total='list.total'
            @page='paging.page = $event'
        />
    </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'

import TableFooter from '../util/TableFooter.vue';
import UserSelect from '../util/UserSelect.vue';
import {
    IconPlus,
    IconDownload,
} from '@tabler/icons-vue';
import {
    TablerIconButton,
    TablerInput,
    TablerLoading,
    TablerNone
} from '@tak-ps/vue-tabler';
import Avatar from '../util/Avatar.vue';

const props = defineProps({
    label: {
        type: String,
        default: 'Equipment'
    },
    assigned: {
        type: Number,
        default: null
    },
    parent: {
        type: [Number, null],
        default: 0
    },
    search: {
        type: Boolean,
        default: true
    },
    create: {
        type: Boolean,
        default: false
    },
    footer: {
        type: Boolean,
        default: true
    },
    userFilter: {
        type: Boolean,
        default: false
    }
})

const assignedUser = ref(null)

const selectUser = (user) => {
    assignedUser.value = user.id
    fetch()
}

const exportEquipment = async () => {
    const url = window.stdurl('/api/equipment');
    url.searchParams.append('format', 'csv');
    url.searchParams.append('filter', paging.filter);

    const fields = ['name', 'status', 'description', 'quantity'];
    for (const field of fields) {
        url.searchParams.append('fields', field);
    }

    if (typeof assignedUser.value === 'number') {
        url.searchParams.append('assigned', assignedUser.value);
    } else if (typeof props.assigned === 'number') {
        url.searchParams.append('assigned', props.assigned);
    }
    if (typeof props.parent === 'number') url.searchParams.append('parent', props.parent);

    const res = await window.std(url);
    const blob = await res.blob();
    const durl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = durl;
    a.download = 'sar-equipment.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
}

const loading = reactive({
    list: true
})
const paging = reactive({
    filter: '',
    limit: 25,
    page: 0
})
const list = reactive({
    total: 0,
    items: []
})

const fetch = async () => {
    loading.list = true;
    const url = window.stdurl('/api/equipment');
    url.searchParams.append('limit', paging.limit);
    url.searchParams.append('page', paging.page);
    url.searchParams.append('filter', paging.filter);

    if (typeof assignedUser.value === 'number') {
        url.searchParams.append('assigned', assignedUser.value);
    } else if (typeof props.assigned === 'number') {
        url.searchParams.append('assigned', props.assigned);
    }
    if (typeof props.parent === 'number') url.searchParams.append('parent', props.parent);
    const result = await window.std(url);
    list.total = result.total;
    list.items = result.items;
    loading.list = false;
}

watch(() => paging.page, async () => {
    await fetch();
})

watch(() => paging.filter, async () => {
    await fetch();
})

onMounted(async () => {
    await fetch();
})
</script>
