<template>
    <StandardItem
        class='d-flex flex-row gap-3 position-relative p-3'
        @click='$router.push(`/issue/${issue.id}`)'
    >
        <div
            class='icon-wrapper d-flex align-items-center justify-content-center rounded-circle bg-black bg-opacity-25'
            style='width: 48px; height: 48px; flex-shrink: 0;'
        >
            <IconCircleCheck
                v-if='issue.status === "closed"'
                v-tooltip='"Closed"'
                :size='32'
                stroke='1'
                color='#d63939'
            />
            <IconCircleDot
                v-else
                v-tooltip='"Open"'
                :size='32'
                stroke='1'
                color='#2fb344'
            />
        </div>

        <div class='flex-grow-1 d-flex flex-column gap-2 min-w-0'>
            <div class='d-flex flex-wrap align-items-center gap-2'>
                <span
                    class='fw-semibold text-break'
                    v-text='issue.title'
                />
                <template
                    v-for='tag in (issue.tags || [])'
                    :key='tag.id'
                >
                    <TagBadge :tag='tag' />
                </template>

                <div class='ms-auto d-flex align-items-center gap-2'>
                    <span
                        v-if='issue.poll_id'
                        v-tooltip='"Has Poll"'
                        class='text-muted d-inline-flex align-items-center'
                    >
                        <IconChartBar
                            :size='18'
                            stroke='1.5'
                        />
                    </span>
                    <span
                        v-tooltip='`${issue.comments || 0} Comment${issue.comments === 1 ? "" : "s"}`'
                        class='text-muted small d-inline-flex align-items-center'
                    >
                        <IconMessage
                            :size='18'
                            stroke='1.5'
                            class='me-1'
                        />
                        <span v-text='issue.comments || 0' />
                    </span>
                    <div
                        v-if='issue.assigned && issue.assigned.length'
                        class='avatar-list avatar-list-stacked'
                    >
                        <span
                            v-for='user in issue.assigned.slice(0, 4)'
                            :key='user.id'
                            v-tooltip='`${user.fname} ${user.lname}`'
                            class='avatar avatar-xs avatar-rounded'
                            :style='`background-image: url(${profile(user.id)})`'
                        />
                        <span
                            v-if='issue.assigned.length > 4'
                            class='avatar avatar-xs avatar-rounded'
                            v-text='`+${issue.assigned.length - 4}`'
                        />
                    </div>
                </div>
            </div>

            <div class='d-flex flex-wrap gap-3 text-muted small'>
                <span>
                    #{{ issue.id }} opened {{ fromNow(issue.created) }}
                    <template v-if='issue.user'>
                        by <a
                            class='text-reset'
                            @click.stop='$router.push(`/user/${issue.user.id}`)'
                            v-text='`${issue.user.fname} ${issue.user.lname}`'
                        />
                    </template>
                </span>
                <span v-if='issue.updated && issue.updated !== issue.created'>
                    updated {{ fromNow(issue.updated) }}
                </span>
            </div>
        </div>
    </StandardItem>
</template>

<script setup>
import StandardItem from './StandardItem.vue';
import TagBadge from './TagBadge.vue';
import moment from 'moment';
import {
    IconCircleDot,
    IconCircleCheck,
    IconMessage,
    IconChartBar
} from '@tabler/icons-vue';

/**
 * Issue row for list views - the Issues counterpart of StandardItemMission
 */
defineProps({
    issue: {
        type: Object,
        required: true
    }
});

const fromNow = (ts) => moment(ts).fromNow();

const profile = (id) => {
    const url = window.stdurl(`/api/user/${id}/profile`);
    if (localStorage.token) url.searchParams.set('token', localStorage.token);
    return url.toString();
};
</script>
