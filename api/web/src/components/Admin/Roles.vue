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

    <None v-if='!list.roles.length' :create='false' label='Roles'/>
    <table v-else class="table card-table table-vcenter">
        <thead>
            <tr>
                <th>Role</th>
                <th>Created</th>
                <th>Updated</th>
            </tr>
        </thead>
        <tbody>
            <tr :key='role.id' v-for='role in list.roles'>
                <td>
                    <template v-if='role._edit'>
                        <TablerInput v-model='role.name'/>
                    </template>
                    <template v-else>
                        <span v-text='role.name'/>
                    </template>
                </td>
                <td><TablerEpoch :date='role.created'/></td>
                <td>
                    <TablerEpoch :date='role.updated'/>
                </td>
            </tr>
        </tbody>
    </table>
</div>
</template>

<script>
import {
    PlusIcon
} from 'vue-tabler-icons';
import {
    TablerEpoch,
    TablerInput
} from '@tak-ps/vue-tabler';
import None from '../util/None.vue';

export default {
    name: 'AdminRoleCard',
    data: function() {
        return {
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
            this.list = await window.std('/api/mission-role');
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
        None,
        PlusIcon,
        TablerEpoch,
        TablerInput
    }
}
</script>
