<template>
    <StandardItem
        class='d-flex flex-row gap-3 position-relative p-3'
        @click='$router.push(`/training/${training.id}`)'
    >
        <div class='icon-wrapper d-flex align-items-center justify-content-center rounded-circle bg-black bg-opacity-25'>
            <IconUserCheck
                v-if='attendance && training.users && training.users.includes(auth.id)'
                v-tooltip='"Attended"'
                size='32'
                stroke='1'
                color='green'
            />
            <IconSchool
                v-else
                size='32'
                stroke='1'
            />
        </div>

        <div class='flex-grow-1 d-flex flex-column gap-2'>
            <div class='d-flex flex-wrap align-items-center gap-2'>
                <span
                    class='fw-semibold text-break'
                    v-text='training.title'
                />
                <div class='ms-auto btn-list h-25'>
                    <template
                        v-for='team in training.teams'
                        :key='team.id'
                    >
                        <TeamBadge
                            :team='team'
                            class='ms-auto'
                        />
                    </template>
                    <TablerBadge
                        v-if='training.required'
                        class='ms-auto'
                        background-color='#d63939'
                        text-color='#ffffff'
                    >
                        Required
                    </TablerBadge>
                </div>
            </div>

            <div class='d-flex flex-wrap gap-3 text-muted small'>
                <div v-if='training.start_ts || training.end_ts'>
                    <IconCalendar
                        size='14'
                        stroke='1'
                        class='me-1'
                    />
                    <TablerEpochRange
                        :start='training.start_ts'
                        :end='training.end_ts'
                    />
                </div>
                <div v-if='training.location'>
                    <IconMapPin
                        size='14'
                        stroke='1'
                        class='me-1'
                    />
                    <span v-text='training.location' />
                </div>
            </div>
        </div>
    </StandardItem>
</template>

<script setup>
import StandardItem from './StandardItem.vue';
import TeamBadge from './TeamBadge.vue';
import {
    TablerBadge,
    TablerEpochRange
} from '@tak-ps/vue-tabler';
import {
    IconUserCheck,
    IconSchool,
    IconCalendar,
    IconMapPin
} from '@tabler/icons-vue';

defineProps({
    training: {
        type: Object,
        required: true
    },
    auth: {
        type: Object,
        required: true
    },
    attendance: {
        type: Boolean,
        default: true
    }
});
</script>
