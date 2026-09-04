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
                        <CardIssues
                            label='Issues'
                            :create='true'
                            :iam='iam'
                            :auth='auth'
                            :search='true'
                            :limit='20'
                            :initial='initial'
                            @query='onQuery'
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import CardIssues from './cards/Issues.vue';
import { fromQuery } from '../base/issue-filters.js';
import {
    TablerBreadCrumb,
} from '@tak-ps/vue-tabler';

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

// Filters restored from the URL so filtered views are shareable links
const initial = fromQuery(route.query);

function onQuery(query) {
    router.replace({ query });
}
</script>
