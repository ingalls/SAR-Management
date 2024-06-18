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
                                    <div class='col-12 col-md-5'>
                                        <TablerInput label='Start Date' :disabled='loading.attendance' :error='errors.start' type='date' v-model='filter.start'/>
                                    </div>
                                    <div class='col-12 col-md-5'>
                                        <TablerInput label='End Date' :disabled='loading.attendance' :error='errors.end' type='date' v-model='filter.end'/>
                                    </div>
                                    <div class='col-12 col-md-2'>
                                        <TablerInput label='Percent' :disabled='loading.attendance' :error='errors.end' v-model='filter.percent'/>
                                    </div>
                                    <div class='col-12 d-flex mt-2'>
                                        <span v-text='Math.ceil(total * (this.filter.percent / 100)) + " Required Trainings"'/><span class='mx-1' v-text='`(${this.filter.percent}%)`'/> out of <span class='mx-1' v-text='trainings.length'/> Training Opportunities
                                        <div class='ms-auto'>
                                            <button @click='refresh' class='btn btn-primary'>Filter</button>
                                        </div>
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
                                                        <div @click='$router.push(`/training/${training.id}`)' class='cursor-pointer'>
                                                            <span v-text='training.title' :class='{
                                                                "text-red": training.required
                                                            }'></span>
                                                        </div>
                                                    </th>
                                                </template>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <template v-for='user in users'>
                                                <tr :class='{
                                                    "bg-red": totals[user.id] < (total * (filter.percent / 100))
                                                }'>
                                                    <th @click='$router.push(`/user/${user.id}`)' class="row-header cursor-pointer" v-text='user.fname + " " + user.lname'></th>
                                                    <template v-for='training in trainings'>
                                                        <th>
                                                            <CheckIcon v-if='training.users.has(user.id)'/>
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
    data: function() {
        return {
            loading: {
                team: true,
                attendance: true
            },
            errors: {
                start: '',
                end: ''
            },
            filter: {
                percent: 33,
                start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 10),
                end: new Date().toISOString().slice(0, 10)
            },
            total: 0, // Only Required
            totals: {},
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
            await this.fetchUsers();
            await this.fetchTrainings();
            this.loading.attendance = false;
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        refresh: async function() {
            for (const field of ['start', 'end']) {
                if (!this.filter[field]) this.errors[field] = 'Cannot be empty';
                else this.errors[field] = '';
            }

            for (const e in this.errors) {
                if (this.errors[e]) return;
            }

            this.loading.attendance = true;
            await this.fetchTrainings();
            await this.fetchUsers();
            this.loading.attendance = false;
        },
        fetch: async function() {
            this.loading.team = true;
            this.team = await window.std(`/api/team/${this.$route.params.teamid}`);
            this.loading.team = false;
        },
        fetchUsers: async function() {
            const list = await window.std(`/api/user?team=${this.team.id}`);
            this.users = list.items;

        },
        fetchTrainings: async function() {
            const url = await window.stdurl(`/api/training`);
            url.searchParams.append('start', new Date(this.filter.start).toISOString());
            url.searchParams.append('end', new Date(this.filter.end).toISOString());
            url.searchParams.append('team', this.team.id);
            const list = await window.std(url);
            this.trainings = list.training;

            this.total = 0;

            this.totals = {};
            for (const user of this.users) {
                this.totals[user.id] = 0;
            }

            for (const training of this.trainings) {
                training.users = new Set();
                const users = await window.std(`/api/training/${training.id}/assigned`);

                if (training.required) this.total++;

                for (const user of users.assigned) {
                    if (!user.confirmed) continue;
                    training.users.add(user.uid);

                    if (this.totals[user.uid] !== undefined) this.totals[user.uid] = this.totals[user.uid] + 1;
                }
            }
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
