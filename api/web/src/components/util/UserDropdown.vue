<template>
    <TablerDropdown>
        <template #default>
            <TablerInput
                v-model='filter'
                label='Name'
                :disabled='disabled'
            />
        </template>
        <template #dropdown>
            <div class='m-1'>
                <div
                    v-for='user in list.items'
                    :key='user.id'
                    @click='select(user)'
                >
                    <div class='d-flex align-items-center my-1 cursor-pointer'>
                        <Avatar :user='user' />
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
    components: {
        Avatar,
        TablerDropdown,
        TablerInput
    },
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
            if (list.assigned) list.items = list.assigned;
            this.list = list;
        }
    }
}
</script>
