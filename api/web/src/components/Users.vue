<template>
    <div>
        <div class='page-wrapper'>
            <div class='page-header d-print-none'>
                <div class='container-xl'>
                    <div class='row g-2 align-items-center'>
                        <div class='col d-flex'>
                            <TablerBreadCrumb />

                            <div
                                v-if='is_iam("User:Admin")'
                                class='ms-auto'
                            >
                                <a
                                    class='cursor-pointer btn btn-primary'
                                    @click='$router.push("/user/new")'
                                >
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
                    <div class='col-lg-12'>
                        <CardUsers
                            v-if='is_iam("User:View")'
                            :limit='50'
                        />
                        <NoAccess
                            v-else
                            title='Users'
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import CardUsers from './cards/Users.vue';
import NoAccess from './util/NoAccess.vue';
import {
    TablerBreadCrumb
} from '@tak-ps/vue-tabler';
import iamHelper from '../iam.js';

const props = defineProps({
    iam: {
        type: Object,
        required: true
    },
    auth: {
        type: Object,
        required: true
    }
})

function is_iam(permission) { 
    return iamHelper(props.iam, props.auth, permission) 
}
</script>
