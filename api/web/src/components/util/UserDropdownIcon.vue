<template>
    <div class='dropdown'>
        <div
            id='dropdownMenuButton1'
            type='button'
            :class='{
                "btn px-2": button
            }'
            data-bs-toggle='dropdown'
            aria-expanded='false'
        >
            <IconPlus
                :size='24'
                stroke='1'
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
                    @click='select(user)'
                >
                    <div class='d-flex align-items-center my-1 cursor-pointer'>
                        <Avatar :user='user' />
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
    IconPlus
} from '@tabler/icons-vue'

export default {
    name: 'UserDropdown',
    components: {
        Avatar,
        IconPlus,
        TablerInput
    },
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
    emits: [
        'selected'
    ],
    data: function() {
        return {
            filter: '',
            list: {
                items: []
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
    }
}
</script>
