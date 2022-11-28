<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a @click='$router.push("/")' class='cursor-pointer'>Home</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="#">Team</a></li>
                        </ol>

                        <div class='ms-auto'>
                            <a @click='$router.push("/team/user/new")' class="cursor-pointer btn btn-primary">
                                New User
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div class="col-lg-12">
                    <div class="card">
                        <div class='card-header'>
                            <div class="col">
                                <div class="d-flex">
                                    <h3 class='card-title'>Leadership Team</h3>

                                    <div class='ms-auto'>
                                        <div class="btn-list">
                                            <button data-bs-toggle="dropdown" type="button" class="btn dropdown-toggle dropdown-toggle-split" aria-expanded="false"></button>
                                            <div class="dropdown-menu dropdown-menu-end" style="">
                                                <a @click='$router.push("/team/leadership")' class="dropdown-item cursor-pointer">Edit</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="datagrid">
                                <div class="datagrid-item">
                                    <div class="datagrid-title">President</div>
                                    <div class="datagrid-content">
                                        <div class="d-flex align-items-center">
                                            <span class="avatar avatar-xs me-2 avatar-rounded" style="background-image: url(./static/avatars/000m.jpg)"></span>
                                            Paweł Kuna
                                        </div>
                                    </div>
                                </div>
                                <div class="datagrid-item">
                                    <div class="datagrid-title">Vice-President</div>
                                    <div class="datagrid-content">
                                        <div class="d-flex align-items-center">
                                            <span class="avatar avatar-xs me-2 avatar-rounded" style="background-image: url(./static/avatars/000m.jpg)"></span>
                                            Paweł Kuna
                                        </div>
                                    </div>
                                </div>
                                <div class="datagrid-item">
                                    <div class="datagrid-title">Standards</div>
                                    <div class="datagrid-content">
                                        <div class="avatar-list avatar-list-stacked">
                                            <span class="avatar avatar-xs avatar-rounded" style="background-image: url(./static/avatars/000m.jpg)"></span>
                                            <span class="avatar avatar-xs avatar-rounded">JL</span>
                                            <span class="avatar avatar-xs avatar-rounded" style="background-image: url(./static/avatars/002m.jpg)"></span>
                                            <span class="avatar avatar-xs avatar-rounded" style="background-image: url(./static/avatars/003m.jpg)"></span>
                                            <span class="avatar avatar-xs avatar-rounded" style="background-image: url(./static/avatars/000f.jpg)"></span>
                                            <span class="avatar avatar-xs avatar-rounded">+3</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="datagrid-item">
                                    <div class="datagrid-title">Secretary</div>
                                    <div class="datagrid-content">
                                        <div class="d-flex align-items-center">
                                            <span class="avatar avatar-xs me-2 avatar-rounded" style="background-image: url(./static/avatars/000m.jpg)"></span>
                                            Paweł Kuna
                                        </div>
                                    </div>
                                </div>
                                <div class="datagrid-item">
                                    <div class="datagrid-title">Treasurer</div>
                                    <div class="datagrid-content">
                                        <div class="d-flex align-items-center">
                                            <span class="avatar avatar-xs me-2 avatar-rounded" style="background-image: url(./static/avatars/000m.jpg)"></span>
                                            Paweł Kuna
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-12">
                    <div class="card">
                        <div class='card-header'>
                            <div class="col">
                                <div class="d-flex">
                                    <h3 class='card-title'>Teams</h3>

                                    <div class='ms-auto'>
                                        <div class="btn-list">
                                            <button data-bs-toggle="dropdown" type="button" class="btn dropdown-toggle dropdown-toggle-split" aria-expanded="false"></button>
                                            <div class="dropdown-menu dropdown-menu-end" style="">
                                                <a @click='$router.push("/team/new")' class="dropdown-item cursor-pointer">New Team</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="table-responsive">
                            <table class="table card-table table-vcenter text-nowrap datatable">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr :key='team.id' v-for='team in teams.teams'>
                                        <td><a @click='$router.push(`/team/${team.id}`)' class='cursor-pointer' v-text='team.name'></a></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="col-lg-12">
                    <div class="card">
                        <div class='card-header'>
                            <div class="col">
                                <div class="d-flex">
                                    <h3 class='card-title'>Users</h3>

                                    <div class='ms-auto'>
                                        <div class="btn-list">
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
                    </div>
                </div>
            </div>
        </div>
    </div>

    <PageFooter/>

    <Err v-if='err' :err='err' @close='err = null'/>
</div>
</template>

<script>
import Err from './Err.vue';
import PageFooter from './PageFooter.vue';

export default {
    name: 'Team',
    data: function() {
        return {
            err: false,
            users: { },
            teams: { }
        }
    },
    mounted: function() {
        this.listUsers();
        this.listTeams();
    },
    methods: {
        listUsers: async function() {
            try {
                this.users = await window.std('/api/user');
            } catch (err) {
                this.err = err;
            }
        },
        listTeams: async function() {
            try {
                this.teams = await window.std('/api/team');
            } catch (err) {
                this.err = err;
            }
        }
    },
    components: {
        Err,
        PageFooter,
    }
}
</script>
