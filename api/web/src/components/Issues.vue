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
                    <CardIssues
                        label='Issues'
                        :iam='iam'
                        :auth='auth'
                        :limit='20'
                    />
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import CardIssues from './cards/Issues.vue';
import {
    TablerBreadCrumb,
} from '@tak-ps/vue-tabler';

export default {
    name: 'Issues',
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
        TablerBreadCrumb,
        CardIssues,
    }
}
</script>
