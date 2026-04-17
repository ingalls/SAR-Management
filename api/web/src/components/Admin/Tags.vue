<template>
    <div class='card'>
        <div class='card-header d-flex align-items-center'>
            <h3 class='card-title'>
                Mission Tags
            </h3>

            <div class='ms-auto btn-list'>
                <TablerIconButton
                    title='Add Tag'
                    @click='push()'
                >
                    <IconPlus
                        size='32'
                        :stroke='1'
                    />
                </TablerIconButton>
            </div>
        </div>

        <TablerNone
            v-if='!list.items.length'
            :create='false'
            label='No Tags'
        />
        <TablerLoading v-else-if='loading' />
        <table
            v-else
            class='table card-table table-vcenter'
        >
            <thead>
                <tr>
                    <th>Name</th>
                    <th class='text-right'>
                        Updated
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for='(tag, tagit) in list.items'
                    :key='tag.id'
                >
                    <td
                        v-if='tag._edit'
                        colspan='2'
                    >
                        <div class='d-flex align-items-center'>
                            <TablerInput
                                v-model='tag.name'
                                placeholder='Name'
                                @keyup.enter='saveTag(tag, tagit)'
                            />
                            <div class='ms-auto btn-list'>
                                <TablerIconButton
                                    title='Save Tag'
                                    @click='saveTag(tag, tagit)'
                                >
                                    <IconCheck
                                        size='32'
                                        :stroke='1'
                                    />
                                </TablerIconButton>
                                <TablerIconButton
                                    title='Delete Tag'
                                    @click='deleteTag(tag, tagit)'
                                >
                                    <IconTrash
                                        size='32'
                                        :stroke='1'
                                    />
                                </TablerIconButton>
                            </div>
                        </div>
                    </td>
                    <template v-else>
                        <td>
                            <span v-text='tag.name' />
                        </td>
                        <td>
                            <div class='d-flex align-items-center'>
                                <TablerEpoch :date='tag.updated' />
                                <div class='ms-auto btn-list'>
                                    <TablerIconButton
                                        title='Edit Tag'
                                        @click='tag._edit = true'
                                    >
                                        <IconPencil
                                            size='32'
                                            :stroke='1'
                                        />
                                    </TablerIconButton>
                                </div>
                            </div>
                        </td>
                    </template>
                </tr>
            </tbody>
        </table>

        <TableFooter
            v-if='!loading'
            :limit='limit'
            :total='list.total'
            @page='page = $event'
        />
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import {
    IconPlus,
    IconPencil,
    IconCheck,
    IconTrash
} from '@tabler/icons-vue';
import {
    TablerIconButton,
    TablerEpoch,
    TablerLoading,
    TablerInput,
    TablerNone
} from '@tak-ps/vue-tabler';
import TableFooter from '../util/TableFooter.vue';

const loading = ref(true);
const limit = 10;
const page = ref(0);
const list = reactive({
    total: 0,
    items: []
});

const fetch = async () => {
    loading.value = true;
    const url = window.stdurl('/api/mission-tag');
    url.searchParams.append('limit', String(limit));
    url.searchParams.append('page', String(page.value));

    const result = await window.std(url);
    list.total = result.total;
    list.items = result.items;
    loading.value = false;
};

const saveTag = async (tag, tagit) => {
    if (tag.id) {
        const newtag = await window.std(`/api/mission-tag/${tag.id}`, {
            method: 'PATCH',
            body: tag 
        });
        list.items.splice(tagit, 1, newtag);
    } else {
        await window.std('/api/mission-tag', {
            method: 'POST',
            body: tag
        });
        page.value = 0;
        await fetch();
    }
};

const deleteTag = async (tag) => {
    if (tag.id) {
        await window.std(`/api/mission-tag/${tag.id}`, {
            method: 'DELETE',
        });
    }

    if (list.items.length === 1 && page.value > 0) {
        page.value = page.value - 1;
    } else {
        await fetch();
    }
};

const push = () => {
    list.items.splice(0, 0, {
        _edit: true,
        name: '',
        updated: +new Date(),
        created: +new Date()
    });
};

onMounted(async () => {
    await fetch();
});

watch(page, async () => {
    await fetch();
});
</script>
