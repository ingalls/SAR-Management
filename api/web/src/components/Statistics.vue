<template>
    <div>
        <div class='page-wrapper'>
            <div class='page-header d-print-none'>
                <div class='container-xl'>
                    <div class='row g-2 align-items-center'>
                        <div class='col d-flex'>
                            <TablerBreadCrumb />
                        </div>
                        <div class='col-auto ms-auto d-print-none'>
                            <div class='d-flex align-items-center'>
                                <div class='me-2'>
                                    <select
                                        v-model='mode'
                                        class='form-select'
                                    >
                                        <option value='30days'>
                                            Last 30 Days
                                        </option>
                                        <option value='quarter'>
                                            Last Quarter
                                        </option>
                                        <option value='ytd'>
                                            Year to Date
                                        </option>
                                        <option
                                            v-for='year in years'
                                            :key='year'
                                            :value='String(year)'
                                        >
                                            {{ year }}
                                        </option>
                                        <option value='custom'>
                                            Custom
                                        </option>
                                    </select>
                                </div>

                                <template v-if='mode === &apos;custom&apos;'>
                                    <div class='me-2'>
                                        <TablerInput
                                            v-model='custom.start'
                                            type='date'
                                        />
                                    </div>
                                    <div class='me-2'>
                                        <TablerInput
                                            v-model='custom.end'
                                            type='date'
                                        />
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class='page-body'>
            <div class='container-xl'>
                <div v-if='!iam || !iam.Statistics || iam.Statistics.access === &apos;none&apos;'>
                    <NoAccess />
                </div>
                <div
                    v-else
                    class='row row-deck row-cards'
                >
                    <div class='col-lg-6'>
                        <div class='card'>
                            <div
                                v-if='!loading.missions'
                                class='card-body'
                            >
                                <div class='d-flex align-items-center'>
                                    <div class='subheader'>
                                        Missions
                                    </div>
                                    <div class='ms-auto lh-1'>
                                        <div class='text-muted'>
                                            {{ mode }}
                                        </div>
                                    </div>
                                </div>
                                <div class='h1 mb-3'>
                                    {{ stats.missions }}
                                </div>
                                <div class='d-flex mb-2'>
                                    <div>Personnel Hours</div>
                                    <div class='ms-auto'>
                                        <span class='text-green d-inline-flex align-items-center lh-1'>
                                            {{ stats.mission_hours }}
                                            <IconAmbulance
                                                class='ms-1'
                                                :size='16'
                                            />
                                        </span>
                                    </div>
                                </div>
                                <div class='d-flex mb-2'>
                                    <div>Longest Mission</div>
                                    <div class='ms-auto'>
                                        <span
                                            v-if='stats.mission_longest'
                                            class='text-green d-inline-flex align-items-center lh-1'
                                        >
                                            <router-link
                                                :to='"/mission/" + stats.mission_longest.id'
                                                class='me-2'
                                            >{{ stats.mission_longest.name }}</router-link>
                                            {{ stats.mission_longest.hours }} Hours
                                        </span>
                                        <span
                                            v-else
                                            class='text-muted'
                                        >
                                            N/A
                                        </span>
                                    </div>
                                </div>
                                <div class='d-flex mb-2'>
                                    <div>Average Mission</div>
                                    <div class='ms-auto'>
                                        <span class='text-green d-inline-flex align-items-center lh-1'>
                                            {{ stats.mission_average }} Hours
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <TablerLoading v-else />
                        </div>
                    </div>
                    <div class='col-lg-6'>
                        <div class='card'>
                            <div
                                v-if='!loading.trainings'
                                class='card-body'
                            >
                                <div class='d-flex align-items-center'>
                                    <div class='subheader'>
                                        Trainings
                                    </div>
                                    <div class='ms-auto lh-1'>
                                        <div class='text-muted'>
                                            {{ mode }}
                                        </div>
                                    </div>
                                </div>
                                <div class='h1 mb-3'>
                                    {{ stats.trainings }}
                                </div>
                                <div class='d-flex mb-2'>
                                    <div>Personnel Hours</div>
                                    <div class='ms-auto'>
                                        <span class='text-green d-inline-flex align-items-center lh-1'>
                                            {{ stats.training_hours }}
                                            <IconTruck
                                                class='ms-1'
                                                :size='16'
                                            />
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <TablerLoading v-else />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import NoAccess from './util/NoAccess.vue';
import {
    IconAmbulance,
    IconTruck
} from '@tabler/icons-vue';
import {
    TablerInput,
    TablerBreadCrumb,
    TablerLoading
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

const years = [];
const currentYear = new Date().getFullYear();
for (let i = 0; i < 3; i++) {
    years.push(currentYear - i);
}

const mode = ref('30days');

const custom = ref({
    start: '',
    end: ''
});

const loading = ref({
    missions: true,
    trainings: true
});

const stats = ref({
    missions: 0,
    mission_hours: 0,
    mission_longest: null,
    mission_average: 0,
    trainings: 0,
    training_hours: 0
});

watch(mode, () => {
    fetch();
});

watch(custom, () => {
    if (mode.value === 'custom' && custom.value.start && custom.value.end) {
        fetch();
    }
}, { deep: true });

const fetch = async () => {
    let start = new Date();
    let end = new Date();

    if (mode.value === '30days') {
        start.setDate(start.getDate() - 30);
    } else if (mode.value === 'quarter') {
        start.setMonth(start.getMonth() - 3);
    } else if (mode.value === 'ytd') {
        start = new Date(start.getFullYear(), 0, 1);
    } else if (!isNaN(parseInt(mode.value))) {
        const year = parseInt(mode.value);
        start = new Date(year, 0, 1);
        end = new Date(year, 11, 31, 23, 59, 59);
    } else if (mode.value === 'custom') {
        if (!custom.value.start || !custom.value.end) return;
        start = new Date(custom.value.start);
        end = new Date(custom.value.end);
    }
    
    loading.value.missions = true;
    loading.value.trainings = true;

    window.std(`/api/stats/mission?start=${start.toISOString()}&end=${end.toISOString()}`).then((res) => {
        stats.value.mission_hours = res.hours;
        stats.value.missions = res.count;
        stats.value.mission_longest = res.longest_mission;
        stats.value.mission_average = res.average;
        loading.value.missions = false;  
    });

    window.std(`/api/stats/training?start=${start.toISOString()}&end=${end.toISOString()}`).then((res) => {
        stats.value.trainings = res.count;
        stats.value.training_hours = res.hours;
        loading.value.trainings = false;
    })
}

onMounted(async () => {
    if (props.iam && props.iam.Statistics && props.iam.Statistics.access !== 'none') {
        await fetch();
    }
});
</script>
