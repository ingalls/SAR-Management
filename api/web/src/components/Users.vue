<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a @click='$router.push("/")' class='cursor-pointer'>Home</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="#">Users</a></li>
                        </ol>

                        <div v-if='is_iam("User:Admin")' class='ms-auto'>
                            <a @click='$router.push("/user/new")' class="cursor-pointer btn btn-primary">
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
                    <CardUsers v-if='is_iam("User:View")'/>
                    <NoAccess v-else title='Users'/>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import CardUsers from './cards/Users.vue';
import NoAccess from './util/NoAccess.vue';
import iam from '../iam.js';

export default {
    name: 'Users',
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
        CardUsers,
        NoAccess
    }
}
</script>
