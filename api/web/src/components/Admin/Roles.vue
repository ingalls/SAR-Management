<template>
<div class="card">
    <div class="card-body">
        <div class="d-flex">
            <h3 class="card-title"><a @click='$router.push("/issue")' class='cursor-pointer'>Mission Roles</a></h3>

            <div class='ms-auto btn-list'>
                <PlusIcon @click='push' class='cursor-pointer'/>
            </div>
        </div>
    </div>
    <table class="table card-table table-vcenter">
        <thead>
            <tr>
                <th>Role</th>
                <th colspan="2">Colour</th>
            </tr>
        </thead>
        <tbody>
            <tr :key='list.id' v-for='issue in issues'>
                <td><a @click='$router.push(`/issue/${issue.id}`)' v-text='issue.title' class='cursor-pointer'></a></td>
                <td v-text='issue.priority'></td>
            </tr>
        </tbody>
    </table>
</div>
</template>

<script>
import {
    PlusIcon
} from 'vue-tabler-icons';

export default {
    name: 'AdminRoleCard',
    data: function() {
        return {
            list: {
                total: 0,
                roles: ''
            }
        }
    },
    mounted: async function() {
        await this.fetch();
    },
    methods: {
        fetch: async function() {
            //const url = window.stdurl('/api/meta/roles');
            //this.list = await window.std(url);
        }
    },
    components: {
        PlusIcon
    }
}
</script>
