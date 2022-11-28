<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a @click='$router.push("/")' class="cursor-pointer">Home</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="#">Profile</a></li>
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
                            <h3 class='card-title' v-text='`${usr.fname} ${usr.lname}`'></h3>

                            <div class='ms-auto'>
                                <div class='btn-list'>
                                    <div class='ms-auto'>
                                        <span v-if='usr.access === "admin"' class="badge bg-red">Admin</span>
                                        <span v-if='usr.access === "user"' class="badge bg-blue">User</span>
                                        <span v-if='usr.access === "read"' class="badge bg-gray">Read</span>
                                    </div>

                                    <button data-bs-toggle="dropdown" type="button" class="btn dropdown-toggle dropdown-toggle-split" aria-expanded="false"></button>
                                    <div class="dropdown-menu dropdown-menu-end" style="">
                                        <a @click='$router.push(`/team/user/${$route.params.userid}/edit`)' class="dropdown-item cursor-pointer">Edit</a>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div class="card-body">
                            <div class="datagrid">
                                <div class="datagrid-item">
                                    <div class="datagrid-title">Username</div>
                                    <div class="datagrid-content" v-text='usr.username'></div>
                                </div>
                                <div class="datagrid-item">
                                    <div class="datagrid-title">Email</div>
                                    <div class="datagrid-content" v-text='usr.email'></div>
                                </div>
                                <div class="datagrid-item">
                                    <div class="datagrid-title">Phone</div>
                                    <div class="datagrid-content" v-text='usr.phone'></div>
                                </div>
                                <div class="datagrid-item">
                                    <div class="datagrid-title">Teams</div>
                                    <div class="datagrid-content">So Many Teams!</div>
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
    props: {
        user: Object
    },
    data: function() {
        return {
            err: false,
            usr: {}
        }
    },
    mounted: function() {
        this.fetch();
    },
    methods: {
        fetch: async function() {
            try {
                this.usr = await window.std(`/api/user/${this.$route.name === 'profile' ? this.user.id : this.$route.params.userid}`);
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
