<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <TablerBreadCrumb/>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div class="col-lg-12">
                    <ServerConfig :auth='auth'/>
                </div>
                <template v-if='auth.access === "admin"'>
                    <div class="col-lg-4">
                        <CardRoles/>
                    </div>
                </template>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import CardRoles from './Admin/Roles.vue';
import ServerConfig from './Admin/ServerConfig.vue';
import {
    TablerBreadCrumb
} from '@tak-ps/vue-tabler';

export default {
    name: 'Admin',
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
    components: {
        CardRoles,
        TablerBreadCrumb,
        ServerConfig,
    }
}
</script>
