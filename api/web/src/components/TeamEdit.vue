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
                            <li class="breadcrumb-item active" aria-current="page"><a href="#" v-text='$route.params.teamid'></a></li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <TablerLoading v-if='loading'/>
    <div v-else class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div class="col-lg-12">
                    <div class="card">
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
                                        <a @click='deleteTeam' class="btn btn-outline-danger cursor-pointer">Delete Team</a>

                                        <div class='ms-auto'>
                                            <a @click='update' class="cursor-pointer btn btn-primary">Update Team</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-lg-12">
                    <div class="card">
                        <div class='card-header'>Team Access Management</div>
                        <table class="table card-table table-vcenter">
                            <thead>
                                <tr>
                                    <th>Group</th>
                                    <th>Access</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr :key='group' v-for='group in Object.keys(iam)'>
                                    <td v-text='group'></td>
                                    <td>
                                        <TablerSelect :default='team.iam[group] || iam[group][iam[group].length - 1]' :values='iam[group]'/>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <PageFooter/>
</div>
</template>

<script>
import PageFooter from './PageFooter.vue';
import {
    TablerLoading,
    TablerSelect
} from '@tak-ps/vue-tabler';

export default {
    name: 'TeamSingleEdit',
    data: function() {
        return {
            loading: true,
            errors: {
                name: false,
                body: false
            },
            iam: {},
            team: {
                name: '',
                body: '',
                iam: {}
            }
        }
    },
    mounted: async function() {
        await this.fetchiam();
        await this.fetch();
    },
    methods: {
        fetchiam: async function() {
            this.iam = await window.std(`/api/iam`);
        },
        fetch: async function() {
            this.loading = true;
            this.team = await window.std(`/api/team/${this.$route.params.teamid}`);
            this.loading = false;
        },
        deleteTeam: async function() {
            await window.std(`/api/team/${this.$route.params.teamid}`, {
                method: 'DELETE'
            });

            this.$router.push('/team');
        },
        update: async function() {
            for (const field of ['name', 'body']) {
                if (!this.team[field]) this.errors[field] = 'Cannot be empty';
                else this.errors[field] = false;
            }

            for (const e in this.errors) {
                if (this.errors[e]) return;
            }

            const update = await window.std(`/api/team/${this.$route.params.teamid}`, {
                method: 'PATCH',
                body: {
                    name: this.team.name,
                    body: this.team.body,
                }
            });

            this.$router.push(`/team/${update.id}`);
        }
    },
    components: {
        PageFooter,
        TablerLoading,
        TablerSelect
    }
}
</script>
