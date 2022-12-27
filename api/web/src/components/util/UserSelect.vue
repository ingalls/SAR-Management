<template>
<div class='mb-3'>
    <div class='row'>
        <div class="d-flex align-items-center mb-3">
            <div class="subheader" v-text='label'></div>

            <div class='ms-auto'>
                <div class="dropdown">
                    <div class="dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                        <SettingsIcon
                            class='cursor-pointer dropdown-toggle'
                            height=16
                            width=16
                        />
                    </div>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                        <div class='m-1'>
                            <TablerInput placeholder='Filter Users' v-model='filter'/>

                            <div @click='push_assigned(user)' :key='user.id' v-for='user in list.users'>
                                <div class="d-flex align-items-center my-1 cursor-pointer">
                                    <Avatar :user='user'/>
                                </div>
                            </div>
                        </div>
                    </ul>
                </div>
            </div>
        </div>

        <template v-if='!assigned.length'>
            <None label='Users Assigned' :create='false' :compact='true'/>
        </template>
        <template v-else>
            <div :key='a.id' v-for='(a, a_idx) in assigned' class="d-flex align-items-center my-1">
                <Avatar :user='a'/>

                <div class='ms-auto'>
                    <TrashIcon @click='delete_assigned(a_idx, a)' height='16' class='cursor-pointer'/>
                </div>
            </div>
        </template>
    </div>
</div>
</template>

<script>
import None from './None.vue';
import Avatar from './Avatar.vue';
import {
    SettingsIcon,
    TrashIcon
} from 'vue-tabler-icons';
import {
    TablerInput
} from '@tak-ps/vue-tabler'

export default {
    name: 'UserSelect',
    props: {
        modelValue: {
            type: Array,
            required: true
        },
        label: {
            type: String,
            default: 'Users'
        },
        limit: {
            type: Number,
            default: 10
        },
    },
    data: function() {
        return {
            filter: '',
            list: {
                users: []
            },
            assigned: []
        }
    },
    watch: {
        modelValue: function() {
            this.assigned = this.modelValue;
        },
        filter: async function() {
            await this.listUsers();
        },
        assigned: function() {
            this.$emit('update:modelValue', this.assigned);
        }
    },
    mounted: async function() {
        this.assigned = this.modelValue;
        await this.listUsers();
    },
    methods: {
        push_assigned: async function(user) {
            this.assigned.push(user);
            this.$emit('push', user);
        },
        delete_assigned: async function(idx, user) {
            this.assigned.splice(idx, 1);
            this.$emit('delete', user);
            await this.listUsers();
        },
        listUsers: async function() {
            const url = window.stdurl('/api/user');
            url.searchParams.append('filter', this.filter);
            url.searchParams.append('limit', this.limit + this.assigned.length);
            const list = await window.std(url);

            const ids = this.assigned.map((a) => a.uid);
            this.list.users = list.users.filter((user) => {
                return !ids.includes(user.id);
            }).splice(0, this.limit);
        }
    },
    components: {
        None,
        Avatar,
        SettingsIcon,
        TrashIcon,
        TablerInput
    }
}
</script>
