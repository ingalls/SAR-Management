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
                    <div class="card">
                        <NoAccess v-if='!is_iam("User:View")' title='User'/>
                        <TablerLoading v-else-if='loading.user' desc='Loading User'/>
                        <template v-else>
                            <div class='card-header'>
                                <h3 class='card-title' v-text='`${user.fname} ${user.lname}`'></h3>

                                <div class='ms-auto'>
                                    <div class='btn-list'>
                                        <div class='ms-auto'>
                                            <span v-if='user.disabled' class="badge bg-red text-white" style="height: 20px;">DISABLED</span>
                                            <span v-else-if='user.access === "admin"' class="badge bg-red text-white" style="height: 20px;">Admin</span>
                                            <span v-else-if='user.access === "user"' class="badge bg-blue text-white" style="height: 20px;">User</span>
                                            <span v-else-if='user.access === "read"' class="badge bg-gray text-white" style="height: 20px;">Read</span>
                                        </div>

                                        <button data-bs-toggle="dropdown" type="button" class="btn dropdown-toggle dropdown-toggle-split" aria-expanded="false"></button>
                                        <div class="dropdown-menu dropdown-menu-end" style="">
                                            <a @click='$router.push(`/user/${userid}/edit`)' class="dropdown-item cursor-pointer">Edit</a>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div class='row row-0'>
                                <div class='col-12 col-md-3'>
                                    <UserProfile :userid='user.id'/>
                                </div>
                                <div class='col-12 col-md-9'>
                                    <div class="card-body">
                                        <div class="datagrid">
                                            <div class="datagrid-item">
                                                <div class="datagrid-title">Username</div>
                                                <div class="datagrid-content" v-text='user.username'></div>
                                            </div>
                                            <div class="datagrid-item">
                                                <div class="datagrid-title">Email</div>
                                                <div class="datagrid-content">
                                                    <a :href='`mailto:${user.email}`' v-text='user.email'></a>
                                                </div>
                                            </div>
                                            <div class="datagrid-item">
                                                <div class="datagrid-title">Phone</div>
                                                <div class="datagrid-content">
                                                    <a :href='`tel:${user.phone}`' v-text='user.phone'></a>
                                                </div>
                                            </div>
                                            <div class="datagrid-item">
                                                <div class="datagrid-title">Birthday</div>
                                                <div class="datagrid-content" v-text='user.bday || "UNKNOWN"'></div>
                                            </div>
                                            <div class="datagrid-item">
                                                <div class="datagrid-title">Start Year</div>
                                                <div class="datagrid-content" v-text='user.start_year || "UNKNOWN"'></div>
                                            </div>
                                            <div class="datagrid-item">
                                                <div class="datagrid-title">Last Login</div>
                                                <div class="datagrid-content">
                                                    <span v-if='!user.last_login'>Never</span>
                                                    <TablerEpoch v-else :date='user.last_login'/>
                                                </div>
                                            </div>
                                            <div class="datagrid-item">
                                                <div class="datagrid-title">Street Address</div>
                                                <template v-if='user.address_street && user.address_city && user.address_state && user.address_zip'>
                                                    <div class="datagrid-content">
                                                        <a @click='googleMaps' v-html='`${user.address_street}<br>${user.address_city}, ${user.address_state} ${user.address_zip}`' class='cursor-pointer'></a>
                                                    </div>
                                                </template>
                                                <template v-else>
                                                <div class="datagrid-content">UNKNOWN</div>
                                                </template>
                                            </div>
                                            <div class="datagrid-item">
                                                <div class="datagrid-title">Teams</div>
                                                <div class="datagrid-content">
                                                    <template v-if='loading.teams'>
                                                        <TablerLoading desc='Loading Teams'/>
                                                    </template>
                                                    <template v-else-if='!teams.total'>
                                                        None
                                                    </template>
                                                    <template v-else>
                                                        <div :key='team.id' v-for='team in teams.teams'>
                                                            <a @click='$router.push(`/team/${team.id}`)' class='cursor-pointer'  v-text='team.name'></a>
                                                        </div>
                                                    </template>
                                                </div>
                                            </div>
                                            <div class="datagrid-item">
                                                <div class="datagrid-title">Emergency Contacts</div>
                                                <div class="datagrid-content">
                                                    <div v-if='!user.emergency.length'>
                                                        None
                                                    </div>
                                                    <div :key='contact_it' v-for='(contact, contact_it) in user.emergency'>
                                                        <a class='cursor-pointer' v-text='contact.phone'></a> -
                                                        <span v-text='contact.name'/> (<span v-text='contact.relationship'/>)
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
                <div class="col-sm-6 col-lg-6">
                    <CardMissionMini v-if='is_iam("Mission:View")'
                        :assigned='userid'
                    />
                </div>
                <div class="col-sm-6 col-lg-6">
                    <CardTrainingMini v-if='is_iam("Training:View")'
                        :assigned='userid'
                    />
                </div>
                <div class="col-lg-6">
                    <NoAccess v-if='!is_iam("Equipment:View")' title='Assigned Equipment'/>
                    <CardEquipment v-else
                        label='Assigned Equipment'
                        :search='false'
                        :footer='false'
                        :parent='null'
                        :assigned='userid'
                    />
                </div>
                <div class="col-lg-6">
                    <CardIssues
                        label='Assigned Issues'
                        :create='false'
                        :footer='false'
                        :assigned='userid'
                        :iam='iam'
                        :auth='auth'
                    />
                </div>
                <div class="col-lg-6">
                    <CardTraining
                        label='Training Log'
                        :create='false'
                        :assigned='userid'
                        :search='false'
                        :footer='false'
                        :iam='iam'
                        :auth='auth'
                    />
                </div>
                <div class="col-lg-6">
                    <NoAccess v-if='!is_iam("Mission:View")' title='Mission Log'/>
                    <CardMission v-else
                        label='Mission Log'
                        :create='false'
                        :assigned='userid'
                        :search='false'
                        :footer='false'
                        :iam='iam'
                        :auth='auth'
                    />
                </div>
                <div class="col-lg-12">
                    <NoAccess v-if='!is_iam("User:View")' title='Certificates'/>
                    <CardCerts v-else
                        :assigned='userid'
                    />
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import iam from '../iam.js';
import UserProfile from './User/Profile.vue';
import CardIssues from './cards/Issues.vue';
import CardEquipment from './cards/Equipment.vue';
import CardMission from './cards/Missions.vue';
import CardTraining from './cards/Trainings.vue';
import CardMissionMini from './cards/MissionsMini.vue';
import CardTrainingMini from './cards/TrainingMini.vue';
import CardCerts from './cards/Certs.vue';
import NoAccess from './util/NoAccess.vue';
import {
    TablerEpoch,
    TablerBreadCrumb,
    TablerLoading
} from '@tak-ps/vue-tabler'

export default {
    name: 'User',
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
            userid: this.$route.name === 'profile' ? this.auth.id : parseInt(this.$route.params.userid),
            loading: {
                user: true,
                teams: true
            },
            user: {},
            teams: {
                total: 0,
                teams: []
            }
        }
    },
    mounted: async function() {
        if (this.is_iam('User:View')) await this.fetch();
        if (this.is_iam('Team:View')) await this.fetchTeams();
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        googleMaps: function() {
            const addr = this.user.address_street.replace(/ /, '+')
                + '+' + this.user.address_city.replace(/ /, '+')
                + '+' + this.user.address_state.replace(/ /, '+')
                + '+' + this.user.address_zip.replace(/ /, '+');

            window.open(new URL(`/maps/search/${addr}`, 'https://www.google.com'), '_blank');
        },
        fetch: async function() {
            this.loading.user = true;
            this.user = await window.std(`/api/user/${this.userid}`);
            this.loading.user = false;
        },
        fetchTeams: async function() {
            this.loading.teams = true;
            this.teams = await window.std(`/api/team?userid=${this.userid}`);
            this.loading.teams = false;
        }
    },
    components: {
        TablerEpoch,
        UserProfile,
        CardIssues,
        CardMission,
        CardTraining,
        CardMissionMini,
        CardTrainingMini,
        CardEquipment,
        CardCerts,
        TablerLoading,
        TablerBreadCrumb,
        NoAccess
    }
}
</script>
