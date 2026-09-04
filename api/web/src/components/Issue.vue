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
                                        <div class='row col-12 g-2'>
                                            <div class='col-12 d-flex align-items-start'>
                                                <div class='min-w-0'>
                                                    <div class='d-flex flex-wrap align-items-center gap-2'>
                                                        <TablerBadge
                                                            v-if='issue.status === "closed"'
                                                            background-color='#d63939'
                                                            text-color='#ffffff'
                                                        >
                                                            Closed
                                                        </TablerBadge>
                                                        <TablerBadge
                                                            v-else
                                                            background-color='#2fb344'
                                                            text-color='#ffffff'
                                                        >
                                                            Open
                                                        </TablerBadge>
                                                        <h3
                                                            class='card-title m-0 text-break'
                                                            v-text='issue.title'
                                                        />
                                                    </div>
                                                    <div class='d-flex flex-wrap align-items-center gap-2 text-muted small mt-1'>
                                                        <span>#{{ issue.id }} opened {{ fromNow }} by</span>
                                                        <Avatar
                                                            :user='issue.user'
                                                            :link='true'
                                                        />
                                                        <span>·</span>
                                                        <span v-text='`${comments.items.length} comment${comments.items.length === 1 ? "" : "s"}`' />
                                                    </div>
                                                </div>

                                                <div class='ms-auto btn-list d-flex align-items-center flex-nowrap'>
                                                    <button
                                                        v-if='is_iam("Issue:Manage") && issue.status === "open"'
                                                        type='button'
                                                        class='btn btn-sm btn-outline-danger'
                                                        @click='update("closed")'
                                                    >
                                                        <IconCircleCheck
                                                            :size='18'
                                                            stroke='1.5'
                                                            class='me-1'
                                                        />
                                                        Close
                                                    </button>
                                                    <button
                                                        v-else-if='is_iam("Issue:Manage")'
                                                        type='button'
                                                        class='btn btn-sm btn-outline-success'
                                                        @click='update("open")'
                                                    >
                                                        <IconCircleDot
                                                            :size='18'
                                                            stroke='1.5'
                                                            class='me-1'
                                                        />
                                                        Re-Open
                                                    </button>
                                                    <TablerIconButton
                                                        v-if='issue.author === auth.id || is_iam("Issue:Admin")'
                                                        title='Edit Issue'
                                                        @click='$router.push(`/issue/${$route.params.issueid}/edit`)'
                                                    >
                                                        <IconPencil
                                                            :size='24'
                                                            stroke='1'
                                                        />
                                                    </TablerIconButton>
                                                </div>
                                            </div>
                                            <div
                                                v-if='issue.tags && issue.tags.length'
                                                class='col-12 d-flex flex-wrap gap-1'
                                            >
                                                <TagBadge
                                                    v-for='tag in issue.tags'
                                                    :key='tag.id'
                                                    :tag='tag'
                                                />
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
                                </template>
                            </div>
                        </div>

                        <div class='col-md-3'>
                            <div class='card'>
                                <div class='card-body'>
                                    <TablerLoading v-if='loading.assigned' />
                                    <UserSelect
                                        v-else
                                        v-model='assigned'
                                        label='Assigned'
                                        :disabled='!is_iam("Issue:Manage")'
                                        @push='postAssigned($event)'
                                        @delete='deleteAssigned($event)'
                                    />

                                    <IssueTagSelect
                                        v-if='!loading.issue'
                                        v-model='tags'
                                        label='Tags'
                                        @push='saveTags'
                                        @delete='saveTags'
                                    />
                                </div>
                            </div>
                        </div>

                        <div class='col-md-9'>
                            <div class='w-100 d-flex flex-column gap-3'>
                                <div class='d-flex align-items-center'>
                                    <h3 class='m-0 subheader'>
                                        Comments
                                    </h3>
                                    <span
                                        class='badge bg-secondary-lt ms-2'
                                        v-text='comments.items.length'
                                    />
                                </div>

                                <TablerNone
                                    v-if='!comments.items.length'
                                    label='No Comments Yet'
                                    :create='false'
                                    :compact='true'
                                />
                                <div class='d-flex flex-column gap-3'>
                                    <Comment
                                        v-for='comment in comments.items'
                                        :key='comment.id'
                                        :can-edit='comment.author === auth.id || is_iam("Issue:Admin")'
                                        :comment='comment'
                                        @delete='deleteComment($event)'
                                        @update='updateComment($event)'
                                    />

                                    <CreateComment
                                        v-if='issue.status === "open" && is_iam("Issue:Manage")'
                                        @comment='fetchComments'
                                        @close='update("closed")'
                                    />
                                    <div
                                        v-else-if='issue.status === "closed"'
                                        class='card'
                                    >
                                        <div class='card-body d-flex align-items-center text-muted'>
                                            <IconLock
                                                :size='20'
                                                stroke='1.5'
                                                class='me-2'
                                            />
                                            This issue is closed. Re-open it to continue the discussion.
                                            <button
                                                v-if='is_iam("Issue:Manage")'
                                                type='button'
                                                class='btn btn-sm btn-outline-success ms-auto'
                                                @click='update("open")'
                                            >
                                                Re-Open
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
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
import TagBadge from './util/TagBadge.vue';
import IssueTagSelect from './util/IssueTagSelect.vue';
import {
    TablerBadge,
    TablerBreadCrumb,
    TablerMarkdown,
    TablerLoading,
    TablerNone,
    TablerIconButton
} from '@tak-ps/vue-tabler'
import {
    IconPencil,
    IconCircleCheck,
    IconCircleDot,
    IconLock
} from '@tabler/icons-vue';
import Avatar from './util/Avatar.vue';
import IssuePoll from './Issue/Poll.vue';
import UserSelect from './util/UserSelect.vue';
import { fromNow as relative } from '../base/time.js';
import { reactive, ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

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
    status: 'open',
    tags: [],
    user: null
});
const loading = reactive({
    issue: true,
    assigned: true
});
const assigned = ref([]);
const tags = ref([]);
const comments = reactive({
    items: []
});

const fromNow = computed(() => relative(issue.created));

function is_iam(permission) { return iamHelper(props.iam, props.auth, permission); }

async function fetch() {
    loading.issue = true;
    Object.assign(issue, await window.std(`/api/issue/${route.params.issueid}`));
    tags.value = [...issue.tags];
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

// Tags are saved as soon as they are added or removed from the picker
async function saveTags() {
    Object.assign(issue, await window.std(`/api/issue/${route.params.issueid}`, {
        method: 'PATCH',
        body: {
            tags: tags.value.map((t) => t.id)
        }
    }));
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
        body: { body: comment.body }
    });
    await fetchComments();
}

async function update(status) {
    Object.assign(issue, await window.std(`/api/issue/${route.params.issueid}`, {
        method: 'PATCH',
        body: { status }
    }));
}

onMounted(async () => {
    if (is_iam("Issue:View")) {
        await fetch();
        await Promise.all([fetchAssigned(), fetchComments()]);
    }
});
</script>
