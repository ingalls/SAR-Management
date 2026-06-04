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
                        v-if='$route.params.applicationid && !is_iam("Application:View")'
                        title='Application'
                    />
                    <NoAccess
                        v-else-if='!$route.params.applicationid && !is_iam("Application:Manage")'
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
                    <div
                        v-else
                        class='col-lg-12'
                    >
                        <div class='card'>
                            <div class='card-header'>
                                <div class='row col-12'>
                                    <div class='col-12 d-flex align-items-center'>
                                        <div v-if='$route.params.applicationid'>
                                            <div class='d-flex align-items-center'>
                                                <TablerBadge
                                                    v-if='application.archived'
                                                    background-color='#d63939'
                                                    text-color='#ffffff'
                                                >
                                                    Archived
                                                </TablerBadge>
                                                <TablerBadge
                                                    v-else
                                                    background-color='#2fb344'
                                                    text-color='#ffffff'
                                                >
                                                    Active
                                                </TablerBadge>

                                                <div class='card-title mx-2'>
                                                    <span v-text='application.name' />
                                                </div>
                                            </div>
                                            <div
                                                class='subheader'
                                                v-text='`${application.phone} - ${application.email}`'
                                            />
                                        </div>
                                        <div v-else>
                                            <div class='card-title'>
                                                New Application
                                            </div>
                                        </div>

                                        <div class='ms-auto btn-list d-flex align-items-center'>
                                            <TablerEpoch :date='application.created' />
                                            <TablerIconButton
                                                v-if='!edit'
                                                title='Edit Application'
                                                @click='$router.push(`/application/${$route.params.applicationid}/edit`)'
                                            >
                                                <IconPencil
                                                    :size='32'
                                                    :stroke='1'
                                                />
                                            </TablerIconButton>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class='card-body'>
                                <div class='row'>
                                    <TablerSchema
                                        v-model='application'
                                        :disabled='!edit'
                                        :schema='application.schema'
                                    />
                                    <template v-if='edit'>
                                        <div class='d-flex'>
                                            <TablerDelete
                                                v-if='is_iam("Application:Admin")'
                                                label='Archive'
                                                @delete='deleteApp'
                                            />
                                            <div class='ms-auto'>
                                                <button
                                                    class='btn btn-primary'
                                                    @click='submit'
                                                >
                                                    save
                                                </button>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        v-for='comment in comments.items'
                        :key='comment.updated'
                        class='col-md-12 py-2'
                    >
                        <Comment
                            :can-edit='comment.author === auth.id || is_iam("Application:Admin")'
                            :comment='comment'
                            @delete='deleteComment($event)'
                            @update='updateComment($event)'
                        />
                    </div>

                    <div
                        v-if='!edit'
                        class='col-lg-12'
                    >
                        <CreateComment
                            @comment='fetchComments'
                            @close='update("closed")'
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import iamHelper from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import { phone as phoneFormat } from 'phone';
import CreateComment from './Application/CreateComment.vue';
import Comment from './util/Comment.vue';
import {
    TablerBadge,
    TablerEpoch,
    TablerBreadCrumb,
    TablerSchema,
    TablerDelete,
    TablerLoading,
    TablerIconButton
} from '@tak-ps/vue-tabler';
import {
    IconPencil
} from '@tabler/icons-vue';
import { reactive, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

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

const edit = ref(["application-edit", "application-new"].includes(route.name));
const loading = reactive({
    save: false,
    application: true,
});
const comments = reactive({
    application_comments: []
});
const application = reactive({
    name: '',
    schema: {},
    created: new Date()
});

function is_iam(permission) { return iamHelper(props.iam, props.auth, permission); }

async function fetchComments() {
    Object.assign(comments, await window.std(`/api/application/${route.params.applicationid}/comment`));
}

async function deleteComment(comment) {
    await window.std(`/api/application/${route.params.applicationid}/comment/${comment.id}`, {
        method: 'DELETE'
    });
    await fetchComments();
}

async function updateComment(comment) {
    await window.std(`/api/application/${route.params.applicationid}/comment/${comment.id}`, {
        method: 'PATCH',
        body: comment
    });
    await fetchComments();
}

async function submit() {
    loading.save = true;

    try {
        const body = JSON.parse(JSON.stringify(application));
        for (const prop of ['id', 'schema', 'created', 'updated', 'archived']) delete body[prop];
        if (route.params.applicationid) {
            Object.assign(application, await window.std(`/api/application/${route.params.applicationid}`, {
                method: 'PATCH', body
            }));
        } else {
            Object.assign(application, await window.std(`/api/application`, {
                method: 'POST', body
            }));
        }

        router.push(`/application/${application.id}`);
    } catch (err) {
        loading.save = false;
        throw err;
    }
}

async function deleteApp() {
    loading.application = true;
    await window.std(`/api/application/${route.params.applicationid}`, {
        method: 'DELETE'
    });
    loading.application = false;
    router.push('/application');
}

function format(number) {
    const p = phoneFormat(number);

    if (!p.isValid) return number;

    if (p.countryCode === '+1') {
        return `${p.phoneNumber.slice(0, 2)} (${p.phoneNumber.slice(2, 5)}) ${p.phoneNumber.slice(5, 8)}-${p.phoneNumber.slice(8, 12)}`;
    } else {
        return p;
    }
}

async function fetch() {
    loading.application = true;
    const data = await window.std(`/api/application/${route.params.applicationid}`);
    data.phone = format(data.phone);
    Object.assign(application, data);
    loading.application = false;
}

async function getSchema() {
    return JSON.parse((await window.std('/api/server/application')).value);
}

onMounted(async () => {
    if (route.params.applicationid && is_iam("Application:View")) {
        await fetch();
        await fetchComments();
    } else {
        application.schema = await getSchema();
        loading.application = false;
    }
});
</script>
