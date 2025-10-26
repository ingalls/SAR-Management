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
            label='Tags'
        />
        <TablerLoading v-else-if='loading' />
        <table
            v-else
            class='table card-table table-vcenter'
        >
            <thead>
                <tr>
                    <th>Role</th>
                    <th>Created</th>
                    <th>Updated</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for='(tag, tagit) in list.items'
                    :key='tag.id'
                >
                    <td>
                        <template v-if='tag._edit'>
                            <TablerInput
                                v-model='tag.name'
                                @keyup.enter='saveTag(tag, tagit)'
                            />
                        </template>
                        <template v-else>
                            <span v-text='tag.name' />
                        </template>
                    </td>
                    <td><TablerEpoch :date='tag.created' /></td>
                    <td>
                        <div class='d-flex align-items-center'>
                            <TablerEpoch :date='tag.updated' />
                            <div
                                v-if='tag._edit'
                                class='ms-auto btn-list'
                            >
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
                            <div
                                v-else
                                class='ms-auto btn-list'
                            >
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
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
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

const loading = ref(true);
const list = reactive({
    total: 0,
    items: []
});

const fetch = async () => {
    loading.value = true;
    const result = await window.std('/api/mission-tag');
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
        const newtag = await window.std('/api/mission-tag', {
            method: 'POST',
            body: tag
        });
        list.items.splice(tagit, 1, newtag);
    }
};

const deleteTag = async (tag, tagit) => {
    if (tag.id) {
        await window.std(`/api/mission-tag/${tag.id}`, {
            method: 'DELETE',
        });
    }

    list.items.splice(tagit, 1);
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
</script>
