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
                            v-if='!is_iam("User:Admin")'
                            title='New User'
                        />
                        <div
                            v-else
                            class='card'
                        >
                            <div class='card-body'>
                                <TablerLoading
                                    v-if='loading'
                                    desc='Creating User'
                                />
                                <div
                                    v-else
                                    class='row row-cards'
                                >
                                    <div class='col-md-6'>
                                        <TablerInput
                                            v-model='user.fname'
                                            label='First Name'
                                            :error='errors.fname'
                                        />
                                    </div>
                                    <div class='col-md-6'>
                                        <TablerInput
                                            v-model='user.lname'
                                            label='Last Name'
                                            :error='errors.lname'
                                        />
                                    </div>
                                    <div class='col-md-6'>
                                        <TablerInput
                                            v-model='user.username'
                                            label='Username'
                                            :error='errors.username'
                                        />
                                    </div>
                                    <div class='col-md-6'>
                                        <TablerInput
                                            v-model='user.email'
                                            label='Email'
                                            :error='errors.email'
                                        />
                                    </div>
                                    <div class='col-md-6'>
                                        <TablerInput
                                            v-model='user.phone'
                                            label='Phone'
                                            :error='errors.phone'
                                        />
                                    </div>
                                    <div class='col-md-12'>
                                        <NoAccess
                                            v-if='!is_iam("Team:View")'
                                            title='Team Selection'
                                        />
                                        <CardTeams
                                            v-else
                                            :select='true'
                                            @selected='user.teams = $event'
                                        />
                                    </div>

                                    <div class='col-md-12'>
                                        <div class='d-flex'>
                                            <div class='ms-auto'>
                                                <a
                                                    class='cursor-pointer btn btn-primary'
                                                    @click='create'
                                                >Create User</a>
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
    </div>
</template>

<script>
import iam from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import CardTeams from './cards/Teams.vue';
import {
    TablerBreadCrumb,
    TablerInput,
    TablerLoading
} from '@tak-ps/vue-tabler';

export default {
    name: 'UserNew',
    components: {
        NoAccess,
        TablerBreadCrumb,
        CardTeams,
        TablerInput,
        TablerLoading
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
            errors: {
                username: false,
                email: false,
                fname: false,
                lname: false,
                phone: false
            },
            loading: false,
            user: {
                username: '',
                email: '',
                fname: '',
                lname: '',
                phone: '',
                teams: []
            }
        }
    },
    watch: {
        'user.fname': function() {
             this.user.username = `${this.user.fname.toLowerCase()}.${this.user.lname.toLowerCase()}`;
        },
        'user.lname': function() {
             this.user.username = `${this.user.fname.toLowerCase()}.${this.user.lname.toLowerCase()}`;
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        create: async function() {
            for (const field of ['username', 'email', 'fname', 'lname', 'phone']) {
                if (!this.user[field]) this.errors[field] = 'Cannot be empty';
                else this.errors[field] = false;
            }

            for (const e in this.errors) {
                if (this.errors[e]) return;
            }

            this.loading = true;
            const create = await window.std('/api/user', {
                method: 'POST', body: this.user
            });
            this.loading = false;

            this.$router.push(`/user/${create.id}`);
        }
    }
}
</script>
