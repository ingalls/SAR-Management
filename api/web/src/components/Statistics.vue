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
                <div v-if='!iam || !iam.Statistics || iam.Statistics.access === "none"'>
                    <NoAccess />
                </div>
                <div v-else class='row row-deck row-cards'>
                    <div class='col-lg-6'>
                        <div class='card'>
                            <div class='card-body'>
                                <div class='d-flex align-items-center'>
                                    <div class='subheader'>Missions</div>
                                </div>
                                <div class='h1 mb-3'>{{ stats.missions }}</div>
                            </div>
                        </div>
                    </div>
                    <div class='col-lg-6'>
                        <div class='card'>
                            <div class='card-body'>
                                <div class='d-flex align-items-center'>
                                    <div class='subheader'>Trainings</div>
                                </div>
                                <div class='h1 mb-3'>{{ stats.trainings }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import NoAccess from './util/NoAccess.vue';
import {
    TablerBreadCrumb,
} from '@tak-ps/vue-tabler';

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

const stats = ref({
    missions: 0,
    trainings: 0
});

const fetch = async () => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    
    stats.value = await window.std(`/api/stats?start=${start.toISOString()}&end=${end.toISOString()}`);
}

onMounted(async () => {
    if (props.iam && props.iam.Statistics && props.iam.Statistics.access !== 'none') {
        await fetch();
    }
});
</script>
