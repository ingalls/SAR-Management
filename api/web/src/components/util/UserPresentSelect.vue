<template>
<div class='card'>
    <div class='card-body'>
        <div class="d-flex align-items-center mb-3">
            <div class="subheader" v-text='label'></div>

            <div v-if='!disabled' class='ms-auto'>
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

                            <div @click='push_assigned(user)' :key='user.id' v-for='user in list.users' class='my-2 cursor-pointer'>
                                <Avatar :user='user'/>
                            </div>
                        </div>
                    </ul>
                </div>
            </div>
        </div>

        <TablerLoading v-if='loading'/>
        <template v-else-if='!assigned.length'>
            <None label='Users Assigned' :create='false'/>
        </template>
        <template v-else>
            <div :key='a.id' v-for='(a, a_idx) in assigned' class="d-flex align-items-center my-2 hover">
                <Avatar :link='true' :user='a'/>

                <div v-if='!disabled' class='ms-auto'>
                    <div class='btn-list'>
                        <div v-if='!a.confirmed' @click='confirm_assigned(a)' class='btn btn--sm'>
                            <CheckIcon height='16'/> Confirm
                        </div>

                        <template v-if='disabled'>
                            <span v-text='a.role' class='pt-1'/>
                        </template>
                        <template v-else>
                            <TablerSelect
                                v-model='a.role'
                                v-on:update:modelValue='saveRole(a)'
                                :options='roles'
                                class='pt-2 mx-3'
                            />
                        </template>

                        <TrashIcon @click='delete_assigned(a_idx, a)' height='16' class='cursor-pointer my-2'/>
                    </div>
                </div>
            </div>
        </template>
    </div>
</div>
</template>

<script>
import {
    SettingsIcon,
    TrashIcon,
    CheckIcon
} from 'vue-tabler-icons';
import {
    TablerInput,
    TablerLoading,
    TablerSelect
} from '@tak-ps/vue-tabler'
import None from './None.vue';
import Avatar from './Avatar.vue';

export default {
    name: 'UserPresenceSelect',
    props: {
        modelValue: {
            type: Array,
            required: true
        },
        disabled: {
            type: Boolean,
            default: false
        },
        label: {
            type: String,
            default: 'Mission Roster'
        },
        confirmed: {
            type: Boolean,
            default: false
        },
        loading: {
            type: Boolean
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
            assigned: [],
            roles: []
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
        await this.listRoles();
    },
    methods: {
        push_assigned: async function(user) {
            if (this.confirmed) user.confirmed = true;
            user.role = 'Present';
            this.assigned.push(user);
            this.$emit('push', user);
            this.filter = '';
        },
        delete_assigned: async function(idx, user) {
            this.assigned.splice(idx, 1);
            this.$emit('delete', user);
            await this.listUsers();
        },
        confirm_assigned: async function(user) {
            user.confirmed = true;
            this.$emit('patch', user);
        },
        saveRole: async function(role) {
            console.error(JSON.stringify(role));
            //this.$emit('patch', role);
        },
        listRoles: async function() {
            const url = window.stdurl('/api/mission-role');
            const list = await window.std(url);
            this.roles = list.roles.map((role) => {
                return role.name;
            });
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
        CheckIcon,
        TablerInput,
        TablerSelect,
        TablerLoading
    }
}
</script>
