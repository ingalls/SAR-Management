<template>
    <div class='card'>
        <div class='card-header'>
            <div class='col d-flex'>
                <h3 class='card-title'>
                    <a
                        class='cursor-pointer'
                        @click='$router.push("/equipment")'
                        v-text='label'
                    />
                </h3>
                <div class='ms-auto'>
                    <div class='btn-list'>
                        <IconPlus
                            v-if='create'
                            :size='32'
                            :stroke='1'
                            class='cursor-pointer my-2'
                            @click='$router.push(`/equipment/new?parent=${parent}`)'
                        />
                        <div
                            v-if='search'
                            class='input-icon'
                        >
                            <input
                                v-model='paging.filter'
                                style='height: 40px;'
                                type='text'
                                class='form-control'
                                placeholder='Search…'
                            >
                            <span class='input-icon-addon'>
                                <IconSearch :size='24' />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <template v-if='loading.list'>
            <TablerLoading />
        </template>
        <template v-else-if='!list.items.length'>
            <TablerNone
                :create='false'
                label='Equipment'
                :compact='true'
            />
        </template>
        <template v-else>
            <table class='table card-table table-hover table-vcenter'>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Assigned</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for='equip in list.items'
                        :key='equip.id'
                    >
                        <td>
                            <a
                                class='cursor-pointer'
                                @click='$router.push(`/equipment/${equip.id}`)'
                                v-text='equip.name'
                            />
                        </td>
                        <td>
                            <template v-if='equip.assigned.length'>
                                <Avatar
                                    :link='true'
                                    :user='equip.assigned[0]'
                                />
                                <span
                                    v-if='equip.assigned.length > 1'
                                    v-text='` + equip.assigned.length - 1`'
                                />
                            </template>
                            <template v-else>
                                None
                            </template>
                        </td>
                        <td v-text='equip.status' />
                    </tr>
                </tbody>
            </table>
        </template>

        <TableFooter
            v-if='footer'
            :limit='paging.limit'
            :total='list.total'
            @page='paging.page = $event'
        />
    </div>
</template>

<script>
import TableFooter from '../util/TableFooter.vue';
import {
    IconPlus,
    IconSearch
} from '@tabler/icons-vue';
import {
    TablerLoading,
    TablerNone
} from '@tak-ps/vue-tabler';
import Avatar from '../util/Avatar.vue';

export default {
    name: 'EquipmentCard',
    components: {
        TablerNone,
        Avatar,
        IconPlus,
        IconSearch,
        TableFooter,
        TablerLoading
    },
    props: {
        label: {
            type: String,
            default: 'Equipment'
        },
        assigned: {
            type: Number,
            default: null
        },
        parent: {
            type: [Number, null],
            default: 0
        },
        search: {
            type: Boolean,
            default: true
        },
        create: {
            type: Boolean,
            default: false
        },
        footer: {
            type: Boolean,
            default: true
        }
    },
    data: function() {
        return {
            loading: {
                list: true
            },
            paging: {
                filter: '',
                limit: 10,
                page: 0
            },
            list: {
                total: 0,
                items: []
            }
        }
    },
    watch: {
        'paging.page': async function() {
            await this.fetch();
        },
        'paging.filter': async function() {
            await this.fetch();
        }
    },
    mounted: async function() {
        await this.fetch();
    },
    methods: {
        fetch: async function() {
            this.loading.list = true;
            const url = window.stdurl('/api/equipment');
            url.searchParams.append('limit', this.paging.limit);
            url.searchParams.append('page', this.paging.page);
            url.searchParams.append('filter', this.paging.filter);

            if (typeof this.assigned === 'number') url.searchParams.append('assigned', this.assigned);
            if (typeof this.parent === 'number') url.searchParams.append('parent', this.parent);
            this.list = await window.std(url);
            this.loading.list = false;
        }
    }
}
</script>
