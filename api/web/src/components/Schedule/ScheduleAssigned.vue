<template>
    <div class='card'>
        <div class='card-header'>
            <h3 class='card-title'>
                Assigned
            </h3>
            <div class='ms-auto'>
                <IconSettings
                    v-tooltip='"Edit"'
                    :size='32'
                    stroke='1'
                    class='cursor-pointer'
                    @click='edit = !edit'
                />
            </div>
        </div>

        <TablerLoading
            v-if='loading.list'
            desc='Loading Assigned'
        />
        <TablerNone
            v-else-if='!list.items.length'
            label='No Assigned Users'
            :create='false'
        />
        <template v-else>
            <div class='table-responsive'>
                <table class='table card-table table-hover table-vcenter datatable'>
                    <TableHeader
                        v-model:sort='paging.sort'
                        v-model:order='paging.order'
                        v-model:header='header'
                        :export='false'
                    />
                    <tbody>
                        <tr
                            v-for='(user, user_it) in list.items'
                            :key='user.id'
                        >
                            <template v-for='h in header'>
                                <template v-if='h.display'>
                                    <td v-if='h.name === "name"'>
                                        <div class='d-flex'>
                                            <Avatar
                                                :link='true'
                                                :user='user'
                                            />

                                            <div
                                                v-if='edit'
                                                class='ms-auto'
                                            >
                                                <div
                                                    v-if='!user._loading'
                                                    class='btn-list'
                                                >
                                                    <TablerDelete
                                                        displaytype='icon'
                                                        @delete='removeUser(user, user_it)'
                                                    />
                                                </div>
                                                <div
                                                    v-else
                                                    class='btn-list'
                                                >
                                                    <TablerLoading :inline='true' />
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td v-else>
                                        <span v-text='user[h.name]' />
                                    </td>
                                </template>
                            </template>
                        </tr>
                    </tbody>
                </table>
            </div>
        </template>

        <TableFooter
            :limit='paging.limit'
            :total='list.total'
            @page='paging.page = $event'
        />
    </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Avatar from '../util/Avatar.vue';
import {
    IconSettings,
} from '@tabler/icons-vue'
import TableHeader from '../util/TableHeader.vue';
import TableFooter from '../util/TableFooter.vue';
import {
    TablerNone,
    TablerLoading,
    TablerDelete
} from '@tak-ps/vue-tabler'

const route = useRoute();

const edit = ref(false);
const loading = reactive({
    list: true,
});
const header = ref([]);
const paging = reactive({
    filter: '',
    sort: 'id',
    order: 'asc',
    limit: 10,
    page: 0
});
const list = reactive({
    total: 0,
    items: []
});

watch(paging, async () => {
    await listAssigned();
}, { deep: true });

const listAssignedSchema = async () => {
    const schema = await window.std('/api/schema?method=GET&url=/schedule/:scheduleid/assigned');
    header.value = ['name'].map((h) => {
        return { name: h, display: true };
    });

    header.value.push(...schema.query.properties.sort.enum.map((h) => {
        return {
            name: h,
            display: false
        }
    }).filter((h) => {
        for (const hknown of header.value) {
            if (hknown.name === h.name) return false;
        }
        return true;
    }));
};

const listAssigned = async () => {
    loading.list = true;
    const url = window.stdurl(`/api/schedule/${route.params.scheduleid}/assigned`);
    url.searchParams.append('limit', paging.limit);
    url.searchParams.append('page', paging.page);
    url.searchParams.append('filter', paging.filter);

    if (paging.sort.toLowerCase() === 'name') url.searchParams.append('sort', 'fname');
    else url.searchParams.append('sort', paging.sort.toLowerCase().replace(' ', '_'));
    url.searchParams.append('order', paging.order);

    const result = await window.std(url);
    list.total = result.total;
    list.items = result.items;
    loading.list = false;
};

onMounted(async () => {
    await listAssignedSchema();
    await listAssigned();
});
</script>
