<template>
    <div class='card'>
        <div class='card-body'>
            <div class='d-flex'>
                <h3
                    class='subheader'
                    v-text='label'
                />

                <div class='ms-auto btn-list'>
                    <h3
                        class='subheader'
                        v-text='Math.round(percent * 100) + "%"'
                    />
                </div>
            </div>
            <TablerLoading v-if='loading' />
            <template v-else>
                <TablerProgress
                    :key='percent'
                    :percent='percent'
                />
            </template>
            <div class='d-flex'>
                <h3
                    class='mt-2 subheader'
                    v-text='`${attended} of ${total} Missions`'
                />
                <div class='ms-auto btn-list mt-1'>
                    <TablerSelect
                        v-model='range'
                        :options='["Current Year", "1st Quarter", "2nd Quarter", "3rd Quarter", "4th Quarter", "All Time"]'
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import {
    TablerLoading,
    TablerSelect,
    TablerProgress
} from '@tak-ps/vue-tabler';
import moment from 'moment';

const props = defineProps({
    label: {
        type: String,
        default: 'Annual Mission Rate'
    },
    assigned: {
        type: Number,
        default: null
    }
})

const range = ref('Current Year')
const loading = ref(true)
const total = ref(0)
const attended = ref(0)
const percent = ref(0)

const getQuarterRange = (quarter) => {
    const start = moment().quarter(quarter).startOf('quarter').format('YYYY-MM-DD');
    const end = moment().quarter(quarter).endOf('quarter').format('YYYY-MM-DD');
    return {start, end};
}

const fetch = async () => {
    loading.value = true;
    const url = window.stdurl('/api/mission');
    url.searchParams.append('limit', 1);

    if (range.value.includes('Quarter')) {
        const q = parseInt(range.value[0]);
        const { start, end } = getQuarterRange(q);
        url.searchParams.append('start', start);
        url.searchParams.append('end', end);
    } else if (range.value !== 'All Time') {
        url.searchParams.append('start', moment().format('YYYY') + '-01-01');
        url.searchParams.append('end', moment().format('YYYY-MM-DD'));
    }

    total.value = (await window.std(url)).total;

    url.searchParams.append('assigned', props.assigned);

    attended.value = (await window.std(url)).total;

    if (total.value === 0) percent.value = 1;
    else percent.value = attended.value / total.value;

    loading.value = false;
}

watch(range, async () => {
    await fetch();
})

onMounted(async () => {
    await fetch();
})
</script>
