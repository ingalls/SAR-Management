<template>
    <div class='d-flex align-items-start px-2'>
        <span
            class='avatar avatar-xs avatar-rounded me-2 flex-shrink-0'
            :class='`bg-${colour}-lt`'
        >
            <component
                :is='icon'
                :size='16'
                stroke='1.5'
            />
        </span>
        <div
            class='flex-grow-1'
            style='min-width: 0;'
        >
            <div class='d-flex flex-wrap align-items-center gap-1'>
                <span
                    class='fw-bold'
                    v-text='actor'
                />
                <template v-if='event.type === "status"'>
                    <span>changed the status from</span>
                    <StatusBadge :status='String(event.meta.from)' />
                    <span>to</span>
                    <StatusBadge :status='String(event.meta.to)' />
                </template>
                <span
                    v-else
                    v-text='summary'
                />
                <span
                    class='text-muted small'
                    :title='event.created'
                    v-text='fromNow(event.created)'
                />
            </div>
            <div
                v-if='event.body'
                class='text-muted mt-1'
                style='word-break: break-word; white-space: pre-wrap;'
                v-text='event.body'
            />
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import StatusBadge from './StatusBadge.vue';
import { statusMeta } from './status.ts';
import { fromNow } from '../../base/time.js';
import {
    IconArrowsExchange,
    IconFileImport,
    IconLink,
    IconMail,
    IconPencil,
    IconTag,
    IconUserCheck
} from '@tabler/icons-vue';

const props = defineProps({
    event: {
        type: Object,
        required: true
    }
});

const actor = computed(() => {
    if (props.event.user) return `${props.event.user.fname} ${props.event.user.lname}`;
    if (props.event.type === 'created') return 'The applicant';
    return 'The system';
});

const icon = computed(() => {
    return {
        created: IconFileImport,
        status: IconArrowsExchange,
        assigned: IconUserCheck,
        cohort: IconTag,
        edited: IconPencil,
        linked: IconLink,
        email: IconMail
    }[props.event.type] || IconPencil;
});

const colour = computed(() => {
    if (props.event.type === 'status') return statusMeta(String(props.event.meta.to)).colour;
    if (props.event.type === 'created') return 'azure';
    return 'secondary';
});

const summary = computed(() => {
    const meta = props.event.meta || {};

    switch (props.event.type) {
        case 'created':
            if (meta.source === 'reviewer') return 'entered the application on behalf of the applicant';
            return 'submitted the application';
        case 'assigned':
            if (meta.to === null || meta.to === undefined) return `removed ${meta.from_name || 'the reviewer'} as reviewer`;
            if (props.event.user && meta.to === props.event.user.id) return 'became the reviewer';
            return `made ${meta.to_name || 'a member'} the reviewer`;
        case 'cohort':
            return `moved the application from cohort ${meta.from} to ${meta.to}`;
        case 'edited':
            return `edited ${(meta.fields || []).join(', ') || 'the application'}`;
        case 'linked':
            if (meta.to === null || meta.to === undefined) return `unlinked the member account of ${meta.from_name || 'a member'}`;
            return `linked the member account of ${meta.to_name || 'a member'}`;
        case 'email':
            return 'emailed the applicant';
        default:
            return props.event.type;
    }
});
</script>
