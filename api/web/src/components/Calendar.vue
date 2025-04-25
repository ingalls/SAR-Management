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

<script setup>
import is_iam from '../iam.js';
import {
    TablerBreadCrumb
} from '@tak-ps/vue-tabler';
import CardCalendar from './cards/Calendar.vue';

const props = defineProps({
    iam: {
        type: Object,
        required: true
    },
    auth: {
        type: Object,
        required: true
    }
});
</script>
