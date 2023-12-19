<template>
<div class="card">
    <div class='card-header'>
        <div class="col">
            <div class="d-flex">
                <h3 class='card-title'>Users</h3>

                <div class='ms-auto'>
                    <div class="btn-list">
                        <div v-if='!edit' class="input-icon">
                            <input v-model='paging.filter' style='height: 40px;' type="text" class="form-control" placeholder="Search…">
                            <span class="input-icon-addon">
                                <SearchIcon />
                            </span>
                        </div>

                        <div class='btn-list'>
                            <div class="btn-group" role="group">
                                <input v-model='mode' type="radio" class="btn-check" name="btn-radio-toolbar" value='list'>
                                <label @click='mode="list"' class="btn btn-icon"><ListIcon/></label>
                                <input v-model='mode' type="radio" class="btn-check" name="btn-radio-toolbar" value='gallery'>
                                <label @click='mode="gallery"' class="btn btn-icon"><PolaroidIcon/></label>
                            </div>

                            <button class='btn px-2'>
                                <AddressBookIcon @click='exportUsers("vcard")' class='cursor-pointer'/>
                            </button>
                            <template v-if='edit'>
                                <TablerLoading v-if='loading.add' :inline='true'/>
                                <UserDropdownIcon v-else :button='true' @selected='addUser($event)'/>
                            </template>
                        </div>

                        <button v-if='dropdown && edit' data-bs-toggle="dropdown" type="button" class="btn dropdown-toggle dropdown-toggle-split" aria-expanded="false"></button>
                        <div class="dropdown-menu dropdown-menu-end" style="">
                            <a @click='$router.push("/user/new")' class="dropdown-item">New User</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <template v-if='loading.list'>
        <TablerLoading desc='Loading Users'/>
    </template>
    <template v-else-if='!list.users.length'>
        <TablerNone label='Users' :create='false'/>
    </template>
    <template v-else-if='mode === "list"'>
        <div class='table-responsive'>
            <table class="table card-table table-hover table-vcenter datatable">
                <TableHeader
                    v-model:sort='paging.sort'
                    v-model:order='paging.order'
                    v-model:header='header'
                    :export='true'
                    @export='exportUsers("csv")'
                />
                <tbody>
                    <tr :key='user.id' v-for='(user, user_it) in list.users'>
                        <template v-for='h in header'>
                            <template v-if='h.display'>
                                <td v-if='h.name === "name"' @click='$router.push(`/user/${user.id}`)'>
                                    <Avatar :link='true' :user='user'/>
                                </td>
                                <td v-else-if='h.name === "email"'>
                                    <a :href='`mailto:${user.email}`' v-text='user.email'></a>
                                </td>
                                <td v-else-if='h.name === "phone"'>
                                    <div class='d-flex'>
                                        <a :href='`tel:${user.phone}`' v-text='user.phone'></a>
                                        <div v-if='edit' class='ms-auto'>
                                            <div v-if='!user._loading' class='btn-list'>
                                                <TablerDelete @delete='removeUser(user, user_it)' displaytype='icon'/>
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
    <template v-else>
        <div class='row row-cards'>
            <div :key='user.id' v-for='user in list.users' class='col-sm-6 col-lg-4'>
                <div class="card card-sm">
                    <a @click='$router.push(`/user/${user.id}`)' class="d-block cursor-pointer">
                        <UserProfile bgstyle='cover' :userid='user.id'/>
                    </a>
                    <div class="card-body">
                        <div class="d-flex align-items-center">
                            <div>
                                <div @click='$router.push(`/user/${user.id}`)' class='cursor-pointer' v-text='`${user.fname} ${user.lname}`'></div>
                                <a class='text-muted cursor-pointer' :href='`mailto:${user.email}`' v-text='user.email'></a>
                                <br/>
                                <a class='text-muted cursor-pointer' :href='`tel:${user.phone}`' v-text='user.phone'></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
} from 'vue-tabler-icons'
import UserDropdownIcon from '../util/UserDropdownIcon.vue'
import TableHeader from '../util/TableHeader.vue';
import TableFooter from '../util/TableFooter.vue';
import {
    TablerNone,
    TablerDelete,
    TablerEpoch,
    TablerLoading
} from '@tak-ps/vue-tabler'
import UserProfile from '../User/Profile.vue';

export default {
    name: 'CardUsers',
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
                users: []
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
        await this.listUsersSchema();
        await this.listUsers();
    },
    methods: {
        removeUser: async function(user, user_it) {
            user._loading = true;
            await window.std(`${this.url}/${user.id}`, {
                method: 'DELETE',
            });
            user._loading = false;

            this.list.users.splice(user_it, 1);
            this.list.total--;
        },
        addUser: async function(user) {
            this.loading.add = true;
            await window.std(`${this.url}`, {
                method: 'POST',
                body: { uid: user.id }
            });

            this.list.users.splice(0, 0, user);
            this.list.total++;
            this.loading.add = false;
        },
        listUsersSchema: async function() {
            const schema = await window.std('/api/schema?method=GET&url=/user');
            this.header = ['name', 'email', 'last_login', 'phone'].map((h) => {
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
        listUsers: async function() {
            this.loading.list = true;
            const url = window.stdurl(this.url);
            if (this.team) url.searchParams.append('team', this.team);
            url.searchParams.append('limit', this.paging.limit);
            url.searchParams.append('page', this.paging.page);
            url.searchParams.append('filter', this.paging.filter);

            if (this.paging.sort.toLowerCase() === 'name') url.searchParams.append('sort', 'fname');
            else url.searchParams.append('sort', this.paging.sort.toLowerCase().replace(' ', '_'));
            url.searchParams.append('order', this.paging.order);

            this.list = await window.std(url);
            this.loading.list = false;
        },
        exportUsers: async function(format='vcard') {
            const url = window.stdurl(this.url);
            if (this.team) url.searchParams.append('team', this.team);
            url.searchParams.append('filter', this.paging.filter);
            url.searchParams.append('format', format);
            if (this.paging.sort.toLowerCase() === 'name') url.searchParams.append('sort', 'fname');

            if (format === 'csv') {
                url.searchParams.append('fields', this.header.filter((h) => {
                    return h.display;
                }).map((h) => {
                    if (h.name === 'name') return 'fname,lname';
                    return h.name;
                }));
            }

            const res = await window.std(url);
            const blob = await res.blob()

            const durl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = durl;
            a.download = `sar-users.${format === 'vcard' ? 'vcf' : format}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        },
    },
    components: {
        TablerNone,
        TablerEpoch,
        Avatar,
        AddressBookIcon,
        UserDropdownIcon,
        TablerDelete,
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
