<template>
    <div class='card'>
        <div class='card-header d-flex align-items-center'>
            <h3 class='card-title'>
                Mission Roles
            </h3>

            <div class='ms-auto btn-list'>
                <IconPlus
                    class='cursor-pointer'
                    size='32'
                    :stroke='1'
                    @click='push()'
                />
            </div>
        </div>

        <TablerNone
            v-if='!list.items.length'
            :create='false'
            label='Roles'
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
                    v-for='(role, roleit) in list.items'
                    :key='role.id'
                >
                    <td>
                        <template v-if='role._edit'>
                            <TablerInput
                                v-model='role.name'
                                @keyup.enter='saveRole(role, roleit)'
                            />
                        </template>
                        <template v-else>
                            <span v-text='role.name' />
                        </template>
                    </td>
                    <td><TablerEpoch :date='role.created' /></td>
                    <td>
                        <div class='d-flex align-items-center'>
                            <TablerEpoch :date='role.updated' />
                            <div
                                v-if='role._edit'
                                class='ms-auto btn-list'
                            >
                                <IconCheck
                                    class='cursor-pointer'
                                    size='32'
                                    :stroke='1'
                                    @click='saveRole(role, roleit)'
                                />
                                <IconTrash
                                    class='cursor-pointer'
                                    size='32'
                                    :stroke='1'
                                    @click='deleteRole(role, roleit)'
                                />
                            </div>
                            <div
                                v-else
                                class='ms-auto btn-list'
                            >
                                <IconPencil
                                    class='cursor-pointer'
                                    size='32'
                                    :stroke='1'
                                    @click='role._edit = true'
                                />
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import {
    IconPlus,
    IconPencil,
    IconCheck,
    IconTrash
} from '@tabler/icons-vue';
import {
    TablerEpoch,
    TablerLoading,
    TablerInput,
    TablerNone
} from '@tak-ps/vue-tabler';

export default {
    name: 'AdminRoleCard',
    components: {
        TablerNone,
        IconPlus,
        IconPencil,
        IconCheck,
        IconTrash,
        TablerEpoch,
        TablerLoading,
        TablerInput
    },
    data: function() {
        return {
            loading: true,
            list: {
                total: 0,
                items: []
            }
        }
    },
    mounted: async function() {
        await this.fetch();
    },
    methods: {
        fetch: async function() {
            this.loading = true;
            this.list = await window.std('/api/mission-role');
            this.loading = false;
        },
        saveRole: async function(role, roleit) {
            if (role.id) {
                const newrole = await window.std(`/api/mission-role/${role.id}`, {
                    method: 'PATCH',
                    body: role
                });
                this.list.items.splice(roleit, 1, newrole);
            } else {
                const newrole = await window.std('/api/mission-role', {
                    method: 'POST',
                    body: role
                });
                this.list.items.splice(roleit, 1, newrole);
            }
        },
        deleteRole: async function(role, roleit) {
            if (role.id) {
                const newrole = await window.std(`/api/mission-role/${role.id}`, {
                    method: 'DELETE',
                });
            }

            this.list.items.splice(roleit, 1);
        },
        push: function() {
            this.list.items.splice(0, 0, {
                _edit: true,
                name: '',
                updated: +new Date(),
                created: +new Date()
            });
        }
    }
}
</script>
