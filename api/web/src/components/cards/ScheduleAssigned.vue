<template>
<div class="card">
    <div class='card-header'>
        <h3 class='card-title'>Assigned</h3>
    </div>
    <template v-if='loading.list'>
        <TablerLoading desc='Loading Assigned'/>
    </template>
    <template v-else-if='!list.assigned.length'>
        <TablerNone label='Assigned Users' :create='false'/>
    </template>
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
                    <tr :key='user.id' v-for='(user, user_it) in list.assigned'>
                        <template v-for='h in header'>
                            <template v-if='h.display'>
                                <td v-if='h.name === "name"' @click='$router.push(`/user/${user.id}`)'>
                                    <Avatar :link='true' :user='user'/>
                                </td>
                                <td v-else-if='h.name === "email"'>
                                    <a :href='`mailto:${user.email}`' v-text='user.email'></a>
                                </td>
                                <td v-else-if='h-name === "phone"'>
                                    <div class='d-flex'>
                                        <a :href='`tel:${user.phone}`' v-text='user.phone'></a>
                                        <div v-if='edit' class='ms-auto'>
                                            <div v-if='!user._loading' class='btn-list'>
                                                <TrashIcon @click='removeUser(user, user_it)' class='cursor-pointer'/>
                                            </div>
                                            <div v-else class='btn-list'>
                                                <TablerLoading :inline='true'/>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td v-else-if='["last_login", "updated", "created"].includes(h.name)'>
                                    <TablerEpoch v-if='user[h.name]' :date='user[h.name]'/>
                                    <span v-else>Never</span>
                                </td>
                                <td v-else>
                                    <span v-text='user[h.name]'></span>
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
    ListIcon,
    SearchIcon,
    PolaroidIcon,
    AddressBookIcon,
    TrashIcon
} from 'vue-tabler-icons'
import UserDropdownIcon from '../util/UserDropdownIcon.vue'
import TableHeader from '../util/TableHeader.vue';
import TableFooter from '../util/TableFooter.vue';
import {
    TablerNone,
    TablerEpoch,
    TablerLoading
} from '@tak-ps/vue-tabler'
import UserProfile from '../User/Profile.vue';

export default {
    name: 'CardScheduleAssigned',
    props: {
        dropdown: {
            type: Boolean,
            default: true
        },
        url: {
            type: String,
            default: '/api/user'
        },
        edit: {
            type: Boolean,
            default: false,
        },
        team: Number
    },
    data: function() {
        return {
            mode: 'list',
            loading: {
                list: true,
            },
            header: [],
            paging: {
                filter: '',
                sort: 'Name',
                order: 'asc',
                limit: 10,
                page: 0
            },
            list: {
                total: 0,
                assigned: []
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
        TablerNone,
        TablerEpoch,
        Avatar,
        UserDropdownIcon,
        TrashIcon,
        SearchIcon,
        ListIcon,
        PolaroidIcon,
        UserProfile,
        TablerLoading,
        TableFooter,
        TableHeader
    }
}
</script>
