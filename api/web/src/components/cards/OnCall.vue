<template>
    <div class='card h-100 w-100'>
        <div class='card-header'>
            <IconGripVertical
                v-if='dragHandle'
                class='drag-handle cursor-move'
                :size='24'
                :stroke='1'
            />
            <h3 class='card-title'>
                <a
                    class='cursor-pointer'
                    @click='$router.push("/schedule")'
                >
                    On-Call Now
                </a>
            </h3>

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
                            @click='$emit("remove")'
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

        <NoAccess v-if='!is_iam("Oncall:View")' />
        <template v-else-if='loading'>
            <TablerLoading desc='Loading On-Call' />
        </template>
        <template v-else-if='!entries.length'>
            <TablerNone
                :create='false'
                label='No Active On-Call'
            />
        </template>
        <template v-else>
            <div class='list-group list-group-flush'>
                <div
                    v-for='(group, idx) in groupedEntries'
                    :key='idx'
                    class='list-group-item'
                >
                    <div class='row align-items-center'>
                        <div class='col-12'>
                            <div class='d-flex align-items-center mb-1'>
                                <IconCalendarEvent
                                    :size='16'
                                    :stroke='1.5'
                                    class='me-2 text-muted'
                                />
                                <span
                                    class='fw-bold text-primary cursor-pointer'
                                    @click='$router.push(`/schedule/${group.schedule_id}`)'
                                    v-text='group.schedule_name'
                                />
                            </div>
                            <div
                                v-for='entry in group.members'
                                :key='entry.uid'
                                class='d-flex align-items-center py-1'
                            >
                                <span class='avatar avatar-sm me-2'>
                                    {{ entry.fname.charAt(0) }}{{ entry.lname.charAt(0) }}
                                </span>
                                <div class='flex-fill'>
                                    <div class='d-flex align-items-center'>
                                        <span class='fw-medium'>
                                            {{ entry.fname }} {{ entry.lname }}
                                        </span>
                                        <span
                                            v-if='entry.is_override'
                                            class='badge bg-yellow-lt ms-2'
                                        >
                                            Override
                                        </span>
                                    </div>
                                    <small class='text-muted'>
                                        Until {{ formatTime(entry.end_ts) }}
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import moment from 'moment';
import iamHelper from '../../iam.js';
import NoAccess from '../util/NoAccess.vue';
import {
    TablerNone,
    TablerLoading,
    TablerDropdown
} from '@tak-ps/vue-tabler';
import {
    IconGripVertical,
    IconDotsVertical,
    IconTrash,
    IconCalendarEvent,
} from '@tabler/icons-vue';

const props = defineProps({
    dragHandle: {
        type: Boolean,
        default: false,
    },
    menu: {
        type: Boolean,
        default: false,
    },
    iam: {
        type: Object,
        required: true
    },
    auth: {
        type: Object,
        required: true
    }
});

defineEmits(['remove']);

const loading = ref(true);
const entries = ref([]);

const is_iam = (permission) => iamHelper(props.iam, props.auth, permission);

const formatTime = (ts) => {
    return moment(ts).format('ddd MMM D, h:mm A');
};

const groupedEntries = computed(() => {
    const groups = {};
    for (const entry of entries.value) {
        if (!groups[entry.schedule_id]) {
            groups[entry.schedule_id] = {
                schedule_id: entry.schedule_id,
                schedule_name: entry.schedule_name,
                members: []
            };
        }
        groups[entry.schedule_id].members.push(entry);
    }
    return Object.values(groups);
});

const fetchOnCall = async () => {
    loading.value = true;
    try {
        entries.value = await window.std('/api/schedule/oncall');
    } catch (err) {
        entries.value = [];
    }
    loading.value = false;
};

onMounted(async () => {
    await fetchOnCall();
});
</script>
