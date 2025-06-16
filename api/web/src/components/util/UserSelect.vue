<template>
    <div class='mb-3'>
        <div class='row'>
            <div class='d-flex align-items-center mb-3'>
                <div
                    class='subheader'
                    v-text='label'
                />

                <div
                    v-if='!disabled'
                    class='ms-auto'
                >
                    <TablerDropdown>
                        <template #default>
                            <IconPlus
                                v-tooltip='"Add User"'
                                :size='16'
                                :stroke='1'
                            />
                        </template>
                        <template #dropdown>
                            <div class='card'>
                                <div class='card-body'>
                                    <TablerInput
                                        v-model='filter'
                                        icon='search'
                                        placeholder='Filter Users'
                                    />

                                    <TablerNone
                                        v-if='list.items.length === 0'
                                        label='Users'
                                        :create='false'
                                    />
                                    <template v-else >
                                        <div
                                            v-for='user in list.items'
                                            :key='user.id'
                                            class='py-2 px-2 rounded cursor-pointer hover-light'
                                            @click='push_assigned(user)'
                                        >
                                            <Avatar :user='user' />
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </template>
                    </TablerDropdown>
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
                        <IconTrash
                            :size='16'
                            stroke='1'
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
    IconPlus,
    IconTrash
} from '@tabler/icons-vue';
import {
    TablerNone,
    TablerInput,
    TablerDropdown
} from '@tak-ps/vue-tabler'

export default {
    name: 'UserSelect',
    components: {
        TablerNone,
        Avatar,
        IconPlus,
        TablerDropdown,
        IconTrash,
        TablerInput
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
                items: []
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
