<template>
    <div class='card'>
        <div class='card-body'>
            <div class='d-flex align-items-center mb-3'>
                <div
                    class='subheader'
                    v-text='label'
                />

                <div
                    v-if='!disabled'
                    class='ms-auto'
                >
                    <div class='dropdown'>
                        <div
                            id='dropdownMenuButton1'
                            class='dropdown-toggle'
                            type='button'
                            data-bs-toggle='dropdown'
                            aria-expanded='false'
                        >
                            <IconPlus
                                v-tooltip='"Add User"'
                                class='cursor-pointer dropdown-toggle'
                                :size='16'
                                :stroke='1'
                            />
                        </div>
                        <ul
                            class='dropdown-menu'
                            aria-labelledby='dropdownMenuButton1'
                        >
                            <div class='m-1'>
                                <TablerInput
                                    v-model='filter'
                                    placeholder='Filter Users'
                                />

                                <div
                                    v-for='user in list.items'
                                    :key='user.id'
                                    class='my-2 cursor-pointer'
                                    @click='push_assigned(user)'
                                >
                                    <Avatar :user='user' />
                                </div>
                            </div>
                        </ul>
                    </div>
                </div>
            </div>

            <TablerLoading v-if='loading' />
            <TablerNone
                v-else-if='!assigned.length'
                label='Users Assigned'
                :create='false'
            />
            <template v-else>
                <Draggable
                    v-model='assigned'
                    item-key='id'
                >
                    <template #item='{element}'>
                        <div class='d-flex align-items-center my-2 hover'>
                            <Avatar
                                :link='true'
                                :user='element'
                            />

                            <div
                                v-if='!disabled'
                                class='ms-auto'
                            >
                                <div class='btn-list'>
                                    <div
                                        v-if='!element.confirmed'
                                        class='btn btn--sm'
                                        @click='confirm_assigned(element)'
                                    >
                                        <IconCheck
                                            :size='16'
                                            :stroke='1'
                                        /> Confirm
                                    </div>

                                    <template v-if='disabled'>
                                        <span
                                            class='pt-1'
                                            v-text='element.role'
                                        />
                                    </template>
                                    <template v-else>
                                        <TablerSelect
                                            v-model='element.role'
                                            :options='roles'
                                            class='pt-2 mx-3'
                                            @update:model-value='saveRole(element)'
                                        />
                                    </template>

                                    <IconTrash
                                        v-tooltip='"Remove User"'
                                        class='cursor-pointer my-2'
                                        :size='20'
                                        :stroke='1'
                                        @click='delete_assigned(element)'
                                    />
                                </div>
                            </div>
                        </div>
                    </template>
                </Draggable>
            </template>
        </div>
    </div>
</template>

<script>
import {
    IconPlus,
    IconTrash,
    IconCheck
} from '@tabler/icons-vue';
import {
    TablerNone,
    TablerInput,
    TablerLoading,
    TablerSelect
} from '@tak-ps/vue-tabler'
import Avatar from './Avatar.vue';
import Draggable from 'vuedraggable';

export default {
    name: 'UserPresenceSelect',
    components: {
        TablerNone,
        Avatar,
        IconPlus,
        IconTrash,
        IconCheck,
        TablerInput,
        TablerSelect,
        TablerLoading,
        Draggable,
    },
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
                total: 0,
                items: []
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
        delete_assigned: async function(user) {
            this.assigned.splice(this.assigned.indexOf(user), 1);
            this.$emit('delete', user);
            await this.listUsers();
        },
        confirm_assigned: async function(user) {
            user.confirmed = true;
            this.$emit('patch', user);
        },
        saveRole: async function(role) {
            this.$emit('patch', role);
        },
        listRoles: async function() {
            const url = window.stdurl('/api/mission-role');
            const list = await window.std(url);
            this.roles = list.items.map((role) => {
                return role.name;
            });
        },
        listUsers: async function() {
            const url = window.stdurl('/api/user');
            url.searchParams.append('filter', this.filter);
            url.searchParams.append('limit', this.limit + this.assigned.length);
            const list = await window.std(url);

            const ids = this.assigned.map((a) => a.uid);
            this.list.items = list.items.filter((user) => {
                return !ids.includes(user.id);
            }).splice(0, this.limit);
        }
    }
}
</script>
