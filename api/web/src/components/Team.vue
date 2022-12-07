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
                    <CardLeadership/>
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
                    <CardUsers/>
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
import CardLeadership from './cards/Leadership.vue';
import CardUsers from './cards/Users.vue';

export default {
    name: 'Team',
    data: function() {
        return {
            err: false,
            users: { },
            teams: {
                total: 0,
                teams: []
            }
        }
    },
    mounted: function() {
        this.listTeams();
    },
    methods: {
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
        CardLeadership,
        CardUsers
    }
}
</script>
