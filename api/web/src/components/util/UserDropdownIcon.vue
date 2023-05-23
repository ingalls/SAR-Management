<template>

<div class="dropdown">
    <div type="button" :class='{
        "btn px-2": button
     }' id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
        <PlusIcon height='24' width='24'/>
    </div>
    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
        <div class='m-1'>
            <TablerInput placeholder='Filter Users' v-model='filter'/>

            <div @click='select(user)' :key='user.id' v-for='user in list.users'>
                <div class="d-flex align-items-center my-1 cursor-pointer">
                    <Avatar :user='user'/>
                </div>
            </div>
        </div>
    </ul>
</div>
</template>

<script>
import Avatar from './Avatar.vue';
import {
    TablerInput
} from '@tak-ps/vue-tabler';
import {
    PlusIcon
} from 'vue-tabler-icons'

export default {
    name: 'UserDropdown',
    props: {
        button: {
            type: Boolean,
            description: 'Style as a standalone icon if false or a button if true',
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
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
        await this.listUsers();
    },
    methods: {
        select: function(user) {
            this.filter = '';
            this.$emit("selected", user)
        },
        listUsers: async function() {
            const url = window.stdurl('/api/user');
            url.searchParams.append('filter', this.filter);
            url.searchParams.append('limit', this.limit);
            this.list = await window.std(url);
        }
    },
    components: {
        Avatar,
        PlusIcon,
        TablerInput
    }
}
</script>
