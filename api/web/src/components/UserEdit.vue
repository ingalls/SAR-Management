<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a @click='$router.push("/")' class="cursor-pointer">Home</a></li>
                            <li class="breadcrumb-item" aria-current="page"><a  @click='$router.push("/user")' class="cursor-pointer">Users</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="#" v-text='$route.params.userid'></a></li>
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
                                        <div class="col-md-6">
                                            <TablerInput label='Start Year' v-model='user.start_year' :error='errors.start_year' />
                                        </div>
                                        <div class="col-md-12">
                                            <TablerInput label='Street' v-model='user.address_street' :error='errors.address_street' />
                                            <div class='row my-1'>
                                                <div class="col-md-5">
                                                    <TablerInput label='City' v-model='user.address_city' :error='errors.address_city' />
                                                </div>
                                                <div class="col-md-3">
                                                    <TablerInput label='State' v-model='user.address_state' :error='errors.address_state' />
                                                </div>
                                                <div class="col-md-4">
                                                    <TablerInput label='ZipCode' v-model='user.address_zip' :error='errors.address_zip' />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-12 my-4">
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
    TablerInput,
} from '@tak-ps/vue-tabler'
import UserProfile from './User/Profile.vue';

export default {
    name: 'UserEdit',
    data: function() {
        return {
            token: localStorage.token,
            base: window.stdurl('/').origin,
            upload: false,
            errors: {
                username: '',
                email: '',
                fname: '',
                lname: '',
                phone: '',
                bday: '',
                address_street: '',
                address_city: '',
                address_state: '',
                address_zip: '',
                start_year: ''
            },
            user: {
                username: '',
                email: '',
                fname: '',
                lname: '',
                phone: '',
                bday: '',
                address_street: '',
                address_city: '',
                address_state: '',
                address_zip: '',
                start_year: ''
            }
        }
    },
    mounted: async function() {
        await this.fetch();
    },
    methods: {
        fetch: async function() {
            this.user = await window.std(`/api/user/${this.$route.params.userid}`);
        },
        asset: async function(asset) {
            this.user = await window.std(`/api/user/${this.$route.params.userid}`, {
                method: 'PATCH',
                body: {
                    profile_id: asset.id
                }
            });
        },
        create: async function() {
            for (const field of ['username', 'email', 'fname', 'lname']) {
                if (!this.user[field]) this.errors[field] = 'Cannot be empty';
                else this.errors[field] = false;
            }

            if (this.user.start_year && isNaN(parseInt(this.user.start_year))) {
                this.errors.start_year = 'Invalid Year'
            }

            for (const e in this.errors) {
                if (this.errors[e]) return;
            }

            const create = await window.std(`/api/user/${this.$route.params.userid}`, {
                method: 'PATCH',
                body: {
                    username: this.user.username,
                    email: this.user.email,
                    fname: this.user.fname,
                    lname: this.user.lname,
                    phone: this.user.phone,
                    bday: this.user.bday,
                    address_street: this.user.address_street,
                    address_city: this.user.address_city,
                    address_zip: this.user.address_zip,
                    address_state: this.user.address_state,
                    start_year: this.user.start_year ? parseInt(this.user.start_year) : undefined
                }
            });

            this.$router.push(`/user/${create.id}`);
        }
    },
    components: {
        Upload,
        PageFooter,
        UserProfile,
        TablerInput,
    }
}
</script>
