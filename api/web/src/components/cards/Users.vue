<template>
<div class="card">
    <div class='card-header'>
        <div class="col">
            <div class="d-flex">
                <h3 class='card-title'>Users</h3>

                <div class='ms-auto'>
                    <div class="btn-list">
                        <div class="btn-group" role="group">
                            <input type="radio" class="btn-check" name="btn-radio-toolbar" id="btn-radio-toolbar-1" autocomplete="off" checked="">
                                <label for="btn-radio-toolbar-1" class="btn btn-icon">
                                    <ListIcon/>
                                </label>
                                <input type="radio" class="btn-check" name="btn-radio-toolbar" id="btn-radio-toolbar-7" autocomplete="off">
                                <label for="btn-radio-toolbar-7" class="btn btn-icon">
                                    <PolaroidIcon/>
                                </label>
                        </div>

                        <button data-bs-toggle="dropdown" type="button" class="btn dropdown-toggle dropdown-toggle-split" aria-expanded="false"></button>
                        <div class="dropdown-menu dropdown-menu-end" style="">
                            <a @click='$router.push("/team/user/new")' class="dropdown-item">New User</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class='table-responsive'>
        <table class="table card-table table-vcenter datatable">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Teams</th>
                </tr>
            </thead>
            <tbody>
                <tr :key='user.id' v-for='user in users.users'>
                    <td @click='$router.push(`/team/user/${user.id}`)'>
                        <a class='text-reset cursor-pointer' v-text='user.fname + " " + user.lname'></a>
                    </td>
                    <td><a :href='`mailto:${user.email}`' v-text='user.email'></a></td>
                    <td><a :href='`tel:${user.email}`' v-text='user.phone'></a></td>
                </tr>
            </tbody>
        </table>
    </div>
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
    <Err v-if='err' :err='err' @close='err = null'/>
</div>
</template>

<script>
import Err from '../Err.vue';
import { ListIcon, PolaroidIcon } from 'vue-tabler-icons'

export default {
    name: 'CardUsers',
    data: function() {
        return {
            err: false,
            users: { },
        }
    },
    mounted: function() {
        this.listUsers();
    },
    methods: {
        listUsers: async function() {
            try {
                this.users = await window.std('/api/user');
            } catch (err) {
                this.err = err;
            }
        },
    },
    components: {
        Err,
        ListIcon,
        PolaroidIcon,
    }
}
</script>
