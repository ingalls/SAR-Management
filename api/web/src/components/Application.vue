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
                <div class='row row-cards'>
                    <NoAccess
                        v-if='applicationid && !is_iam("Application:View")'
                        title='Application'
                    />
                    <NoAccess
                        v-else-if='!applicationid && !is_iam("Application:Manage")'
                        title='Application'
                    />
                    <TablerLoading
                        v-else-if='loading.application'
                        desc='Loading Application'
                    />
                    <TablerLoading
                        v-else-if='loading.save'
                        desc='Saving Application'
                    />
                    <template v-else>
                        <div :class='applicationid ? "col-lg-8" : "col-lg-12"'>
                            <div class='card'>
                                <div class='card-header'>
                                    <div
                                        v-if='applicationid'
                                        style='min-width: 0;'
                                    >
                                        <div class='d-flex align-items-center flex-wrap gap-2'>
                                            <StatusBadge :status='application.status' />
                                            <div
                                                class='card-title mb-0'
                                                v-text='application.name'
                                            />
                                        </div>
                                        <div class='text-muted small mt-1'>
                                            <a
                                                :href='`tel:${application.phone}`'
                                                v-text='format(application.phone)'
                                            />
                                            <span class='mx-1'>-</span>
                                            <a
                                                :href='`mailto:${application.email}`'
                                                v-text='application.email'
                                            />
                                        </div>
                                    </div>
                                    <div
                                        v-else
                                        class='card-title'
                                    >
                                        New Application
                                    </div>

                                    <div class='ms-auto btn-list d-flex align-items-center'>
                                        <TablerIconButton
                                            v-if='!edit && is_iam("Application:Manage")'
                                            title='Edit Application'
                                            @click='$router.push(`/application/${applicationid}/edit`)'
                                        >
                                            <IconPencil
                                                :size='32'
                                                :stroke='1'
                                            />
                                        </TablerIconButton>
                                    </div>
                                </div>
                                <div class='card-body'>
                                    <div class='row'>
                                        <div
                                            v-if='!applicationid'
                                            class='col-12 mb-3'
                                        >
                                            <TablerInput
                                                v-model='cohort'
                                                label='Cohort'
                                                description='Intake class the applicant is being considered for, ie: the year. Can be set later.'
                                                placeholder='unassigned'
                                            />
                                        </div>
                                        <TablerSchema
                                            v-model='form'
                                            :disabled='!edit'
                                            :schema='application.schema'
                                        />
                                        <div
                                            v-if='edit'
                                            class='d-flex mt-3'
                                        >
                                            <div class='ms-auto btn-list'>
                                                <button
                                                    v-if='applicationid'
                                                    class='btn btn-link link-secondary'
                                                    @click='$router.push(`/application/${applicationid}`)'
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    class='btn btn-primary'
                                                    @click='submit'
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            v-if='applicationid'
                            class='col-lg-4'
                        >
                            <div class='card'>
                                <div class='card-header'>
                                    <h3 class='card-title'>
                                        Lifecycle
                                    </h3>
                                    <div class='ms-auto text-muted small'>
                                        Submitted <TablerEpoch :date='application.created' />
                                    </div>
                                </div>
                                <TablerLoading
                                    v-if='loading.lifecycle'
                                    desc='Updating Application'
                                />
                                <div
                                    v-else
                                    class='card-body'
                                >
                                    <div class='mb-3'>
                                        <div class='subheader mb-1'>
                                            Status
                                        </div>
                                        <div class='d-flex align-items-center gap-2'>
                                            <StatusBadge :status='application.status' />
                                            <span
                                                class='text-muted small'
                                                v-text='status.description'
                                            />
                                        </div>

                                        <template v-if='canManage && actions.length'>
                                            <TablerInput
                                                v-model='note'
                                                class='mt-2'
                                                placeholder='Optional note recorded with the change'
                                            />
                                            <div class='d-flex flex-wrap gap-2 mt-2'>
                                                <button
                                                    v-for='action in actions'
                                                    :key='action.status'
                                                    class='btn btn-sm'
                                                    :class='`btn-outline-${action.colour}`'
                                                    :title='action.description'
                                                    @click='setStatus(action.status)'
                                                    v-text='action.label'
                                                />
                                            </div>
                                        </template>
                                    </div>

                                    <div class='mb-3'>
                                        <div class='subheader mb-1'>
                                            Reviewer
                                        </div>
                                        <div class='d-flex align-items-center'>
                                            <Avatar
                                                v-if='application.assigned_user'
                                                :user='application.assigned_user'
                                                :link='true'
                                            />
                                            <span
                                                v-else
                                                class='text-muted'
                                            >Unassigned</span>

                                            <div
                                                v-if='canManage'
                                                class='ms-auto btn-list'
                                            >
                                                <button
                                                    v-if='application.assigned !== auth.id'
                                                    class='btn btn-sm'
                                                    @click='patch({ assigned: auth.id })'
                                                >
                                                    Assign to Me
                                                </button>
                                                <TablerIconButton
                                                    v-if='application.assigned'
                                                    title='Remove Reviewer'
                                                    @click='patch({ assigned: null })'
                                                >
                                                    <IconX
                                                        :size='20'
                                                        stroke='1'
                                                    />
                                                </TablerIconButton>
                                            </div>
                                        </div>
                                        <div
                                            v-if='canManage && is_iam("User:View")'
                                            class='mt-2'
                                        >
                                            <UserDropdown
                                                v-model='reviewerFilter'
                                                @selected='patch({ assigned: $event.id })'
                                            />
                                        </div>
                                    </div>

                                    <div class='mb-3'>
                                        <div class='subheader mb-1'>
                                            Cohort
                                        </div>
                                        <div
                                            v-if='canManage'
                                            class='d-flex gap-2'
                                        >
                                            <div class='flex-grow-1'>
                                                <TablerInput
                                                    v-model='cohort'
                                                    placeholder='unassigned'
                                                    @keyup.enter='saveCohort'
                                                />
                                            </div>
                                            <button
                                                class='btn'
                                                :disabled='(cohort.trim() || "unassigned") === application.cohort'
                                                @click='saveCohort'
                                            >
                                                Save
                                            </button>
                                        </div>
                                        <span
                                            v-else
                                            v-text='application.cohort'
                                        />
                                    </div>

                                    <div>
                                        <div class='subheader mb-1'>
                                            Member Account
                                        </div>
                                        <div
                                            v-if='application.user'
                                            class='d-flex align-items-center'
                                        >
                                            <Avatar
                                                :user='application.user'
                                                :link='true'
                                            />
                                            <div
                                                v-if='canManage'
                                                class='ms-auto'
                                            >
                                                <TablerIconButton
                                                    title='Unlink Member Account'
                                                    @click='patch({ user_id: null })'
                                                >
                                                    <IconX
                                                        :size='20'
                                                        stroke='1'
                                                    />
                                                </TablerIconButton>
                                            </div>
                                        </div>
                                        <template v-else>
                                            <div class='text-muted'>
                                                Not linked to a member
                                            </div>
                                            <button
                                                v-if='canManage && is_iam("User:Admin") && ["accepted", "onboarded"].includes(application.status)'
                                                class='btn btn-primary w-100 mt-2'
                                                @click='$router.push(`/user/new?application=${applicationid}`)'
                                            >
                                                <IconUserPlus
                                                    :size='20'
                                                    stroke='1'
                                                    class='me-2'
                                                />Create Member
                                            </button>
                                            <div
                                                v-else-if='canManage && is_iam("User:Admin")'
                                                class='text-muted small mt-1'
                                            >
                                                A member can be created once the application is accepted
                                            </div>
                                            <div
                                                v-if='canManage && is_iam("User:View")'
                                                class='mt-2'
                                            >
                                                <div class='small text-muted'>
                                                    Or link an existing member
                                                </div>
                                                <UserDropdown
                                                    v-model='memberFilter'
                                                    @selected='patch({ user_id: $event.id })'
                                                />
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </div>

                            <div
                                v-if='application.duplicates && application.duplicates.length'
                                class='card mt-3'
                            >
                                <div class='card-header'>
                                    <IconCopy
                                        :size='20'
                                        stroke='1'
                                        class='me-2'
                                    />
                                    <h3 class='card-title'>
                                        Possible Duplicates
                                    </h3>
                                </div>
                                <div class='list-group list-group-flush'>
                                    <a
                                        v-for='dup in application.duplicates'
                                        :key='dup.id'
                                        class='list-group-item list-group-item-action cursor-pointer d-flex align-items-center'
                                        @click='stdclick($router, $event, `/application/${dup.id}`)'
                                    >
                                        <span v-text='dup.name' />
                                        <span class='ms-auto d-flex align-items-center gap-2'>
                                            <span class='text-muted small'><TablerEpoch :date='dup.created' /></span>
                                            <StatusBadge :status='dup.status' />
                                        </span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <template v-if='applicationid && !edit'>
                            <div
                                v-for='item in timeline'
                                :key='item.key'
                                class='col-md-12'
                            >
                                <Comment
                                    v-if='item.kind === "comment"'
                                    :can-edit='item.value.author === auth.id || is_iam("Application:Admin")'
                                    :comment='item.value'
                                    @delete='deleteComment($event)'
                                    @update='updateComment($event)'
                                />
                                <TimelineEvent
                                    v-else
                                    :event='item.value'
                                />
                            </div>

                            <div
                                v-if='canManage'
                                class='col-lg-12'
                            >
                                <CreateComment @comment='fetchTimeline' />
                            </div>
                        </template>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import iamHelper from '../iam.js';
import { stdclick } from '../std.ts';
import NoAccess from './util/NoAccess.vue';
import Avatar from './util/Avatar.vue';
import UserDropdown from './util/UserDropdown.vue';
import { phone as phoneFormat } from 'phone';
import CreateComment from './Application/CreateComment.vue';
import TimelineEvent from './Application/TimelineEvent.vue';
import StatusBadge from './Application/StatusBadge.vue';
import { statusMeta, StatusActions } from './Application/status.ts';
import Comment from './util/Comment.vue';
import {
    TablerEpoch,
    TablerInput,
    TablerBreadCrumb,
    TablerSchema,
    TablerLoading,
    TablerIconButton
} from '@tak-ps/vue-tabler';
import {
    IconX,
    IconCopy,
    IconPencil,
    IconUserPlus
} from '@tabler/icons-vue';
import { reactive, ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Form fields that are first class properties of an application, all others are answers
const ColumnFields = ['name', 'phone', 'email'];

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
const router = useRouter();

const applicationid = route.params.applicationid;
const edit = ref(["application-edit", "application-new"].includes(route.name));

const loading = reactive({
    save: false,
    lifecycle: false,
    application: true,
});

const application = reactive({
    name: '',
    phone: '',
    email: '',
    status: 'submitted',
    cohort: 'unassigned',
    assigned: null,
    assigned_user: null,
    user: null,
    duplicates: [],
    schema: {},
    created: new Date()
});

// Flat representation of the application that the form is bound to
const form = ref({});
const comments = ref([]);
const events = ref([]);

const note = ref('');
const cohort = ref('');
const reviewerFilter = ref('');
const memberFilter = ref('');

function is_iam(permission) { return iamHelper(props.iam, props.auth, permission); }

const canManage = computed(() => is_iam("Application:Manage"));

const status = computed(() => statusMeta(application.status));

const actions = computed(() => {
    return status.value.next.map((next) => {
        const meta = statusMeta(next);

        return {
            status: next,
            // Moving a finished application back into review is reopening it
            label: !status.value.active && next === 'reviewing' ? 'Reopen' : StatusActions[next],
            colour: meta.colour,
            description: meta.description
        };
    });
});

// Comments & lifecycle events interleaved, oldest first
const timeline = computed(() => {
    return [
        ...comments.value.map((value) => ({ kind: 'comment', key: `comment-${value.id}-${value.updated}`, value })),
        ...events.value.map((value) => ({ kind: 'event', key: `event-${value.id}`, value }))
    ].sort((a, b) => {
        return new Date(a.value.created).getTime() - new Date(b.value.created).getTime();
    });
});

function format(number) {
    const p = phoneFormat(number || '');

    if (!p.isValid) return number;

    if (p.countryCode === '+1') {
        return `${p.phoneNumber.slice(0, 2)} (${p.phoneNumber.slice(2, 5)}) ${p.phoneNumber.slice(5, 8)}-${p.phoneNumber.slice(8, 12)}`;
    } else {
        return p.phoneNumber;
    }
}

function assign(data) {
    Object.assign(application, data);
    cohort.value = data.cohort === 'unassigned' ? '' : data.cohort;

    form.value = {
        name: data.name,
        phone: data.phone,
        email: data.email,
        ...data.answers
    };
}

async function fetchTimeline() {
    const [commentList, eventList] = await Promise.all([
        window.std(`/api/application/${applicationid}/comment?limit=100&sort=created&order=asc`),
        window.std(`/api/application/${applicationid}/event?limit=100&order=asc`)
    ]);

    comments.value = commentList.items;
    events.value = eventList.items;
}

async function deleteComment(comment) {
    await window.std(`/api/application/${applicationid}/comment/${comment.id}`, {
        method: 'DELETE'
    });
    await fetchTimeline();
}

async function updateComment(comment) {
    await window.std(`/api/application/${applicationid}/comment/${comment.id}`, {
        method: 'PATCH',
        body: comment
    });
    await fetchTimeline();
}

// Lifecycle changes: status, cohort, reviewer & linked member
async function patch(body) {
    loading.lifecycle = true;

    try {
        const updated = await window.std(`/api/application/${applicationid}`, {
            method: 'PATCH',
            body
        });

        // The response does not include duplicates, keep the ones already loaded
        assign({ ...updated, duplicates: application.duplicates });
        reviewerFilter.value = '';
        memberFilter.value = '';
        await fetchTimeline();
    } finally {
        loading.lifecycle = false;
    }
}

async function setStatus(next) {
    await patch({
        status: next,
        note: note.value
    });

    note.value = '';
}

async function saveCohort() {
    const next = cohort.value.trim() || 'unassigned';
    if (next === application.cohort) return;
    await patch({ cohort: next });
}

async function submit() {
    loading.save = true;

    try {
        const flat = JSON.parse(JSON.stringify(form.value));

        if (applicationid) {
            const body = { answers: {} };
            for (const prop in flat) {
                if (ColumnFields.includes(prop)) body[prop] = flat[prop];
                else body.answers[prop] = flat[prop];
            }

            await window.std(`/api/application/${applicationid}`, {
                method: 'PATCH', body
            });

            router.push(`/application/${applicationid}`);
        } else {
            // New applications are submitted exactly as the public form would
            const created = await window.std(`/api/application`, {
                method: 'POST',
                body: {
                    ...flat,
                    cohort: cohort.value.trim() || undefined
                }
            });

            router.push(`/application/${created.id}`);
        }
    } catch (err) {
        loading.save = false;
        throw err;
    }
}

async function fetch() {
    loading.application = true;
    assign(await window.std(`/api/application/${applicationid}`));
    loading.application = false;
}

async function getSchema() {
    return JSON.parse((await window.std('/api/server/application')).value);
}

onMounted(async () => {
    if (applicationid) {
        if (!is_iam("Application:View")) return;
        await fetch();
        await fetchTimeline();
    } else {
        application.schema = await getSchema();
        loading.application = false;
    }
});
</script>
