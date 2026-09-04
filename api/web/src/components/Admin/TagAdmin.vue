<template>
    <div class='card'>
        <div class='card-header d-flex align-items-center'>
            <h3
                class='card-title'
                v-text='title'
            />

            <div class='ms-auto btn-list'>
                <TablerIconButton
                    title='Add Tag'
                    @click='editing = {}'
                >
                    <IconPlus
                        :size='32'
                        stroke='1'
                    />
                </TablerIconButton>
            </div>
        </div>

        <div class='card-body border-bottom py-2'>
            <TablerInput
                v-model='filter'
                icon='search'
                placeholder='Filter Tags'
            />
        </div>

        <TablerLoading v-if='loading' />
        <TablerNone
            v-else-if='!list.items.length'
            :create='false'
            label='No Tags'
        />
        <div
            v-else
            class='table-responsive'
        >
            <table class='table card-table table-vcenter table-hover'>
                <thead>
                    <tr>
                        <th>Tag</th>
                        <th>Name</th>
                        <th>Updated</th>
                        <th class='w-1' />
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for='tag in list.items'
                        :key='tag.id'
                        class='cursor-pointer'
                        @click='editing = tag'
                    >
                        <td class='w-1 text-nowrap'>
                            <TagBadge
                                :tag='tag'
                                :size='16'
                            />
                        </td>
                        <td>
                            <div v-text='tag.name' />
                            <div
                                v-if='!tag.icon'
                                class='text-muted small'
                            >
                                No logo
                            </div>
                        </td>
                        <td class='text-muted'>
                            <TablerEpoch :date='tag.updated' />
                        </td>
                        <td>
                            <TablerIconButton
                                title='Edit Tag'
                                @click.stop='editing = tag'
                            >
                                <IconPencil
                                    :size='24'
                                    stroke='1'
                                />
                            </TablerIconButton>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <TableFooter
            v-if='!loading'
            :limit='limit'
            :total='list.total'
            @page='page = $event'
        />

        <TagEditModal
            v-if='editing'
            :tag='editing'
            :api='api'
            @close='editing = null'
            @saved='onSaved'
            @deleted='onDeleted'
        />
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import {
    IconPlus,
    IconPencil
} from '@tabler/icons-vue';
import {
    TablerIconButton,
    TablerEpoch,
    TablerLoading,
    TablerInput,
    TablerNone
} from '@tak-ps/vue-tabler';
import TableFooter from '../util/TableFooter.vue';
import TagBadge from '../util/TagBadge.vue';
import TagEditModal from './TagEditModal.vue';

/**
 * Shared admin list for Mission & Training Tags - each tag is shown as the
 * badge it will render as and edited in a modal with logo & colour pickers
 */
const props = defineProps({
    title: {
        type: String,
        required: true
    },
    // API root ie: /api/mission-tag
    api: {
        type: String,
        required: true
    }
});

const loading = ref(true);
const limit = 10;
const page = ref(0);
const filter = ref('');
const editing = ref(null);
const list = reactive({
    total: 0,
    items: []
});

const fetch = async () => {
    loading.value = true;
    const url = window.stdurl(props.api);
    url.searchParams.append('limit', String(limit));
    url.searchParams.append('page', String(page.value));
    url.searchParams.append('sort', 'name');
    url.searchParams.append('order', 'asc');
    if (filter.value) url.searchParams.append('filter', filter.value);

    const result = await window.std(url);
    list.total = result.total;
    list.items = result.items;
    loading.value = false;
};

const onSaved = async (tag) => {
    const idx = list.items.findIndex((t) => t.id === tag.id);
    editing.value = null;

    if (idx !== -1) {
        list.items.splice(idx, 1, tag);
    } else {
        page.value = 0;
        await fetch();
    }
};

const onDeleted = async () => {
    editing.value = null;

    if (list.items.length === 1 && page.value > 0) {
        page.value = page.value - 1;
    } else {
        await fetch();
    }
};

onMounted(fetch);

watch(page, fetch);

let filterTimeout;
watch(filter, () => {
    clearTimeout(filterTimeout);
    filterTimeout = setTimeout(() => {
        page.value = 0;
        fetch();
    }, 250);
});
</script>
