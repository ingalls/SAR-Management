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
                <NoAccess v-if='!is_iam("Team:View")' title='Team'/>
                <template v-else>
                    <div class="col-lg-12">
                        <div class="card">
                            <template v-if='loading.team'>
                                <TablerLoading desc='Loading Team'/>
                            </template>
                            <template v-else>
                                <div class='card-header'>
                                    <h3 class='card-title' v-text='team.name + " Attendance"'></h3>

                                    <div class='ms-auto'>
                                        <div class='btn-list'>
                                            <TeamBadge :team='team'/>
                                        </div>
                                    </div>
                                </div>
                                <div class='card-body row'>
                                    <div class='col-12 col-md-6'>
                                        <TablerInput label='Start Date' type='date' v-model='filter.start'/>
                                    </div>
                                    <div class='col-12 col-md-6'>
                                        <TablerInput label='End Date' type='date' v-model='filter.end'/>
                                    </div>
                                </div>

                                <TablerLoading v-if='loading.attendance'/>
                                <div v-else class="" id="container" datenow="">
                                    <table class="table table-hover table-header-rotated">
                                        <thead>
                                            <tr>
                                                <th></th>
                                                <template v-for='training in trainings'>
                                                    <th class="rotate">
                                                        <div><span v-text='training.title'></span></div>
                                                    </th>
                                                </template>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <template v-for='user in users'>
                                                <tr>
                                                    <th class="row-header" v-text='user.fname + " " + user.lname'></th>
                                                    <template v-for='training in trainings'>
                                                        <th>
                                                            <div>
                                                                <CheckIcon/>
                                                            </div>
                                                        </th>
                                                    </template>
                                                </tr>
                                            </template>
                                        </tbody>
                                    </table>
                                </div>
                            </template>
                        </div>
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
    TablerInput,
    TablerLoading
} from '@tak-ps/vue-tabler';
import {
    CheckIcon
} from 'vue-tabler-icons';

export default {
    name: 'TeamAttendance',
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
    watch: {
        filter: {
            deep: true,
            handler: async function() {
                await this.fetchTrainings();
                await this.fetchUsers();
                this.loading.attendance = false;
            }
        }
    },
    data: function() {
        return {
            loading: {
                team: true,
                attendance: true
            },
            filter: {
                start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 10),
                end: new Date().toISOString().slice(0, 10)
            },
            trainings: [],
            users: [],
            team: {
                id: null,
                name: '',
                body: ''
            }
        }
    },
    mounted: async function() {
        if (this.is_iam("Team:View")) {
            await this.fetch();
            await this.fetchTrainings();
            await this.fetchUsers();
            this.loading.attendance = false;
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        fetch: async function() {
            this.loading.team = true;
            this.team = await window.std(`/api/team/${this.$route.params.teamid}`);
            this.loading.team = false;
        },
        fetchUsers: async function() {
            const list = await window.std(`/api/user?team=${this.team.id}`);
            this.users = list.users;
        },
        fetchTrainings: async function() {
            const url = await window.stdurl(`/api/training`);
            url.searchParams.append('start', +new Date(this.filter.start));
            url.searchParams.append('end', +new Date(this.filter.end));
            url.searchParams.append('team', this.team.id);
            const list = await window.std(url);
            this.trainings = list.training;
        }
    },
    components: {
        CheckIcon,
        NoAccess,
        TeamBadge,
        TablerInput,
        TablerBreadCrumb,
        TablerLoading,
        CardUsers
    }
}
</script>

<style>
#container {
    overflow: scroll;
}

.table-header-rotated {
    border-collapse: collapse;
}
.table-header-rotated td {
    width: 30px;
}
.table-header-rotated th {
    padding: 5px 10px;
}
.table-header-rotated td {
    text-align: center;
    padding: 10px 5px;
    border: 1px solid #ccc;
}
.table-header-rotated th.rotate {
    height: 200px;
    white-space: nowrap;
}

.table-header-rotated th.rotate > div {
    transform: translate(25px, -3px) rotate(315deg);
    width: 30px;
}
.table-header-rotated th.rotate > div > span {
    border-bottom: 1px solid #ccc;
    padding: 5px 10px;
}
.table-header-rotated th.row-header {
    padding: 0 10px;
    border-bottom: 1px solid #ccc;
}
</style>
