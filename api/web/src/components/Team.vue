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
                    <NoAccess
                        v-if='!is_iam("Team:View")'
                        title='Team'
                    />
                    <template v-else>
                        <div class='col-lg-12'>
                            <div class='card'>
                                <template v-if='loading.team'>
                                    <TablerLoading desc='Loading Team' />
                                </template>
                                <template v-else>
                                    <div class='card-header'>
                                        <h3
                                            class='card-title'
                                            v-text='team.name'
                                        />

                                        <div class='ms-auto'>
                                            <div class='btn-list'>
                                                <span
                                                    v-if='team.fieldable'
                                                    class='ms-auto badge bg-green text-white'
                                                    style='height: 20px;'
                                                >Fieldable</span>
                                                <TeamBadge :team='team' />

                                                <button
                                                    data-bs-toggle='dropdown'
                                                    type='button'
                                                    class='btn dropdown-toggle dropdown-toggle-split'
                                                    aria-expanded='false'
                                                />
                                                <div
                                                    class='dropdown-menu dropdown-menu-end'
                                                    style=''
                                                >
                                                    <a
                                                        class='dropdown-item cursor-pointer'
                                                        @click='$router.push(`/team/${$route.params.teamid}/edit`)'
                                                    >Edit</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        class='card-body'
                                        v-text='team.body'
                                    />
                                </template>
                            </div>
                        </div>

                        <div class='col-lg-12'>
                            <CardUsers
                                v-if='team.id'
                                :dropdown='false'
                                :url='`/api/team/${$route.params.teamid}/user`'
                                :edit='is_iam("Team:Manage")'
                            />
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import NoAccess from './util/NoAccess.vue';
import TeamBadge from './util/TeamBadge.vue';
import iam from '../iam.js';
import CardUsers from './cards/Users.vue';
import {
    TablerBreadCrumb,
    TablerLoading
} from '@tak-ps/vue-tabler';

export default {
    name: 'Team',
    components: {
        NoAccess,
        TeamBadge,
        TablerBreadCrumb,
        TablerLoading,
        CardUsers
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
                team: true
            },
            team: {
                id: null,
                name: '',
                body: ''
            }
        }
    },
    mounted: async function() {
        if (this.is_iam("Team:View")) await this.fetch();
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        fetch: async function() {
            this.loading.team = true;
            this.team = await window.std(`/api/team/${this.$route.params.teamid}`);
            this.loading.team = false;
        }
    }
}
</script>
