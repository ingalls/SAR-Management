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
                            v-if='!is_iam("Team:Manage")'
                            title='Edit Team'
                        />
                        <TablerLoading v-else-if='loading.team' />
                        <div
                            v-else
                            class='card'
                        >
                            <div class='card-body'>
                                <div class='row row-cards'>
                                    <div class='col-12 col-md-10'>
                                        <div class='d-flex'>
                                            <label class='form-label'>Team Name</label>
                                            <div class='ms-auto btn-list'>
                                                <TeamBadge :team='team' />
                                            </div>
                                        </div>
                                        <input
                                            v-model='team.name'
                                            type='text'
                                            :class='{
                                                "is-invalid": errors.name
                                            }'
                                            class='form-control'
                                            placeholder='Team Name'
                                        >
                                        <div
                                            v-if='errors.name'
                                            class='invalid-feedback'
                                            v-text='errors.name'
                                        />
                                    </div>
                                    <div class='col-12 col-md-2 row mt-2'>
                                        <div class='col-auto w-50'>
                                            <label class='form-label'>Back</label>
                                            <input
                                                v-model='team.colour_bg'
                                                type='color'
                                                class='w-100 form-control form-control-color'
                                                title='Background Colour'
                                            >
                                        </div>
                                        <div class='col-auto w-50'>
                                            <label class='form-label'>Text</label>
                                            <input
                                                v-model='team.colour_txt'
                                                type='color'
                                                class='w-100 form-control form-control-color'
                                                title='Text Colour'
                                            >
                                        </div>
                                    </div>
                                    <div class='col-md-12'>
                                        <TablerToggle
                                            v-model='team.fieldable'
                                            label='Fieldable Team'
                                        />
                                    </div>
                                    <div class='col-md-12'>
                                        <label class='form-label'>Charter</label>
                                        <textarea
                                            v-model='team.body'
                                            rows='5'
                                            type='text'
                                            :class='{
                                                "is-invalid": errors.body
                                            }'
                                            class='form-control'
                                            placeholder='Team Charter'
                                        />
                                        <div
                                            v-if='errors.body'
                                            class='invalid-feedback'
                                            v-text='errors.body'
                                        />
                                    </div>
                                    <div class='col-md-12'>
                                        <div class='d-flex'>
                                            <a
                                                class='btn btn-outline-danger cursor-pointer'
                                                @click='deleteTeam'
                                            >Delete Team</a>

                                            <div class='ms-auto'>
                                                <a
                                                    class='cursor-pointer btn btn-primary'
                                                    @click='update'
                                                >Update Team</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        v-if='is_iam("Team:Admin")'
                        class='col-lg-12'
                    >
                        <TablerLoading v-if='loading.iam || loading.team || loading.fieldability' />
                        <div
                            v-else-if='team.fieldable'
                            class='card'
                        >
                            <div class='card-header'>
                                <h2 class='card-title'>
                                    Team Fieldability Requirements
                                </h2>
                                <div class='ms-auto'>
                                    <IconPlus
                                        :size='32'
                                        stroke='1'
                                        class='cursor-pointer'
                                    />
                                </div>
                            </div>
                            <table class='table card-table table-vcenter'>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for='field in fieldability'
                                        :key='field.id'
                                    >
                                        <td v-text='field.name' />
                                        <td />
                                    </tr>
                                </tbody>
                            </table>
                            <div class='card-body'>
                                <div class='d-flex'>
                                    <div class='ms-auto'>
                                        <a
                                            class='cursor-pointer btn btn-primary'
                                            @click='updateField'
                                        >Update</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        v-if='is_iam("Team:Admin")'
                        class='col-lg-12'
                    >
                        <TablerLoading v-if='loading.iam || loading.team || loading.fieldability' />
                        <div
                            v-else
                            class='card'
                        >
                            <div class='card-header'>
                                Team Access Management
                            </div>
                            <table class='table card-table table-vcenter'>
                                <thead>
                                    <tr>
                                        <th>Group</th>
                                        <th>Access</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for='group in Object.keys(iamlist)'
                                        :key='group'
                                    >
                                        <td v-text='group' />
                                        <td>
                                            <TablerSelect
                                                v-model='team.iam[group]'
                                                :default='team.iam[group] || iamlist[group][iamlist[group].length - 1]'
                                                :options='iamlist[group]'
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div class='card-body'>
                                <div class='d-flex'>
                                    <div class='ms-auto'>
                                        <a
                                            class='cursor-pointer btn btn-primary'
                                            @click='updateIAM'
                                        >Update IAM</a>
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
import TeamBadge from './util/TeamBadge.vue';
import {
    IconPlus
} from '@tabler/icons-vue';
import {
    TablerBreadCrumb,
    TablerLoading,
    TablerToggle,
    TablerSelect
} from '@tak-ps/vue-tabler';

export default {
    name: 'TeamEdit',
    components: {
        IconPlus,
        NoAccess,
        TablerLoading,
        TablerToggle,
        TablerSelect,
        TablerBreadCrumb,
        TeamBadge
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
            loading: {
                fieldability: false,
                team: true,
                iam: true
            },
            errors: {
                name: false,
                body: false
            },
            iamlist: {},
            fieldability: [],
            team: {
                name: '',
                body: '',
                colour_bg: '#9aa0a6',
                colour_txt: '#000000',
                fieldable: true,
                iam: {}
            }
        }
    },
    mounted: async function() {
        if (this.is_iam("Team:Manage")) {
            await this.fetchiam();
            await this.fetchFieldability();
            await this.fetch();
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        fetchiam: async function() {
            this.loading.iam = true;
            this.iamlist = await window.std(`/api/iam`);
            this.loading.iam = false;
        },
        fetchFieldability: async function() {
            this.loading.fieldability = true;
            this.team = await window.std(`/api/team/${this.$route.params.teamid}/fieldability`);
            this.loading.fieldability = false;
        },
        fetch: async function() {
            this.loading.team = true;
            this.team = await window.std(`/api/team/${this.$route.params.teamid}`);
            this.loading.team = false;
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
                    fieldable: this.team.fieldable,
                    colour_bg: this.team.colour_bg,
                    colour_txt: this.team.colour_txt
                }
            });

            this.$router.push(`/team/${update.id}`);
        },
        updateField: async function() {
            const update = await window.std(`/api/team/${this.$route.params.teamid}/fieldability`, {
                method: 'PATCH',
                body: {
                    fieldability: this.fieldability
                }
            });

            this.$router.push(`/team/${update.id}`);
        },
        updateIAM: async function() {
            const update = await window.std(`/api/team/${this.$route.params.teamid}`, {
                method: 'PATCH',
                body: {
                    iam: this.team.iam
                }
            });

            this.$router.push(`/team/${update.id}`);
        }
    }
}
</script>
