<template>
<TablerDropdown>
    <template #default>
        <TablerInput label='Name' :disabled='disabled' v-model='filter'/>
    </template>
    <template #dropdown>
        <div class='m-1'>
            <div @click='select(user)' :key='user.id' v-for='user in list.users'>
                <div class="d-flex align-items-center my-1 cursor-pointer">
                    <Avatar :user='user'/>
                </div>
            </div>
        </div>
    </template>
</TablerDropdown>
</template>

<script>
import Avatar from './Avatar.vue';
import {
    TablerDropdown,
    TablerInput
} from '@tak-ps/vue-tabler'

export default {
    name: 'UserDropdown',
    props: {
        modelValue: {
            type: String,
            required: true
        },
        disabled: {
            type: Boolean,
            default: false
        },
        url: {
            type: String,
            default: '/api/user'
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
            }
        }
    },
    watch: {
        filter: async function() {
            await this.listUsers();
        }
    },
    mounted: async function() {
        this.filter = this.modelValue;
        await this.listUsers();
    },
    methods: {
        select: function(user) {
            this.filter = user.fname + ' ' + user.lname;
            this.$emit("selected", user)
        },
        listUsers: async function() {
            const url = window.stdurl(this.url);
            if (this.filter) url.searchParams.append('filter', this.filter);
            url.searchParams.append('limit', this.limit);
            const list = await window.std(url);
            if (list.assigned) list.users = list.assigned;
            this.list = list;
        }
    },
    components: {
        Avatar,
        TablerDropdown,
        TablerInput
    }
}
</script>
