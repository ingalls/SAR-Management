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
                    <div class='col-lg-12'>
                        <NoAccess
                            v-if='!is_iam("Issue:Manage")'
                            title='New Issue'
                        />
                        <div
                            v-else
                            class='card'
                        >
                            <div class='card-body'>
                                <TablerLoading
                                    v-if='loading'
                                    desc='Loading Issue'
                                />
                                <template v-else>
                                    <div class='row row-cards'>
                                        <div class='col-md-12'>
                                            <TablerInput
                                                v-model='issue.title'
                                                label='Issue Title'
                                                :error='errors.title'
                                            />
                                            <MdEditor
                                                v-model='issue.body'
                                                :preview='false'
                                                no-upload-img
                                                no-mermaid
                                                :no-katex='true'
                                                :toolbars-exclude='[
                                                    "save",
                                                    "prettier",
                                                    "mermaid"
                                                ]'
                                                language='en-US'
                                            />
                                        </div>
                                        <div class='col-md-12 d-flex'>
                                            <div class='ms-auto'>
                                                <a
                                                    class='cursor-pointer btn btn-primary'
                                                    @click='update'
                                                >
                                                    Update Issue
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import iamHelper from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import {
    TablerBreadCrumb,
    TablerLoading,
    TablerInput,
} from '@tak-ps/vue-tabler';

const route = useRoute();
const router = useRouter();

const props = defineProps({
    iam: {
        type: Object,
        required: true
    },
    auth: {
        type: Object,
        required: true
    }
})

const loading = ref(true)

const errors = reactive({
    title: '',
    body: ''
})

const issue = reactive({
    title: '',
    body: '',
    assigned: []
})

function is_iam(permission) { 
    return iamHelper(props.iam, props.auth, permission) 
}

async function fetch() {
    loading.value = true;
    const result = await window.std(`/api/issue/${route.params.issueid}`);
    Object.assign(issue, result);
    loading.value = false;
}

async function update() {
    for (const field of ['title', 'body']) {
        if (!issue[field]) errors[field] = 'Cannot be empty';
        else errors[field] = false;
    }

    for (const e in errors) {
        if (errors[e]) return;
    }

    const body = {
        title: issue.title,
        body: issue.body,
    }

    await window.std(`/api/issue/${issue.id}`, {
        method: 'PATCH',
        body
    });

    router.push(`/issue/${issue.id}`);
}

onMounted(async () => {
    await fetch();
})

defineExpose({
    update
})
</script>
