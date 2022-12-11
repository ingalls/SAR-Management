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
                            <li class="breadcrumb-item active" aria-current="page"><a href="#" v-text='user.id'></a></li>
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
                    <div class="card">
                        <div class='row'>
                            <div class='col-3'>
                                <UserProfile :user='user'/>

                                <div class='card-body d-flex justify-content-center'>
                                    <a @click='upload = true' class="cursor-pointer btn btn-secondary">Update Profile</a>
                                </div>
                            </div>
                            <div class='col'>
                                <div class="card-body">
                                    <div class='row row-cards'>
                                        <div class="col-md-6">
                                            <TablerInput label='First Name' v-model='user.fname' :error='errors.fname' />
                                        </div>
                                        <div class="col-md-6">
                                            <TablerInput label='Last Name' v-model='user.lname' :error='errors.lname' />
                                        </div>
                                        <div class="col-md-6">
                                            <TablerInput label='Username' v-model='user.username' :error='errors.username' />
                                        </div>
                                        <div class="col-md-6">
                                            <TablerInput label='Email' v-model='user.email' :error='errors.email' />
                                        </div>
                                        <div class="col-md-6">
                                            <TablerInput label='Phone' v-model='user.phone' :error='errors.phone' />
                                        </div>
                                        <div class="col-md-6">
                                            <TablerInput type='date' label='Birthday' v-model='user.bday' :error='errors.bday' />
                                        </div>
                                    </div>
                                    <div class="col-md-12">
                                        <div class='d-flex'>
                                            <div class='ms-auto'>
                                                <a @click='create' class="cursor-pointer btn btn-primary">Update User</a>
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

    <PageFooter/>
    <TablerError v-if='err' :err='err' @close='err = null'/>
    <Upload
        v-if='upload'
        @err='upload = null; err = $event'
        @close='upload = null'
        @upload='upload = null; asset($event)'
    />
</div>
</template>

<script>
import PageFooter from './PageFooter.vue';
import Upload from './util/Upload.vue';
import {
    TablerError,
    TablerInput,
} from '@tak-ps/vue-tabler'
import UserProfile from './User/Profile.vue';

export default {
    name: 'TeamUserEdit',
    data: function() {
        return {
            err: false,
            token: localStorage.token,
            base: window.stdurl('/').origin,
            upload: false,
            errors: {
                username: '',
                email: '',
                fname: '',
                lname: '',
                phone: '',
                bday: ''
            },
            user: {
                username: '',
                email: '',
                fname: '',
                lname: '',
                phone: '',
                bday: ''
            }
        }
    },
    mounted: function() {
        this.fetch();
    },
    methods: {
        fetch: async function() {
            try {
                this.user = await window.std(`/api/user/${this.$route.params.userid}`);
            } catch (err) {
                this.err = err;
            }
        },
        asset: async function(asset) {
            try {
                this.user = await window.std(`/api/user/${this.$route.params.userid}`, {
                    method: 'PATCH',
                    body: {
                        profile_id: asset.id
                    }
                });
            } catch (err) {
                this.err = err;
            }
        },
        create: async function() {
            for (const field of ['username', 'email', 'fname', 'lname']) {
                if (!this.user[field]) this.errors[field] = 'Cannot be empty';
                else this.errors[field] = false;
            }

            for (const e in this.errors) {
                if (this.errors[e]) return;
            }

            try {
                const create = await window.std(`/api/user/${this.$route.params.userid}`, {
                    method: 'PATCH',
                    body: {
                        username: this.user.username,
                        email: this.user.email,
                        fname: this.user.fname,
                        lname: this.user.lname,
                        phone: this.user.phone,
                    }
                });

                this.$router.push(`/team/user/${create.id}`);
            } catch (err) {
                this.err = err;
            }
        }
    },
    components: {
        TablerError,
        Upload,
        PageFooter,
        UserProfile,
        TablerInput,
    }
}
</script>
