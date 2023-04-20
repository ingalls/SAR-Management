<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <BreadCrumb/>
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
                        <template v-if='loading.user'>
                            <TablerLoading/>
                        </template>
                        <template v-else>
                            <div class='row'>
                                <div class='col-3'>
                                    <UserProfile bgstyle='cover' :userid='user.id' :cache='cache'/>

                                    <div class='card-body d-flex justify-content-center'>
                                        <a @click='upload = true' class="cursor-pointer btn btn-secondary">Update Photo</a>
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
                                            <div class="col-md-12">
                                                <div class='d-flex my-1'>
                                                    Emergency Contacts
                                                    <div class='ms-auto'>
                                                        <PlusIcon @click='user.emergency.push({name: "", relationship: "", phone: ""})' width='24' height='24' class='cursor-pointer'/>
                                                    </div>
                                                </div>
                                                <template v-if='!user.emergency.length'>
                                                    <None label='Emergency Contacts' :create='false'/>
                                                </template>
                                                <template v-else>
                                                    <div :key='em_it' v-for='(em, em_it) of user.emergency' class='row my-1'>
                                                        <div class="col-md-4">
                                                            <TablerInput label='Name' v-model='em.name'/>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <TablerInput label='Relationship' v-model='em.relationship' />
                                                        </div>
                                                        <div class="col-md-5">
                                                            <div class='d-flex'>
                                                                <TablerInput label='Phone' v-model='em.phone'/>

                                                                <div class='mx-2' style='padding-top: 32px;'>
                                                                    <TrashIcon @click='user.emergency.splice(em_it, 1)' height='24' width='24' class='cursor-pointer'/>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </template>
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
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Upload
        v-if='upload'
        :url='uploadurl()'
        :headers='headers'
        @err='upload = null; err = $event'
        @close='upload = null'
        @done='upload = null; cache = +new Date()'
    />
</div>
</template>

<script>
import None from './util/None.vue';
import Upload from './util/Upload.vue';
import BreadCrumb from './util/BreadCrumb.vue';
import {
    TablerLoading,
    TablerInput,
} from '@tak-ps/vue-tabler'
import {
    PlusIcon,
    TrashIcon
} from 'vue-tabler-icons';
import UserProfile from './User/Profile.vue';

export default {
    name: 'UserEdit',
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
            token: localStorage.token,
            base: window.stdurl('/').origin,
            cache: +new Date(),
            upload: false,
            loading: {
                user: true
            },
            headers: {
                Authorization: `Bearer ${localStorage.token}`
            },
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
                start_year: '',
                emergency: []
            }
        }
    },
    mounted: async function() {
        await this.fetch();
    },
    methods: {
        uploadurl: function() {
            return window.stdurl(`api/user/${this.$route.params.userid}/profile`);
        },
        fetch: async function() {
            this.loading.user = true;
            this.user = await window.std(`/api/user/${this.$route.params.userid}`);
            this.loading.user = false;
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
                    bday: this.user.bday || undefined,
                    address_street: this.user.address_street,
                    address_city: this.user.address_city,
                    address_zip: this.user.address_zip,
                    address_state: this.user.address_state,
                    start_year: this.user.start_year ? parseInt(this.user.start_year) : undefined,
                    emergency: this.user.emergency
                }
            });

            this.$router.push(`/user/${create.id}`);
        }
    },
    components: {
        None,
        Upload,
        PlusIcon,
        TrashIcon,
        UserProfile,
        TablerLoading,
        TablerInput,
        BreadCrumb
    }
}
</script>
