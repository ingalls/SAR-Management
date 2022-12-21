<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a @click='$router.push("/")' class='cursor-pointer'>Home</a></li>
                            <li class="breadcrumb-item"><a @click='$router.push("/issue")' class='cursor-pointer'>Issues</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a v-text='issue.id'></a></li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div class="col-md-9">
                    <div class="card">
                        <div class='card-header'>
                            <div class="col">
                                <div class="d-flex">
                                    <div class='btn-list'>
                                        <span v-if='issue.status === "closed"' class="badge bg-red">Closed</span>
                                        <span v-if='issue.status === "open"' class="badge bg-green">Open</span>

                                        <h3 class='card-title' v-text='issue.title'></h3>
                                    </div>

                                    <div class='ms-auto'>
                                        <div class='btn-list'>
                                            <div class="d-flex align-items-center">
                                                <span class="avatar avatar-xs me-2 avatar-rounded" style="background-image: url(./static/avatars/000m.jpg)"></span>
                                                Paweł Kuna
                                            </div>

                                            <button data-bs-toggle="dropdown" type="button" class="btn dropdown-toggle dropdown-toggle-split" aria-expanded="false"></button>
                                            <div class="dropdown-menu dropdown-menu-end" style="">
                                                <a @click='$router.push("/team/leadership")' class="dropdown-item cursor-pointer">Edit</a>
                                                <a v-if='issue.status === "open"' @click='update("closed")' class="dropdown-item cursor-pointer">Close</a>
                                                <a v-if='issue.status === "closed"' @click='update("open")' class="dropdown-item cursor-pointer">Re-Open</a>
                                                <a @click='$router.push("/team/leadership")' class="dropdown-item cursor-pointer">Delete</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card-body" v-text='issue.body'></div>
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
                                                <span class="avatar avatar-xs me-2 avatar-rounded" style="background-image: url(./static/avatars/000m.jpg)"></span>
                                                Paweł Kuna
                                            </div>

                                            <button data-bs-toggle="dropdown" type="button" class="btn dropdown-toggle dropdown-toggle-split" aria-expanded="false"></button>
                                            <div class="dropdown-menu dropdown-menu-end" style="">
                                                <a @click='$router.push("/team/leadership")' class="dropdown-item cursor-pointer">Edit</a>
                                                <a @click='$router.push("/team/leadership")' class="dropdown-item cursor-pointer">Delete</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card-body" v-text='comment.body'></div>
                    </div>
                </div>

                <template v-if='issue.status === "open"'>
                    <CreateComment
                        @comment='fetchComments'
                    />
                </template>
            </div>
        </div>
    </div>

    <PageFooter/>

    <TablerError v-if='err' :err='err' @close='err = null'/>
</div>
</template>

<script>
import {
    TablerLoading,
    TablerError
} from '@tak-ps/vue-tabler'
import PageFooter from './PageFooter.vue';
import CreateComment from './Issue/CreateComment.vue';
import UserSelect from './util/UserSelect.vue';

export default {
    name: 'Issue',
    data: function() {
        return {
            err: false,
            issue: {
                id: '',
                title: '',
                body: '',
                status: 'open'
            },
            loading: {
                assigned: true
            },
            assigned: [],
            comments: {
                issues_comments: []
            }
        }
    },
    mounted: async function() {
        await this.fetch();

        this.fetchAssigned();
        this.fetchComments();

    },
    methods: {
        fetch: async function() {
            try {
                this.issue = await window.std(`/api/issue/${this.$route.params.issueid}`);
            } catch (err) {
                this.err = err;
            }
        },
        fetchAssigned: async function() {
            try {
                this.loading.assigned = true;
                this.assigned = (await window.std(`/api/issue/${this.$route.params.issueid}/assigned`)).assigned;
                this.loading.assigned = false;
            } catch (err) {
                this.err = err;
            }
        },
        deleteAssigned: async function(user) {
            try {
                await window.std(`/api/issue/${this.$route.params.issueid}/assigned/${user.id}`, {
                    method: 'DELETE'
                })
            } catch (err) {
                this.err = err;
            }
        },
        postAssigned: async function(user) {
            try {
                this.loading.assigned = true;
                await window.std(`/api/issue/${this.$route.params.issueid}/assigned`, {
                    method: 'POST',
                    body: {
                        uid: user.id
                    }
                })

                await this.fetchAssigned();
            } catch (err) {
                this.err = err;
            }
        },
        fetchComments: async function() {
            try {
                this.comments = await window.std(`/api/issue/${this.$route.params.issueid}/comment`);
            } catch (err) {
                this.err = err;
            }
        },
        update: async function(status) {
            if (status) this.issue.status = status;
            try {
                this.issue = await window.std(`/api/issue/${this.$route.params.issueid}`, {
                    method: 'PATCH',
                    body: {
                        status: this.issue.status
                    }
                });
            } catch (err) {
                this.err = err;
            }
        }
    },
    components: {
        TablerError,
        TablerLoading,
        PageFooter,
        CreateComment,
        UserSelect
    }
}
</script>
