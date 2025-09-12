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
                        <CardTrainings
                            label='Trainings'
                            :auth='auth'
                            :iam='iam'
                            :limit='20'
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import CardTrainings from './cards/Trainings.vue'
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
</script>
