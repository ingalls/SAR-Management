<template>
<div class="card">
    <div class="card-body">
        <div class="d-flex">
            <h3 class="card-title"><a @click='$router.push("/issue")' class='cursor-pointer'>Mission Roles</a></h3>

            <div class='ms-auto btn-list'>
                <PlusIcon @click='push()' class='cursor-pointer'/>
            </div>
        </div>
    </div>

    <TablerNone v-if='!list.roles.length' :create='false' label='Roles'/>
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
            <tr :key='role.id' v-for='(role, roleit) in list.roles'>
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
                    <div class='d-flex'>
                        <TablerEpoch :date='role.updated'/>
                        <div v-if='role._edit' class='ms-auto btn-list'>
                            <CheckIcon @click='saveRole(role, roleit)' class='cursor-pointer'/>
                            <TrashIcon @click='deleteRole(role, roleit)' class='cursor-pointer'/>
                        </div>
                        <div v-else class='ms-auto btn-list'>
                            <PencilIcon @click='role._edit = true' class='cursor-pointer'/>
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
    PlusIcon,
    PencilIcon,
    CheckIcon,
    TrashIcon
} from 'vue-tabler-icons';
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
                roles: []
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
                this.list.roles.splice(roleit, 1, newrole);
            } else {
                const newrole = await window.std('/api/mission-role', {
                    method: 'POST',
                    body: role
                });
                this.list.roles.splice(roleit, 1, newrole);
            }
        },
        deleteRole: async function(role, roleit) {
            if (role.id) {
                const newrole = await window.std(`/api/mission-role/${role.id}`, {
                    method: 'DELETE',
                });
            }

            this.list.roles.splice(roleit, 1);
        },
        push: function() {
            this.list.roles.splice(0, 0, {
                _edit: true,
                name: '',
                updated: +new Date(),
                created: +new Date()
            });
        }
    },
    components: {
        TablerNone,
        PlusIcon,
        PencilIcon,
        CheckIcon,
        TrashIcon,
        TablerEpoch,
        TablerLoading,
        TablerInput
    }
}
</script>
