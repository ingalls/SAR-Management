<template>
<div class="card">
    <div class='card-header'>
        <div class="col">
            <div class="d-flex">
                <h3 class='card-title'>Users</h3>

                <div class='ms-auto'>
                    <div class="btn-list">
                        <div v-if='!edit' class="btn-group" role="group">
                            <input v-model='mode' type="radio" class="btn-check" name="btn-radio-toolbar" value='list'>
                            <label @click='mode="list"' class="btn btn-icon"><ListIcon/></label>
                            <input v-model='mode' type="radio" class="btn-check" name="btn-radio-toolbar" value='gallery'>
                            <label @click='mode="gallery"' class="btn btn-icon"><PolaroidIcon/></label>
                        </div>
                        <div v-else class='btn-list'>
                            <PlusIcon @click='push' class='cursor-pointer' height='24' width='24'/>
                        </div>

                        <button v-if='dropdown' data-bs-toggle="dropdown" type="button" class="btn dropdown-toggle dropdown-toggle-split" aria-expanded="false"></button>
                        <div class="dropdown-menu dropdown-menu-end" style="">
                            <a @click='$router.push("/user/new")' class="dropdown-item">New User</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <template v-if='loading'>
        <TablerLoading desc='Loading Users'/>
    </template>
    <template v-else-if='!users.users.length'>
        <None label='Users' :create='false'/>
    </template>
    <template v-else-if='mode === "list"'>
        <div class='table-responsive'>
            <table class="table card-table table-vcenter datatable">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                    </tr>
                </thead>
                <tbody>
                    <tr :key='user.id' v-for='(user, user_it) in users.users'>
                        <td @click='$router.push(`/user/${user.id}`)'>
                            <a class='text-reset cursor-pointer' v-text='user.fname + " " + user.lname'></a>
                        </td>
                        <td><a :href='`mailto:${user.email}`' v-text='user.email'></a></td>
                        <td>
                            <div class='d-flex'>
                                <a :href='`tel:${user.email}`' v-text='user.phone'></a>
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

                    </tr>
                </tbody>
            </table>
        </div>
    </template>
    <template v-else>
        <div class='row row-cards'>
            <div :key='user.id' v-for='user in users.users' class='col-sm-6 col-lg-4'>
                <div class="card card-sm">
                    <a @click='$router.push(`/user/${user.id}`)' class="d-block cursor-pointer">
                        <UserProfile :user='user'/>
                    </a>
                    <div class="card-body">
                        <div class="d-flex align-items-center">
                            <div>
                                <div @click='$router.push(`/user/${user.id}`)' class='cursor-pointer' v-text='`${user.fname} ${user.lname}`'></div>
                                <a class='text-muted cursor-pointer' :href='`tel:${user.email}`' v-text='user.phone'></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </template>

    <TableFooter :limit='paging.limit' :total='users.total' @page='paging.page = $event'/>
</div>
</template>

<script>
import {
    ListIcon,
    PolaroidIcon,
    PlusIcon,
    TrashIcon
} from 'vue-tabler-icons'
import TableFooter from '../util/TableFooter.vue';
import {
    TablerLoading
} from '@tak-ps/vue-tabler'
import UserProfile from '../User/Profile.vue';
import None from '../util/None.vue';

export default {
    name: 'CardUsers',
    props: {
        dropdown: {
            type: Boolean,
            default: true
        },
        edit: {
            type: Boolean,
            default: false
        },
        team: Number
    },
    data: function() {
        return {
            mode: 'list',
            loading: true,
            paging: {
                limit: 10,
                page: 0
            },
            users: {
                total: 0
            },
        }
    },
    watch: {
        'paging.page': async function() {
            await this.listUsers();
        }
    },
    mounted: async function() {
        await this.listUsers();
    },
    methods: {
        listUsers: async function() {
            this.loading = true;
            const url = window.stdurl('/api/user');
            if (this.team) url.searchParams.append('team', this.team);
            url.searchParams.append('limit', this.paging.limit);
            url.searchParams.append('page', this.paging.page);

            this.users = await window.std(url);
            this.loading = false;
        },
    },
    components: {
        None,
        PlusIcon,
        TrashIcon,
        ListIcon,
        PolaroidIcon,
        UserProfile,
        TablerLoading,
        TableFooter
    }
}
</script>
