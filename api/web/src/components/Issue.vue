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
                    <NoAccess
                        v-if='!is_iam("Issue:View")'
                        title='Issue'
                    />
                    <template v-else>
                        <div class='col-md-9'>
                            <div class='card'>
                                <TablerLoading v-if='loading.issue' />
                                <template v-else>
                                    <div class='card-header'>
                                        <div class='col'>
                                            <div class='d-flex'>
                                                <div class='btn-list'>
                                                    <TablerBadge
                                                        v-if='issue.status === "closed"'
                                                        background-color='#d63939'
                                                        text-color='#ffffff'
                                                    >
                                                        Closed
                                                    </TablerBadge>
                                                    <TablerBadge
                                                        v-else-if='issue.status === "open"'
                                                        background-color='#2fb344'
                                                        text-color='#ffffff'
                                                    >
                                                        Open
                                                    </TablerBadge>

                                                    <h3
                                                        class='card-title'
                                                        v-text='issue.title'
                                                    />
                                                </div>

                                                <div class='ms-auto'>
                                                    <div class='btn-list'>
                                                        <div class='d-flex align-items-center'>
                                                            <Avatar :user='issue.user' />
                                                        </div>

                                                        <button
                                                            v-if='issue.author === auth.id || is_iam("Issue:Admin")'
                                                            data-bs-toggle='dropdown'
                                                            type='button'
                                                            class='btn dropdown-toggle dropdown-toggle-split'
                                                            aria-expanded='false'
                                                        />
                                                        <div
                                                            class='dropdown-menu dropdown-menu-end'
                                                            style=''
                                                        >
                                                            <a
                                                                class='dropdown-item cursor-pointer hover-light'
                                                                @click='$router.push(`/issue/${$route.params.issueid}/edit`)'
                                                            >Edit</a>
                                                            <a
                                                                v-if='issue.status === "open"'
                                                                class='dropdown-item cursor-pointer hover-light'
                                                                @click='update("closed")'
                                                            >Close</a>
                                                            <a
                                                                v-if='issue.status === "closed"'
                                                                class='dropdown-item cursor-pointer hover-light'
                                                                @click='update("open")'
                                                            >Re-Open</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class='card-body'>
                                        <TablerMarkdown :markdown='issue.body' />
                                    </div>

                                    <IssuePoll
                                        v-if='issue.poll_id'
                                        :issue='issue'
                                    />

                                    <div class='card-footer'>
                                        <span v-text='fromNow' />
                                    </div>
                                </template>
                            </div>
                        </div>

                        <div class='col-md-3'>
                            <div class='card'>
                                <div class='card-body'>
                                    <template v-if='loading.assigned'>
                                        <TablerLoading />
                                    </template>
                                    <template v-else>
                                        <UserSelect
                                            v-model='assigned'
                                            @push='postAssigned($event)'
                                            @delete='deleteAssigned($event)'
                                        />
                                    </template>
                                </div>
                            </div>
                        </div>

                        <div
                            v-for='comment in comments.items'
                            :key='comment.updated'
                            class='col-md-9'
                        >
                            <Comment
                                :can-edit='comment.author === auth.id || is_iam("Issue:Admin")'
                                :comment='comment'
                                @delete='deleteComment($event)'
                                @update='updateComment($event)'
                            />
                        </div>

                        <template v-if='issue.status === "open"'>
                            <CreateComment
                                @comment='fetchComments'
                                @close='update("closed")'
                            />
                        </template>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import iamHelper from '../iam.js';
import Comment from './util/Comment.vue';
import CreateComment from './Issue/CreateComment.vue';
import NoAccess from './util/NoAccess.vue';
import {
    TablerBadge,
    TablerBreadCrumb,
    TablerMarkdown,
    TablerLoading,
} from '@tak-ps/vue-tabler'
import Avatar from './util/Avatar.vue';
import IssuePoll from './Issue/Poll.vue';
import UserSelect from './util/UserSelect.vue';
import moment from 'moment';
import { reactive, ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

moment.updateLocale('en', {
    relativeTime : {
        future: "in %s",
        past:   "%s ago",
        s  : 'a few seconds',
        ss : '%d seconds',
        m:  "a minute",
        mm: "%d minutes",
        h:  "an hour",
        hh: "%d hours",
        d:  "a day",
        dd: "%d days",
        w:  "a week",
        ww: "%d weeks",
        M:  "a month",
        MM: "%d months",
        y:  "a year",
        yy: "%d years"
    }
});

const props = defineProps({
    iam: {
        type: Object,
        required: true
    },
    auth: {
        type: Object,
        required: true
    }
});

const route = useRoute();

const issue = reactive({
    id: '',
    title: '',
    body: '',
    status: 'open'
});
const loading = reactive({
    issue: true,
    assigned: true
});
const assigned = ref([]);
const comments = reactive({
    items: []
});

const fromNow = computed(() => {
    return "Posted " + moment(issue.created).fromNow();
});

function is_iam(permission) { return iamHelper(props.iam, props.auth, permission); }

async function fetch() {
    loading.issue = true;
    Object.assign(issue, await window.std(`/api/issue/${route.params.issueid}`));
    loading.issue = false;
}

async function fetchAssigned() {
    loading.assigned = true;
    assigned.value = (await window.std(`/api/issue/${route.params.issueid}/assigned`)).items;
    loading.assigned = false;
}

async function deleteAssigned(user) {
    await window.std(`/api/issue/${route.params.issueid}/assigned/${user.id}`, {
        method: 'DELETE'
    });
}

async function fetchComments() {
    Object.assign(comments, await window.std(`/api/issue/${route.params.issueid}/comment`));
}

async function deleteComment(comment) {
    await window.std(`/api/issue/${route.params.issueid}/comment/${comment.id}`, {
        method: 'DELETE'
    });
    await fetchComments();
}

async function updateComment(comment) {
    await window.std(`/api/issue/${route.params.issueid}/comment/${comment.id}`, {
        method: 'PATCH',
        body: comment
    });
    await fetchComments();
}

async function postAssigned(user) {
    loading.assigned = true;
    await window.std(`/api/issue/${route.params.issueid}/assigned`, {
        method: 'POST',
        body: {
            uid: user.id
        }
    });

    await fetchAssigned();
}

async function update(status) {
    if (status) issue.status = status;
    Object.assign(issue, await window.std(`/api/issue/${route.params.issueid}`, {
        method: 'PATCH',
        body: {
            status: issue.status
        }
    }));
}

onMounted(async () => {
    if (is_iam("Issue:View")) {
        await fetch();
        await fetchAssigned();
        await fetchComments();
    }
});
</script>
