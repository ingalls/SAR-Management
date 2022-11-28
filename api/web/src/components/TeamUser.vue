<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a @click='$router.push("/")' class="cursor-pointer">Home</a></li>
                            <li class="breadcrumb-item" aria-current="page"><a  @click='$router.push("/team")' class="cursor-pointer">Team</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="#">User</a></li>
                        </ol>
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
                            <h3 class='card-title' v-text='`${user.fname} ${user.lname}`'></h3>

                            <div class='ms-auto'>
                                <div class='btn-list'>
                                    <div class='ms-auto'>
                                        <span v-if='user.access === "admin"' class="badge bg-red">Admin</span>
                                        <span v-if='user.access === "user"' class="badge bg-blue">User</span>
                                        <span v-if='user.access === "read"' class="badge bg-gray">Read</span>
                                    </div>

                                    <button data-bs-toggle="dropdown" type="button" class="btn dropdown-toggle dropdown-toggle-split" aria-expanded="false"></button>
                                    <div class="dropdown-menu dropdown-menu-end" style="">
                                        <a @click='$router.push(`/team/user/${$route.params.userid}/edit`)' class="dropdown-item cursor-pointer">Edit</a>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div class='row row-0'>
                            <div class='col-3'>
                                <img v-if='user.profile_id' src='/user.webp'/>
                                <img v-else src='/user.webp'/>
                            </div>
                            <div class='col'>
                                <div class="card-body">
                                    <div class="datagrid">
                                        <div class="datagrid-item">
                                            <div class="datagrid-title">Username</div>
                                            <div class="datagrid-content" v-text='user.username'></div>
                                        </div>
                                        <div class="datagrid-item">
                                            <div class="datagrid-title">Email</div>
                                            <div class="datagrid-content" v-text='user.email'></div>
                                        </div>
                                        <div class="datagrid-item">
                                            <div class="datagrid-title">Phone</div>
                                            <div class="datagrid-content" v-text='user.phone'></div>
                                        </div>
                                        <div class="datagrid-item">
                                            <div class="datagrid-title">Teams</div>
                                            <div class="datagrid-content">So Many Teams!</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="card">
                        <div class='card-header'>
                            <h3 class='card-title'>Issued Equipment</h3>
                        </div>
                        <div class="card-body">
                        </div>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="card">
                        <div class='card-header'>
                            <h3 class='card-title'>Assigned Issues</h3>
                        </div>
                        <div class="card-body">
                        </div>
                    </div>
                </div>
                <div class="col-lg-12">
                    <div class="card">
                        <div class='card-header'>
                            <h3 class='card-title'>Mission Log</h3>
                        </div>
                        <div class="card-body">
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
import PageFooter from './PageFooter.vue';
import Err from './Err.vue';

export default {
    name: 'TeamUser',
    data: function() {
        return {
            err: false,
            user: {}
        }
    },
    mounted: function() {
        this.fetch();
    },
    methods: {
        fetch: async function() {
            try {
                this.user = await window.std(`/api/user/${this.$route.params.userid}`);
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
