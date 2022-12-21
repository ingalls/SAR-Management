<template>
<div class='card'>
    <div class='card-body'>
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
                                    <span class="avatar avatar-xs me-2 avatar-rounded" style="background-image: url(./static/avatars/000m.jpg)"></span>
                                    <span v-text='`${user.fname} ${user.lname}`'/>
                                </div>
                            </div>
                        </div>
                    </ul>
                </div>
            </div>
        </div>

        <TablerLoading v-if='loading'/>
        <template v-else>
            <div :key='a.id' v-for='(a, a_idx) in assigned' class="d-flex align-items-center my-1">
                <span class="avatar avatar-xs me-2 avatar-rounded" style="background-image: url(./static/avatars/000m.jpg)"></span>
                <span v-text='`${a.fname} ${a.lname}`'/>

                <div class='ms-auto'>
                    <div class='btn-list'>
                        <div v-if='!a.confirmed' class='btn btn--sm'>
                            <CheckIcon @click='confirm_assigned(a)' height='16' class='cursor-pointer'/> Confirm
                        </div>
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
    TablerLoading
} from '@tak-ps/vue-tabler'

export default {
    name: 'UserPrecenseSelect',
    props: {
        modelValue: {
            type: Array,
            required: true
        },
        label: {
            type: String,
            default: 'Mission Roster'
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
        confirm_assigned: async function(user) {
            user.confirmed = true;
            this.$emit('patch', user);
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
        SettingsIcon,
        TrashIcon,
        CheckIcon,
        TablerInput,
        TablerLoading
    }
}
</script>
