<template>
<div class="card">
    <div class="card-body">
        <div class="d-flex align-items-center">
            <h3 class="card-title">Mission Roles</h3>

            <div class='ms-auto btn-list'>
                <IconPlus @click='push()' class='cursor-pointer' size='32'/>
            </div>
        </div>
    </div>

    <TablerNone v-if='!list.items.length' :create='false' label='Roles'/>
    <TablerLoading v-else-if='loading'/>
    <table v-else class="table card-table table-vcenter">
        <thead>
            <tr>
                <th>Role</th>
                <th>Created</th>
                <th>Updated</th>
            </tr>
        </thead>
        <tbody>
            <tr :key='role.id' v-for='(role, roleit) in list.items'>
                <td>
                    <template v-if='role._edit'>
                        <TablerInput v-on:keyup.enter='saveRole(role, roleit)' v-model='role.name'/>
                    </template>
                    <template v-else>
                        <span v-text='role.name'/>
                    </template>
                </td>
                <td><TablerEpoch :date='role.created'/></td>
                <td>
                    <div class='d-flex align-items-center'>
                        <TablerEpoch :date='role.updated'/>
                        <div v-if='role._edit' class='ms-auto btn-list'>
                            <IconCheck @click='saveRole(role, roleit)' class='cursor-pointer' size='32'/>
                            <IconTrash @click='deleteRole(role, roleit)' class='cursor-pointer' size='32'/>
                        </div>
                        <div v-else class='ms-auto btn-list'>
                            <IconPencil @click='role._edit = true' class='cursor-pointer' size='32'/>
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
    },
    components: {
        TablerNone,
        IconPlus,
        IconPencil,
        IconCheck,
        IconTrash,
        TablerEpoch,
        TablerLoading,
        TablerInput
    }
}
</script>
