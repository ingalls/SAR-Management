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
                                <span v-text='`${user.fname} ${user.lname}`'/>
                            </div>
                        </div>
                    </ul>
                </div>
            </div>
        </div>
        <div :key='a.id' v-for='(a, a_idx) in assigned' class="d-flex align-items-center my-1">
            <span class="avatar avatar-xs me-2 avatar-rounded" style="background-image: url(./static/avatars/000m.jpg)"></span>
            <span v-text='`${a.fname} ${a.lname}`'/>

            <div class='ms-auto'>
                <TrashIcon @click='delete_assigned(a_idx, a)' height='16' class='cursor-pointer'/>
            </div>
        </div>
    </div>
</div>
</template>

<script>
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
        filter: function() {
            this.listUsers();
        },
        assigned: function() {
            this.$emit('update:modelValue', this.assigned);
        }
    },
    mounted: function() {
        this.assigned = this.modelValue;
        this.listUsers();
    },
    methods: {
        push_assigned: function(user) {
            this.assigned.push(user);
            this.$emit('push', user);
        },
        delete_assigned: function(idx, user) {
            this.assigned.splice(idx, 1);
            this.$emit('delete', user);
        },
        listUsers: async function() {
            try {
                const url = window.stdurl('/api/user');
                url.searchParams.append('filter', this.filter);
                url.searchParams.append('limit', this.limit);
                this.list = await window.std(url);
            } catch (err) {
                this.$emit('err', err);
            }
        }
    },
    components: {
        SettingsIcon,
        TrashIcon,
        TablerInput
    }
}
</script>
