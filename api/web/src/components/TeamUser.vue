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
                                        <a @click='$router.push(`/team/user/${userid}/edit`)' class="dropdown-item cursor-pointer">Edit</a>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div class='row row-0'>
                            <div class='col-3'>
                                <UserProfile :user='user'/>
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
                                            <div class="datagrid-title">Birthday</div>
                                            <div class="datagrid-content" v-text='user.bday'></div>
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
                    <CardEquipment
                        label='Assigned Equipment'
                        :assigned='auth.id'
                    />
                </div>
                <div class="col-lg-6">
                    <CardIssues
                        label='Assigned Issues'
                        :assigned='auth.id'
                    />
                </div>
                <div class="col-lg-12">
                    <CardMission
                        label='Mission Log'
                        :assigned='auth.id'
                    />
                </div>
            </div>
        </div>
    </div>

    <PageFooter/>
    <TablerError v-if='err' :err='err' @close='err = null'/>
</div>
</template>

<script>
import PageFooter from './PageFooter.vue';
import UserProfile from './User/Profile.vue';
import CardIssues from './cards/Issues.vue';
import CardEquipment from './cards/Equipment.vue';
import CardMission from './cards/Missions.vue';
import {
    TablerError
} from '@tak-ps/vue-tabler';

export default {
    name: 'TeamUser',
    props: {
        auth: Object
    },
    data: function() {
        return {
            userid: this.$route.name === 'profile' ? this.auth.id : this.$route.params.userid,
            err: false,
            user: {
                profile_id: null
            }
        }
    },
    mounted: function() {
        this.fetch();
    },
    methods: {
        fetch: async function() {
            try {
                this.user = await window.std(`/api/user/${this.userid}`);
            } catch (err) {
                this.err = err;
            }
        }
    },
    components: {
        TablerError,
        PageFooter,
        UserProfile,
        CardIssues,
        CardMission,
        CardEquipment
    }
}
</script>
