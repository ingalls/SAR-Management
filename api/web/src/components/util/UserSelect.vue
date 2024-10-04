<template>
    <div class='mb-3'>
        <div class='row'>
            <div class='d-flex align-items-center mb-3'>
                <div
                    class='subheader'
                    v-text='label'
                />

                <div class='ms-auto'>
                    <div class='dropdown'>
                        <div
                            id='dropdownMenuButton1'
                            class='dropdown-toggle'
                            type='button'
                            data-bs-toggle='dropdown'
                            aria-expanded='false'
                        >
                            <SettingsIcon
                                class='cursor-pointer dropdown-toggle'
                                height='16'
                                width='16'
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
                                    @click='push_assigned(user)'
                                >
                                    <div class='d-flex align-items-center my-1 cursor-pointer'>
                                        <Avatar :user='user' />
                                    </div>
                                </div>
                            </div>
                        </ul>
                    </div>
                </div>
            </div>

            <template v-if='!assigned.length'>
                <TablerNone
                    label='Users Assigned'
                    :create='false'
                    :compact='true'
                />
            </template>
            <template v-else>
                <div
                    v-for='(a, a_idx) in assigned'
                    :key='a.id'
                    class='d-flex align-items-center my-1'
                >
                    <Avatar :user='a' />

                    <div class='ms-auto'>
                        <TrashIcon
                            height='16'
                            class='cursor-pointer'
                            @click='delete_assigned(a_idx, a)'
                        />
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
import Avatar from './Avatar.vue';
import {
    SettingsIcon,
    TrashIcon
} from 'vue-tabler-icons';
import {
    TablerNone,
    TablerInput
} from '@tak-ps/vue-tabler'

export default {
    name: 'UserSelect',
    components: {
        TablerNone,
        Avatar,
        SettingsIcon,
        TrashIcon,
        TablerInput
    },
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
    emits: [
        'update:modelValue',
        'push',
        'delete'
    ],
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
            this.list.items = list.items.filter((user) => {
                return !ids.includes(user.id);
            }).splice(0, this.limit);
        }
    }
}
</script>
