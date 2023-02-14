<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a @click='$router.push("/")' class="cursor-pointer">Home</a></li>
                            <li class="breadcrumb-item" aria-current="page"><a  @click='$router.push("/team")' class="cursor-pointer">Team</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="#">New</a></li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div class="col-lg-12">
                    <NoAccess v-if='!is_iam("Team:Manage")' title='New Team'/>
                    <div v-else class="card">
                        <div class="card-body">
                            <div class='row row-cards'>
                                <div class="col-md-12">
                                    <label class="form-label">Team Name</label>
                                    <input v-model='team.name' type="text" :class='{
                                        "is-invalid": errors.name
                                    }' class="form-control" placeholder="Team Name">
                                    <div v-if='errors.name' v-text='errors.name' class="invalid-feedback"></div>
                                </div>
                                <div class="col-md-12">
                                    <label class="form-label">Charter</label>
                                    <textarea rows=5 v-model='team.body' type="text" :class='{
                                        "is-invalid": errors.body
                                    }' class="form-control" placeholder="Team Charter"/>
                                    <div v-if='errors.body' v-text='errors.body' class="invalid-feedback"></div>
                                </div>
                                <div class="col-md-12">
                                    <div class='d-flex'>
                                        <div class='ms-auto'>
                                            <a @click='create' class="cursor-pointer btn btn-primary">Create Team</a>
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

    <PageFooter/>
</div>
</template>

<script>
import iam from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import PageFooter from './PageFooter.vue';

export default {
    name: 'TeamNew',
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
                name: false,
                body: false
            },
            team: {
                name: '',
                body: ''
            }
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        create: async function() {
            for (const field of ['name', 'body']) {
                if (!this.team[field]) this.errors[field] = 'Cannot be empty';
                else this.errors[field] = false;
            }

            for (const e in this.errors) {
                if (this.errors[e]) return;
            }

            const create = await window.std('/api/team', {
                method: 'POST',
                body: this.team
            });

            this.$router.push(`/team/${create.id}`);
        }
    },
    components: {
        NoAccess,
        PageFooter,
    }
}
</script>
