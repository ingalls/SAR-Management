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
                                                <PlusIcon
                                                    v-tooltip='"Add Question"'
                                                    class='cursor-pointer'
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
                                                    <TrashIcon
                                                        v-tooltip='"Remove Question"'
                                                        class='cursor-pointer my-1'
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
                                            <GraphIcon />
                                        </button>
                                        <button
                                            v-else
                                            v-tooltip='"Remove Poll"'
                                            class='btn'
                                            @click='poll.shown = false'
                                        >
                                            <GraphOffIcon />
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

<script>
import iam from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import UserSelect from './util/UserSelect.vue';
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import {
    TablerBreadCrumb,
    TablerInput,
} from '@tak-ps/vue-tabler';
import {
    GraphIcon,
    GraphOffIcon,
    TrashIcon,
    PlusIcon,
} from 'vue-tabler-icons';

export default {
    name: 'IssuesNew',
    components: {
        NoAccess,
        TablerInput,
        GraphIcon,
        GraphOffIcon,
        TablerBreadCrumb,
        UserSelect,
        TrashIcon,
        MdEditor,
        PlusIcon

    },
    props: {
        iam: {
            type: Object,
            required: true
        },
        auth: {
            type: Object,
            required: true
        }
    },
    data: function() {
        return {
            poll: {
                shown: false,
                questions: [{
                    name: 'Sample Question 1'
                },{
                    name: 'Sample Question 2'
                },{
                    name: 'Sample Question 3'
                }]
            },
            errors: {
                title: '',
                body: ''
            },
            issue: {
                title: '',
                body: '',
                assigned: []
            }
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        create: async function() {
            for (const field of ['title', 'body']) {
                if (!this.issue[field]) this.errors[field] = 'Cannot be empty';
                else this.errors[field] = false;
            }

            for (const e in this.errors) {
                if (this.errors[e]) return;
            }

            const body = {
                title: this.issue.title,
                body: this.issue.body,
                assigned: this.issue.assigned.map((a) => {
                    return a.id;
                })
            }

            if (this.poll.shown) {
                body.poll = {
                    questions: this.poll.questions
                }
            };

            const create = await window.std('/api/issue', {
                method: 'POST',
                body
            });

            this.$router.push(`/issue/${create.id}`);
        }
    }
}
</script>
