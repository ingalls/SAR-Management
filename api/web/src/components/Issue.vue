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
                <NoAccess v-if='!is_iam("Issue:View")' title='Issue'/>
                <template v-else>
                    <div class="col-md-9">
                        <div class="card">
                            <TablerLoading v-if='loading.issue'/>
                            <template v-else>
                                <div class='card-header'>
                                    <div class="col">
                                        <div class="d-flex">
                                            <div class='btn-list'>
                                                <span v-if='issue.status === "closed"' class="badge bg-red text-white" style="height: 20px;">Closed</span>
                                                <span v-if='issue.status === "open"' class="badge bg-green text-white" style="height: 20px;">Open</span>

                                                <h3 class='card-title' v-text='issue.title'></h3>
                                            </div>

                                            <div class='ms-auto'>
                                                <div class='btn-list'>
                                                    <div class="d-flex align-items-center">
                                                        <Avatar :user='issue.user'/>
                                                    </div>

                                                    <button v-if='issue.author === auth.id || is_iam("Issue:Admin")' data-bs-toggle="dropdown" type="button" class="btn dropdown-toggle dropdown-toggle-split" aria-expanded="false"></button>
                                                    <div class="dropdown-menu dropdown-menu-end" style="">
                                                        <a @click='$router.push(`/issue/${$route.params.issueid}/edit`)' class="dropdown-item cursor-pointer">Edit</a>
                                                        <a v-if='issue.status === "open"' @click='update("closed")' class="dropdown-item cursor-pointer">Close</a>
                                                        <a v-if='issue.status === "closed"' @click='update("open")' class="dropdown-item cursor-pointer">Re-Open</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <TablerMarkdown :markdown='issue.body'/>
                                </div>

                                <IssuePoll v-if='issue.poll_id' :issue='issue'/>
                            </template>
                        </div>
                    </div>

                    <div class='col-md-3'>
                        <div class='card'>
                            <div class='card-body'>
                                <template v-if='loading.assigned'>
                                    <TablerLoading/>
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

                    <div :key='comment.id' v-for='comment in comments.issues_comments' class="col-md-9">
                        <div class="card">
                            <div class='card-header'>
                                <div class="col">
                                    <div class="d-flex">
                                        <div class='ms-auto'>
                                            <div class='btn-list'>
                                                <div class="d-flex align-items-center">
                                                    <Avatar :user='comment.user'/>
                                                </div>

                                                <button v-if='comment.author === auth.id || is_iam("Issue:Admin")' data-bs-toggle="dropdown" type="button" class="btn dropdown-toggle dropdown-toggle-split" aria-expanded="false"></button>
                                                <div class="dropdown-menu dropdown-menu-end" style="">
                                                    <a @click='$router.push("/team/leadership")' class="dropdown-item cursor-pointer">Edit</a>
                                                    <a @click='deleteComment(comment)' class="dropdown-item cursor-pointer">Delete</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="card-body">
                               <TablerMarkdown :markdown='comment.body'/>
                            </div>
                        </div>
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

<script>
import iam from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import {
    TablerBreadCrumb,
    TablerMarkdown,
    TablerLoading,
} from '@tak-ps/vue-tabler'
import Avatar from './util/Avatar.vue';
import IssuePoll from './Issue/Poll.vue';
import CreateComment from './Issue/CreateComment.vue';
import UserSelect from './util/UserSelect.vue';

export default {
    name: 'Issue',
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
            issue: {
                id: '',
                title: '',
                body: '',
                status: 'open'
            },
            loading: {
                issue: true,
                assigned: true
            },
            assigned: [],
            comments: {
                issues_comments: []
            }
        }
    },
    mounted: async function() {
        if (this.is_iam("Issue:View")) {
            await this.fetch();
            await this.fetchAssigned();
            await this.fetchComments();
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        fetch: async function() {
            this.loading.issue = true;
            this.issue = await window.std(`/api/issue/${this.$route.params.issueid}`);
            this.loading.issue = false;
        },
        fetchAssigned: async function() {
            this.loading.assigned = true;
            this.assigned = (await window.std(`/api/issue/${this.$route.params.issueid}/assigned`)).assigned;
            this.loading.assigned = false;
        },
        deleteAssigned: async function(user) {
            await window.std(`/api/issue/${this.$route.params.issueid}/assigned/${user.id}`, {
                method: 'DELETE'
            })
        },
        deleteComment: async function(comment) {
            await window.std(`/api/issue/${this.$route.params.issueid}/comment/${comment.id}`, {
                method: 'DELETE'
            })
            await this.fetchComments();
        },
        postAssigned: async function(user) {
            this.loading.assigned = true;
            await window.std(`/api/issue/${this.$route.params.issueid}/assigned`, {
                method: 'POST',
                body: {
                    uid: user.id
                }
            })

            await this.fetchAssigned();
        },
        fetchComments: async function() {
            this.comments = await window.std(`/api/issue/${this.$route.params.issueid}/comment`);
        },
        update: async function(status) {
            if (status) this.issue.status = status;
            this.issue = await window.std(`/api/issue/${this.$route.params.issueid}`, {
                method: 'PATCH',
                body: {
                    status: this.issue.status
                }
            });
        }
    },
    components: {
        Avatar,
        NoAccess,
        TablerLoading,
        TablerMarkdown,
        TablerBreadCrumb,
        CreateComment,
        IssuePoll,
        UserSelect
    }
}
</script>
