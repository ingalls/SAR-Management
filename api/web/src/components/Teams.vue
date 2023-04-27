<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <TablerBreadCrumb/>

                        <div class='ms-auto'>
                            <a v-if='is_iam("User:Admin")' @click='$router.push("/user/new")' class="cursor-pointer btn btn-primary">
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
                    <CardLeadership v-if='is_iam("Leadership:View")'/>
                    <NoAccess title='Leadership Team' v-else/>
                </div>
                <div class="col-lg-12">
                    <CardTeams v-if='is_iam("Team:View")'/>
                    <NoAccess title='Teams' v-else/>
                </div>
                <div class="col-lg-12">
                    <CardUsers v-if='is_iam("User:View")'/>
                    <NoAccess title='Users' v-else/>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import CardLeadership from './cards/Leadership.vue';
import CardUsers from './cards/Users.vue';
import CardTeams from './cards/Teams.vue';
import {
    TablerBreadCrumb 
} from '@tak-ps/vue-tabler';
import NoAccess from './util/NoAccess.vue';
import iam from '../iam.js';

export default {
    name: 'Team',
    props: {
        iam: {
            type: Object,
            required: true
        },
        auth: {
            type: Object,
            required: true
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) }
    },
    components: {
        CardLeadership,
        CardUsers,
        CardTeams,
        TablerBreadCrumb,
        NoAccess
    }
}
</script>
