<template>
    <div class='card'>
        <div class='card-header d-flex align-items-center'>
            <h3 class='card-title'>
                Mission Roles
            </h3>

            <div class='ms-auto btn-list'>
                <TablerIconButton
                    title='Add Role'
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
            label='No Roles'
        />
        <TablerLoading v-else-if='loading' />
        <table
            v-else
            class='table card-table table-vcenter'
        >
            <thead>
                <tr>
                    <th>Role</th>
                    <th class='text-right'>
                        Updated
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for='(role, roleit) in list.items'
                    :key='role.id'
                >
                    <td
                        v-if='role._edit'
                        colspan='2'
                    >
                        <div class='d-flex align-items-center'>
                            <TablerInput
                                v-model='role.name'
                                placeholder='Role'
                                @keyup.enter='saveRole(role, roleit)'
                            />
                            <div class='ms-auto btn-list'>
                                <TablerIconButton
                                    title='Save Role'
                                    @click='saveRole(role, roleit)'
                                >
                                    <IconCheck
                                        size='32'
                                        :stroke='1'
                                    />
                                </TablerIconButton>
                                <TablerIconButton
                                    title='Delete Role'
                                    @click='deleteRole(role, roleit)'
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
                            <span v-text='role.name' />
                        </td>
                        <td>
                            <div class='d-flex align-items-center'>
                                <TablerEpoch :date='role.updated' />
                                <div class='ms-auto btn-list'>
                                    <TablerIconButton
                                        title='Edit Role'
                                        @click='role._edit = true'
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
    const result = await window.std('/api/mission-role');
    list.total = result.total;
    list.items = result.items;
    loading.value = false;
};

const saveRole = async (role, roleit) => {
    if (role.id) {
        const newrole = await window.std(`/api/mission-role/${role.id}`, {
            method: 'PATCH',
            body: role
        });
        list.items.splice(roleit, 1, newrole);
    } else {
        const newrole = await window.std('/api/mission-role', {
            method: 'POST',
            body: role
        });
        list.items.splice(roleit, 1, newrole);
    }
};

const deleteRole = async (role, roleit) => {
    if (role.id) {
        await window.std(`/api/mission-role/${role.id}`, {
            method: 'DELETE',
        });
    }

    list.items.splice(roleit, 1);
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
