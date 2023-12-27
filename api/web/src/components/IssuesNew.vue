<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <TablerBreadCrumb/>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div class="col-lg-12">
                    <NoAccess v-if='!is_iam("Issue:Manage")' title='New Issue'/>
                    <div v-else class="card">
                        <div class="card-body">
                            <div class='row row-cards'>
                                <div class="col-md-10">
                                    <TablerInput v-model='issue.title' label='Issue Title' :error='errors.title'/>
                                    <MdEditor
                                        :preview='false' noUploadImg noMermaid
                                        :noKatex='true'
                                        :toolbarsExclude='[
                                            "save",
                                            "prettier",
                                            "mermaid"
                                        ]'
                                        language='en-US'
                                        v-model="issue.body"
                                    />
                                </div>
                                <div class="col-md-2">
                                    <UserSelect
                                        v-model='issue.assigned'
                                        label='Assigned'
                                    />

                                    <label class="form-label">Labels</label>
                                </div>
                                <div v-if='poll.shown' class='col-md-12'>
                                    <div class='card-header'>
                                        <h3 class='card-title'>Poll</h3>
                                        <div class='ms-auto btn-list'>
                                            <PlusIcon v-tooltip='"Add Question"' @click='poll.questions.push({
                                                "name": ""
                                            })' class='cursor-pointer'/>
                                        </div>
                                    </div>
                                    <div class='card-body'>
                                        <div :key='qit' v-for='(question, qit) of poll.questions' class='my-2 d-flex'>
                                            <TablerInput v-model='question.name' class='w-full mx-2'/>
                                            <div class='ms-auto'>
                                                <TrashIcon v-tooltip='"Remove Question"' @click='poll.questions.splice(qit, 1)' class='cursor-pointer my-1'/>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-md-12 d-flex">
                                    <button v-if='!poll.shown' v-tooltip='"Add Poll"' @click='poll.shown = true' class='btn'><GraphIcon/></button>
                                    <button v-else v-tooltip='"Remove Poll"' @click='poll.shown = false' class='btn'><GraphOffIcon/></button>

                                    <div class='ms-auto'>
                                        <a @click='create' class="cursor-pointer btn btn-primary">
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
    },
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

    }
}
</script>
