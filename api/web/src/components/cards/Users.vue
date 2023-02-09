<template>
<div class="card">
    <div class='card-header'>
        <div class="col">
            <div class="d-flex">
                <h3 class='card-title'>Users</h3>

                <div class='ms-auto'>
                    <div class="btn-list">
                        <div class="btn-group" role="group">
                            <input v-model='mode' type="radio" class="btn-check" name="btn-radio-toolbar" value='list'>
                            <label @click='mode="list"' class="btn btn-icon"><ListIcon/></label>
                            <input v-model='mode' type="radio" class="btn-check" name="btn-radio-toolbar" value='gallery'>
                            <label @click='mode="gallery"' class="btn btn-icon"><PolaroidIcon/></label>
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
                    <tr :key='user.id' v-for='user in users.users'>
                        <td @click='$router.push(`/user/${user.id}`)'>
                            <a class='text-reset cursor-pointer' v-text='user.fname + " " + user.lname'></a>
                        </td>
                        <td><a :href='`mailto:${user.email}`' v-text='user.email'></a></td>
                        <td><a :href='`tel:${user.email}`' v-text='user.phone'></a></td>
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

    <div class="card-footer d-flex align-items-center">
        <p class="m-0 text-muted">Showing <span>1</span> to <span>8</span> of <span>16</span> entries</p>
        <ul class="pagination m-0 ms-auto">
            <li class="page-item disabled">
                <a class="page-link" href="#" tabindex="-1" aria-disabled="true">prev</a>
            </li>
            <li class="page-item"><a class="page-link" href="#">1</a></li>
            <li class="page-item active"><a class="page-link" href="#">2</a></li>
            <li class="page-item"><a class="page-link" href="#">3</a></li>
            <li class="page-item"><a class="page-link" href="#">4</a></li>
            <li class="page-item"><a class="page-link" href="#">5</a></li>
            <li class="page-item">
                <a class="page-link" href="#">next</a>
            </li>
        </ul>
    </div>
</div>
</template>

<script>
import { ListIcon, PolaroidIcon } from 'vue-tabler-icons'
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
        team: Number
    },
    data: function() {
        return {
            mode: 'list',
            loading: true,
            users: { },
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

            this.users = await window.std(url);
            this.loading = false;
        },
    },
    components: {
        None,
        ListIcon,
        PolaroidIcon,
        UserProfile,
        TablerLoading
    }
}
</script>
