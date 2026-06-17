<template>
    <StandardItem
        class='d-flex flex-row gap-3 position-relative p-3'
        @click='$router.push(`/mission/${mission.id}`)'
    >
        <div class='icon-wrapper d-flex align-items-center justify-content-center rounded-circle bg-black bg-opacity-25'>
            <IconUserCheck
                v-if='attendance && mission.users && mission.users.includes(auth.id)'
                v-tooltip='"Attended"'
                size='32'
                stroke='1'
                color='green'
            />
            <IconAmbulance
                v-else
                size='32'
                stroke='1'
            />
        </div>

        <div class='flex-grow-1 d-flex flex-column gap-2'>
            <div class='d-flex flex-wrap align-items-center gap-2'>
                <span
                    class='fw-semibold text-break'
                    v-text='mission.title'
                />
                <div class='ms-auto btn-list h-25'>
                    <template
                        v-for='team in mission.teams'
                        :key='team.id'
                    >
                        <TeamBadge
                            :team='team'
                            class='ms-auto'
                        />
                    </template>
                    <TablerBadge
                        v-if='mission.required'
                        class='ms-auto'
                        background-color='#d63939'
                        text-color='#ffffff'
                    >
                        Required
                    </TablerBadge>
                </div>
            </div>

            <div class='d-flex flex-wrap gap-3 text-muted small'>
                <div v-if='mission.start_ts || mission.end_ts'>
                    <IconCalendar
                        size='14'
                        stroke='1'
                        class='me-1'
                    />
                    <TablerEpochRange
                        :start='mission.start_ts'
                        :end='mission.end_ts'
                    />
                </div>
                <div v-if='mission.location'>
                    <IconMapPin
                        size='14'
                        stroke='1'
                        class='me-1'
                    />
                    <span v-text='mission.location' />
                </div>
                <div v-if='mission.externalid'>
                    <IconHash
                        size='14'
                        stroke='1'
                        class='me-1'
                    />
                    <span v-text='mission.externalid' />
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
    IconAmbulance,
    IconCalendar,
    IconMapPin,
    IconHash
} from '@tabler/icons-vue';

defineProps({
    mission: {
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
