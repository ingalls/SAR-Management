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
                    <Builder/>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import Builder from './util/Builder.vue';
import {
    TablerInput,
    TablerBreadCrumb,
} from '@tak-ps/vue-tabler';

export default {
    name: 'Applications',
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
        Builder,
        TablerInput,
        TablerBreadCrumb,
    }
}
</script>
