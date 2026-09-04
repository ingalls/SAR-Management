<template>
    <div class='card h-100 w-100'>
        <div
            v-if='dragHandle || menu'
            class='card-header'
        >
            <IconGripVertical
                v-if='dragHandle'
                class='drag-handle cursor-move'
                :size='24'
                :stroke='1'
            />
            <h3
                class='card-title'
                v-text='label'
            />
            <div class='btn-list ms-auto'>
                <TablerDropdown v-if='menu'>
                    <IconDotsVertical
                        class='cursor-pointer'
                        :size='32'
                        :stroke='1'
                    />
                    <template #dropdown>
                        <button
                            class='dropdown-item text-danger'
                            @click.stop='$emit("remove")'
                        >
                            <IconTrash
                                class='me-1'
                                :size='20'
                                :stroke='1'
                            />
                            Remove Widget
                        </button>
                    </template>
                </TablerDropdown>
            </div>
        </div>
        <NoAccess
            v-if='iam && auth && !is_iam("Training:View")'
            :compact='true'
        />
        <div
            v-else
            class='card-body'
        >
            <div class='d-flex'>
                <h3
                    v-if='!dragHandle && !menu'
                    class='subheader'
                    v-text='label'
                />

                <div class='ms-auto'>
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
                    class='subheader mt-2'
                    v-text='`${attended} of ${total} required trainings`'
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
    TablerSelect,
    TablerLoading,
    TablerProgress,
    TablerDropdown
} from '@tak-ps/vue-tabler';
import {
    IconGripVertical,
    IconDotsVertical,
    IconTrash
} from '@tabler/icons-vue';
import iamHelper from '../../iam.js';
import NoAccess from '../util/NoAccess.vue';
import moment from 'moment';

const props = defineProps({
    label: {
        type: String,
        default: 'Annual Training Rate (To Date)'
    },
    assigned: {
        type: Number,
        default: null
    },
    dragHandle: {
        type: Boolean,
        default: false
    },
    menu: {
        type: Boolean,
        default: false
    },
    iam: {
        type: Object,
        default: null
    },
    auth: {
        type: Object,
        default: null
    }
})

defineEmits(['remove']);

const is_iam = (permission) => iamHelper(props.iam, props.auth, permission);

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
    const url = window.stdurl('/api/training');
    url.searchParams.append('limit', 1);
    url.searchParams.append('required', 'true');

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

    url.searchParams.delete('required');
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
