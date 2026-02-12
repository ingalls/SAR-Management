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
                        <IncidentsCard
                            label='Incidents'
                            :incidents='list.items'
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
import { ref, onMounted } from 'vue';
import IncidentsCard from './util/IncidentsCard.vue';
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

const list = ref({
    total: 0,
    items: []
});

const fetch = async () => {
    list.value = await window.std('/api/incident');
}

onMounted(async () => {
    await fetch();
});
</script>
