<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <TablerBreadCrumb/>

                        <div class='ms-auto btn-list'>
                            <a v-if='is_iam("Training:Manage")' @click='$router.push("/training/new")' class="cursor-pointer btn btn-primary">
                                New Training
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
                    <CardCalendar
                        :iam='iam'
                        :auth='auth'
                    />
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import iam from '../iam.js';
import {
    TablerBreadCrumb
} from '@tak-ps/vue-tabler';
import CardCalendar from './cards/Calendar.vue';

export default {
    name: 'Calendar',
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
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
    },
    components: {
        TablerBreadCrumb,
        CardCalendar
    }
}
</script>
