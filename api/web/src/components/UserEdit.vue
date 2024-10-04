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
                        <div class='card'>
                            <template v-if='loading.user'>
                                <TablerLoading />
                            </template>
                            <template v-else>
                                <div class='row'>
                                    <div class='col-3'>
                                        <UserProfile
                                            bgstyle='cover'
                                            :userid='user.id'
                                            :cache='cache'
                                        />

                                        <div class='card-body d-flex justify-content-center'>
                                            <a
                                                class='cursor-pointer btn btn-secondary'
                                                @click='upload = true'
                                            >Update Photo</a>
                                        </div>
                                    </div>
                                    <div class='col'>
                                        <div class='card-body'>
                                            <div class='row row-cards'>
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
                                                <div class='col-md-6'>
                                                    <TablerInput
                                                        v-model='user.bday'
                                                        type='date'
                                                        label='Birthday'
                                                        :error='errors.bday'
                                                    />
                                                </div>
                                                <div class='col-md-6'>
                                                    <TablerInput
                                                        v-model='user.start_year'
                                                        label='Start Year'
                                                        :error='errors.start_year'
                                                    />
                                                </div>
                                                <div class='col-md-12'>
                                                    <TablerInput
                                                        v-model='user.address_street'
                                                        label='Street'
                                                        :error='errors.address_street'
                                                    />
                                                    <div class='row my-1'>
                                                        <div class='col-md-5'>
                                                            <TablerInput
                                                                v-model='user.address_city'
                                                                label='City'
                                                                :error='errors.address_city'
                                                            />
                                                        </div>
                                                        <div class='col-md-3'>
                                                            <TablerInput
                                                                v-model='user.address_state'
                                                                label='State'
                                                                :error='errors.address_state'
                                                            />
                                                        </div>
                                                        <div class='col-md-4'>
                                                            <TablerInput
                                                                v-model='user.address_zip'
                                                                label='ZipCode'
                                                                :error='errors.address_zip'
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class='col-md-12'>
                                                    <div class='d-flex my-1'>
                                                        Emergency Contacts
                                                        <div class='ms-auto'>
                                                            <PlusIcon
                                                                width='24'
                                                                height='24'
                                                                class='cursor-pointer'
                                                                @click='user.emergency.push({name: "", relationship: "", phone: ""})'
                                                            />
                                                        </div>
                                                    </div>
                                                    <template v-if='!user.emergency.length'>
                                                        <TablerNone
                                                            label='Emergency Contacts'
                                                            :create='false'
                                                        />
                                                    </template>
                                                    <template v-else>
                                                        <div
                                                            v-for='(em, em_it) of user.emergency'
                                                            :key='em_it'
                                                            class='row my-1'
                                                        >
                                                            <div class='col-md-4'>
                                                                <TablerInput
                                                                    v-model='em.name'
                                                                    label='Name'
                                                                />
                                                            </div>
                                                            <div class='col-md-3'>
                                                                <TablerInput
                                                                    v-model='em.relationship'
                                                                    label='Relationship'
                                                                />
                                                            </div>
                                                            <div class='col-md-5'>
                                                                <div class='d-flex'>
                                                                    <TablerInput
                                                                        v-model='em.phone'
                                                                        label='Phone'
                                                                    />

                                                                    <div
                                                                        class='mx-2'
                                                                        style='padding-top: 32px;'
                                                                    >
                                                                        <TrashIcon
                                                                            height='24'
                                                                            width='24'
                                                                            class='cursor-pointer'
                                                                            @click='user.emergency.splice(em_it, 1)'
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </template>
                                                </div>
                                            </div>
                                            <div class='col-md-12 my-4'>
                                                <div class='d-flex'>
                                                    <a
                                                        v-if='is_iam("User:Manage")'
                                                        class='cursor-pointer btn btn-danger'
                                                        @click='deleteUser'
                                                    >Deactivate User</a>

                                                    <div class='ms-auto'>
                                                        <a
                                                            class='cursor-pointer btn btn-primary'
                                                            @click='create'
                                                        >Update User</a>
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
import iam from '../iam.js';
import Upload from './util/Upload.vue';
import {
    TablerNone,
    TablerBreadCrumb,
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
    components: {
        TablerNone,
        Upload,
        PlusIcon,
        TrashIcon,
        UserProfile,
        TablerLoading,
        TablerInput,
        TablerBreadCrumb
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
            token: localStorage.token,
            base: window.stdurl('/').origin,
            cache: +new Date(),
            headers: {
                Authorization: `Bearer ${localStorage.token}`
            },
            upload: false,
            loading: {
                user: true
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
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
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
                else this.errors[field] = '';
            }

            if (this.user.start_year && isNaN(parseInt(this.user.start_year))) {
                this.errors.start_year = 'Invalid Year'
            }

            for (const e in this.errors) {
                if (this.errors[e]) return;
            }

            this.loading.user = true;
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

            this.loading.user = false;
            this.$router.push(`/user/${create.id}`);
        },
        deleteUser: async function() {
            this.loading.user = true;
            await window.std(`/api/user/${this.$route.params.userid}`, {
                method: 'DELETE',
            });
            this.loading.user = false;
            this.$router.push(`/user/${this.$route.params.userid}`);
        }
    }
}
</script>
