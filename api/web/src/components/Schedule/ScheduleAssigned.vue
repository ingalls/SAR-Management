<template>
<div class="card">
    <div class='card-header'>
        <h3 class='card-title'>Assigned</h3>
        <div class='ms-auto'>
            <SettingsIcon @click='edit = !edit' class='cursor-pointer' v-tooltip='"Edit"'/>
        </div>
    </div>

    <TablerLoading v-if='loading.list' desc='Loading Assigned'/>
    <TablerNone v-else-if ='!list.items.length' label='Assigned Users' :create='false'/>
    <template v-else>
        <div class='table-responsive'>
            <table class="table card-table table-hover table-vcenter datatable">
                <TableHeader
                    v-model:sort='paging.sort'
                    v-model:order='paging.order'
                    v-model:header='header'
                    :export='false'
                />
                <tbody>
                    <tr :key='user.id' v-for='(user, user_it) in list.items'>
                        <template v-for='h in header'>
                            <template v-if='h.display'>
                                <td v-if='h.name === "name"'>
                                    <div class='d-flex'>
                                        <Avatar :link='true' :user='user'/>

                                        <div v-if='edit' class='ms-auto'>
                                            <div v-if='!user._loading' class='btn-list'>
                                                <TablerDelete displaytype='icon' @delete='removeUser(user, user_it)'/>
                                            </div>
                                            <div v-else class='btn-list'>
                                                <TablerLoading :inline='true'/>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td v-else>
                                    <span v-text='user[h.name]'/>
                                </td>
                            </template>
                        </template>
                    </tr>
                </tbody>
            </table>
        </div>
    </template>

    <TableFooter :limit='paging.limit' :total='list.total' @page='paging.page = $event'/>
</div>
</template>

<script>
import Avatar from '../util/Avatar.vue';
import {
    SettingsIcon,
    ListIcon,
    SearchIcon,
    TrashIcon
} from 'vue-tabler-icons'
import UserDropdownIcon from '../util/UserDropdownIcon.vue'
import TableHeader from '../util/TableHeader.vue';
import TableFooter from '../util/TableFooter.vue';
import {
    TablerNone,
    TablerEpoch,
    TablerLoading,
    TablerDelete
} from '@tak-ps/vue-tabler'
import UserProfile from '../User/Profile.vue';

export default {
    name: 'CardScheduleAssigned',
    data: function() {
        return {
            edit: false,
            loading: {
                list: true,
            },
            header: [],
            paging: {
                filter: '',
                sort: 'id',
                order: 'asc',
                limit: 10,
                page: 0
            },
            list: {
                total: 0,
                items: []
            },
        }
    },
    watch: {
        paging: {
            deep: true,
            handler: async function() {
                await this.listUsers();
            }
        }
    },
    mounted: async function() {
        await this.listAssignedSchema();
        await this.listAssigned();
    },
    methods: {
        listAssignedSchema: async function() {
            const schema = await window.std('/api/schema?method=GET&url=/schedule/:scheduleid/assigned');
            this.header = ['name'].map((h) => {
                return { name: h, display: true };
            });

            this.header.push(...schema.query.properties.sort.enum.map((h) => {
                return {
                    name: h,
                    display: false
                }
            }).filter((h) => {
                for (const hknown of this.header) {
                    if (hknown.name === h.name) return false;
                }
                return true;
            }));
        },
        listAssigned: async function() {
            this.loading.list = true;
            const url = window.stdurl(`/api/schedule/${this.$route.params.scheduleid}/assigned`);
            url.searchParams.append('limit', this.paging.limit);
            url.searchParams.append('page', this.paging.page);
            url.searchParams.append('filter', this.paging.filter);

            if (this.paging.sort.toLowerCase() === 'name') url.searchParams.append('sort', 'fname');
            else url.searchParams.append('sort', this.paging.sort.toLowerCase().replace(' ', '_'));
            url.searchParams.append('order', this.paging.order);

            this.list = await window.std(url);
            this.loading.list = false;
        },
    },
    components: {
        SettingsIcon,
        TablerNone,
        TablerEpoch,
        Avatar,
        UserDropdownIcon,
        TrashIcon,
        SearchIcon,
        ListIcon,
        UserProfile,
        TablerLoading,
        TableFooter,
        TableHeader,
        TablerDelete
    }
}
</script>
