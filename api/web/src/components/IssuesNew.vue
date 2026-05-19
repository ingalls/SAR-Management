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
                                <div class='row row-cards'>
                                    <div class='col-md-10'>
                                        <TablerInput
                                            v-model='issue.title'
                                            label='Issue Title'
                                            :error='errors.title'
                                        />
                                        <MDEditorShim v-model='issue.body' />
                                    </div>
                                    <div class='col-md-2'>
                                        <UserSelect
                                            v-model='issue.assigned'
                                            label='Assigned'
                                        />

                                        <label class='form-label'>Labels</label>
                                    </div>
                                    <div
                                        v-if='poll.shown'
                                        class='col-md-12'
                                    >
                                        <div class='card-header'>
                                            <h3 class='card-title'>
                                                Poll
                                            </h3>
                                            <div class='ms-auto btn-list'>
                                                <IconPlus
                                                    v-tooltip='"Add Question"'
                                                    class='cursor-pointer'
                                                    :size='32'
                                                    stroke='1'
                                                    @click='poll.questions.push({
                                                        "name": ""
                                                    })'
                                                />
                                            </div>
                                        </div>
                                        <div class='card-body'>
                                            <div
                                                v-for='(question, qit) of poll.questions'
                                                :key='qit'
                                                class='my-2 d-flex'
                                            >
                                                <TablerInput
                                                    v-model='question.name'
                                                    class='w-full mx-2'
                                                />
                                                <div class='ms-auto'>
                                                    <IconTrash
                                                        v-tooltip='"Remove Question"'
                                                        class='cursor-pointer my-1'
                                                        :size='32'
                                                        stroke='1'
                                                        @click='poll.questions.splice(qit, 1)'
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class='col-md-12 d-flex'>
                                        <button
                                            v-if='!poll.shown'
                                            v-tooltip='"Add Poll"'
                                            class='btn'
                                            @click='poll.shown = true'
                                        >
                                            <IconGraph
                                                :size='32'
                                                stroke='1'
                                            />
                                        </button>
                                        <button
                                            v-else
                                            v-tooltip='"Remove Poll"'
                                            class='btn'
                                            @click='poll.shown = false'
                                        >
                                            <IconGraphOff
                                                :size='32'
                                                stroke='1'
                                            />
                                        </button>

                                        <div class='ms-auto'>
                                            <a
                                                class='cursor-pointer btn btn-primary'
                                                @click='create'
                                            >
                                                Create Issue
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import iamHelper from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import UserSelect from './util/UserSelect.vue';
import MDEditorShim from './util/MDEditorShim.vue';
import {
    TablerBreadCrumb,
    TablerInput,
} from '@tak-ps/vue-tabler';
import {
    IconGraph,
    IconGraphOff,
    IconTrash,
    IconPlus,
} from '@tabler/icons-vue';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

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

const router = useRouter();

const poll = reactive({
    shown: false,
    questions: [{
        name: 'Sample Question 1'
    },{
        name: 'Sample Question 2'
    },{
        name: 'Sample Question 3'
    }]
});

const errors = reactive({
    title: '',
    body: ''
});

const issue = reactive({
    title: '',
    body: '',
    assigned: []
});

function is_iam(permission) { return iamHelper(props.iam, props.auth, permission); }

async function create() {
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
        assigned: issue.assigned.map((a) => {
            return a.id;
        })
    }

    if (poll.shown) {
        body.poll = {
            questions: poll.questions
        }
    };

    const created = await window.std('/api/issue', {
        method: 'POST',
        body
    });

    router.push(`/issue/${created.id}`);
}
</script>
