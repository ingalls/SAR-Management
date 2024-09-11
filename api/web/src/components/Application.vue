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
                <NoAccess v-if='$route.params.applicationid && !is_iam("Application:View")' title='Application'/>
                <NoAccess v-else-if='!$route.params.applicationid && !is_iam("Application:Manage")' title='Application'/>
                <TablerLoading v-else-if='loading.application' desc='Loading Application'/>
                <TablerLoading v-else-if='loading.save' desc='Saving Application'/>
                <div v-else class="col-lg-12">
                    <div class="card">
                        <div class='card-header'>
                            <div class='row col-12'>
                                <div class='col-12 d-flex align-items-center'>
                                    <div v-if='$route.params.applicationid'>
                                        <div class='card-title' v-text='`${application.name}`'></div>
                                        <div class='subheader' v-text='`${application.phone} - ${application.email}`'></div>
                                    </div>
                                    <div v-else>
                                        <div class='card-title'>New Application</div>
                                    </div>

                                    <div class='ms-auto btn-list d-flex align-items-center'>
                                        <TablerEpoch :date='application.created'/>
                                        <IconSettings v-if='!edit' class='cursor-pointer' :size='32' :stroke='1' @click='$router.push(`/application/${$route.params.applicationid}/edit`)'/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class='row'>
                                <TablerSchema :disabled='!edit' :schema='application.schema' v-model='application'/>
                                <template v-if='edit'>
                                    <div class='d-flex'>
                                        <TablerDelete v-if='is_iam("Application:Admin")' @delete='deleteApp'/>
                                        <div class='ms-auto'>
                                            <button @click='submit' class='btn btn-primary'>save</button>
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>

                <div :key='comment.updated' v-for='comment in comments.application_comments' class="col-md-12 py-2">
                    <Comment
                        @delete='deleteComment($event)'
                        @update='updateComment($event)'
                        :canEdit='comment.author === auth.id || is_iam("Application:Admin")'
                        :comment='comment'
                    />
                </div>

                <div v-if='!edit' class="col-lg-12">
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

<script>
import iam from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import Avatar from './util/Avatar.vue';
import CreateComment from './Application/CreateComment.vue';
import Comment from './util/Comment.vue';
import {
    TablerEpoch,
    TablerBreadCrumb,
    TablerSchema,
    TablerDelete,
    TablerLoading
} from '@tak-ps/vue-tabler';
import {
    IconSettings
} from '@tabler/icons-vue';

export default {
    name: 'Application',
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
            edit: ["application-edit", "application-new"].includes(this.$route.name),
            loading: {
                save: false,
                application: true,
            },
            comments: {
                application_comments: []
            },
            application: {
                name: '',
                schema: {},
                created: new Date()
            }
        }
    },
    mounted: async function() {
        if (this.$route.params.applicationid && this.is_iam("Application:View")) {
            await this.fetch();
            await this.fetchComments();
        } else {
            this.application.schema = await this.getSchema();
            this.loading.application = false;
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        fetchComments: async function() {
            this.comments = await window.std(`/api/application/${this.$route.params.applicationid}/comment`);
        },
        deleteComment: async function(comment) {
            await window.std(`/api/application/${this.$route.params.applicationid}/comment/${comment.id}`, {
                method: 'DELETE'
            })
            await this.fetchComments();
        },
        deleteComment: async function(comment) {
            await window.std(`/api/application/${this.$route.params.applicationid}/comment/${comment.id}`, {
                method: 'DELETE'
            })
            await this.fetchComments();
        },
        updateComment: async function(comment) {
            await window.std(`/api/application/${this.$route.params.applicationid}/comment/${comment.id}`, {
                method: 'PATCH',
                body: comment
            })
            await this.fetchComments();
        },
        submit: async function() {
            this.loading.save = true;

            try {
                const body = JSON.parse(JSON.stringify(this.application));
                for (const prop of ['id', 'schema', 'created', 'updated']) delete body[prop];
                if (this.$route.params.applicationid) {
                    this.application = await window.std(`/api/application/${this.$route.params.applicationid}`, {
                        method: 'PATCH', body
                    });
                } else {
                    this.application = await window.std(`/api/application`, {
                        method: 'POST', body
                    });
                }

                this.$router.push(`/application/${this.application.id}`);
            } catch (err) {
                this.loading.save = false;
                throw err;
            }
        },
        deleteApp: async function() {
            this.loading.application = true;
            await window.std(`/api/application/${this.$route.params.applicationid}`, {
                method: 'DELETE'
            });
            this.loading.application = false;
            this.$router.push('/application');
        },
        fetch: async function() {
            this.loading.application = true;
            this.application = await window.std(`/api/application/${this.$route.params.applicationid}`);
            this.loading.application = false;
        },
        getSchema: async function() {
            return JSON.parse((await window.std('/api/server/application')).value);
        },
    },
    components: {
        Avatar,
        TablerEpoch,
        CreateComment,
        IconSettings,
        TablerBreadCrumb,
        TablerLoading,
        TablerDelete,
        TablerSchema,
        NoAccess,
        Comment
    }
}
</script>
