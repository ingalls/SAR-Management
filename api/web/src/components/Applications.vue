<template>
    <div>
        <div class='page-wrapper'>
            <div class='page-header d-print-none'>
                <div class='container-xl'>
                    <div class='row g-2 align-items-center'>
                        <div class='col d-flex'>
                            <TablerBreadCrumb />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class='page-body'>
            <div class='container-xl'>
                <div class='row row-deck row-cards'>
                    <div class='col-lg-12'>
                        <CardApplications
                            :auth='auth'
                            :iam='iam'
                            :limit='20'
                            :initial='route.query'
                            @query='router.replace({ query: $event })'
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import CardApplications from './cards/Applications.vue';
import {
    TablerBreadCrumb,
} from '@tak-ps/vue-tabler'

defineProps({
    iam: {
        type: Object,
        required: true
    },
    auth: {
        type: Object,
        required: true
    }
})

const route = useRoute();
const router = useRouter();
</script>
