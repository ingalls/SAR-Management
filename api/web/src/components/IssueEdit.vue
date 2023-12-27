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
                                <div class="col-md-12 d-flex">
                                    <div class='ms-auto'>
                                        <a @click='update' class="cursor-pointer btn btn-primary">
                                            Update Issue
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
import { MdEditor } from 'md-editor-v3';
import UserSelect from './util/UserSelect.vue';
import 'md-editor-v3/lib/style.css';
import {
    TablerBreadCrumb,
    TablerInput,
} from '@tak-ps/vue-tabler';
import {
    TrashIcon,
    PlusIcon,
} from 'vue-tabler-icons';

export default {
    name: 'IssuesEdit',
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
        update: async function() {
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
            }

            await window.std(`/api/issue/${this.issue.id}`, {
                method: 'PATCH',
                body
            });

            this.$router.push(`/issue/${this.issue.id}`);
        }
    },
    components: {
        NoAccess,
        TablerInput,
        MdEditor,
        TablerBreadCrumb,
        UserSelect,
        TrashIcon,
        PlusIcon

    }
}
</script>
