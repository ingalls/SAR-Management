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
                                                            <IconPlus
                                                                :size='24'
                                                                stroke='1'
                                                                class='cursor-pointer'
                                                                @click='user.emergency.push({name: "", relationship: "", phone: ""})'
                                                            />
                                                        </div>
                                                    </div>
                                                    <template v-if='!user.emergency.length'>
                                                        <TablerNone
                                                            label='No Emergency Contacts'
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
                                                                        <IconTrash
                                                                            :size='24'
                                                                            stroke='1'
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
                                            
                                            <!-- Agency Associations Section -->
                                            <div class='col-md-12 mt-4'>
                                                <div class='d-flex align-items-center mb-3'>
                                                    <h3 class='mb-0'>Agency Associations</h3>
                                                    <TablerIconButton
                                                        v-if='is_iam("User:Admin")'
                                                        title='Add Agency Association'
                                                        class='ms-2'
                                                        @click='showAddAgencyModal = true'
                                                    >
                                                        <IconPlus :size='24' stroke='1' />
                                                    </TablerIconButton>
                                                </div>
                                                
                                                <!-- Current Associations -->
                                                <div class='mb-3'>
                                                    <TablerLoading v-if='loading.agencies' />
                                                    <template v-else>
                                                        <TablerNone
                                                            v-if='!userAgencies.length'
                                                            label='No agency associations'
                                                            :create='false'
                                                        />
                                                        <div v-else class='table-responsive'>
                                                            <table class='table table-vcenter card-table'>
                                                                <thead>
                                                                    <tr>
                                                                        <th>Agency</th>
                                                                        <th>Access Level</th>
                                                                        <th></th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <tr v-for='assoc in userAgencies' :key='assoc.agency_id'>
                                                                        <td>{{ assoc.agency_name }}</td>
                                                                        <td>
                                                                            <TablerEnum
                                                                                v-model='assoc.access'
                                                                                :options='["user", "admin"]'
                                                                                :disabled='!is_iam("User:Admin")'
                                                                                @update:modelValue='updateAgencyAccess(assoc)'
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <button
                                                                                v-if='is_iam("User:Admin")'
                                                                                class='btn btn-sm btn-outline-danger'
                                                                                @click='removeAgencyAssociation(assoc.agency_id)'
                                                                            >
                                                                                <IconTrash :size='16' />
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
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

        <AddAgencyAssociation
            v-if='showAddAgencyModal'
            :show='showAddAgencyModal'
            :user-id='parseInt(route.params.userid)'
            :available-agencies='availableAgencies'
            @close='showAddAgencyModal = false'
            @added='fetchUserAgencies'
        />
    </div>
</template>

<script setup>
import iamHelper from '../iam.js';
import Upload from './util/Upload.vue';
import AddAgencyAssociation from './User/AddAgencyAssociation.vue';
import {
    TablerNone,
    TablerBreadCrumb,
    TablerLoading,
    TablerInput,
    TablerSelect,
    TablerEnum,
    TablerIconButton,
} from '@tak-ps/vue-tabler';
import {
    IconPlus,
    IconTrash
} from '@tabler/icons-vue';
import UserProfile from './User/Profile.vue';
import { reactive, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
    iam: {
        type: Object,
        required: true
    },
    auth: {
        type: Object,
        required: true
    }
});

const route = useRoute();
const router = useRouter();

const cache = ref(+new Date());
const headers = ref({ Authorization: `Bearer ${localStorage.token}` });
const upload = ref(false);
const loading = reactive({
    user: true,
    agencies: false
});
const errors = reactive({
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
});
const user = reactive({
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
});

const userAgencies = ref([]);
const availableAgencies = ref([]);
const showAddAgencyModal = ref(false);

function is_iam(permission) { return iamHelper(props.iam, props.auth, permission); }

function uploadurl() {
    return window.stdurl(`api/user/${route.params.userid}/profile`);
}

async function fetch() {
    loading.user = true;
    Object.assign(user, await window.std(`/api/user/${route.params.userid}`));
    loading.user = false;
}

async function fetchUserAgencies() {
    loading.agencies = true;
    try {
        const response = await window.std(`/api/user/${route.params.userid}/agency`);
        userAgencies.value = response.items;
    } catch (err) {
        console.error('Failed to fetch user agencies:', err);
    }
    loading.agencies = false;
}

async function fetchAvailableAgencies() {
    try {
        const response = await window.std('/api/agency');
        availableAgencies.value = response.items.map(agency => ({
            value: agency.id,
            label: agency.name
        }));
    } catch (err) {
        console.error('Failed to fetch agencies:', err);
    }
}

async function updateAgencyAccess(assoc) {
    try {
        await window.std(`/api/user/${route.params.userid}/agency/${assoc.agency_id}`, {
            method: 'PATCH',
            body: {
                access: assoc.access
            }
        });
    } catch (err) {
        console.error('Failed to update agency access:', err);
        alert(err.message || 'Failed to update agency access');
        // Revert the change
        await fetchUserAgencies();
    }
}

async function removeAgencyAssociation(agencyId) {
    if (!confirm('Are you sure you want to remove this agency association?')) return;
    
    try {
        await window.std(`/api/user/${route.params.userid}/agency/${agencyId}`, {
            method: 'DELETE'
        });
        
        // Refresh list
        await fetchUserAgencies();
    } catch (err) {
        console.error('Failed to remove agency association:', err);
        alert(err.message || 'Failed to remove agency association');
    }
}

async function create() {
    for (const field of ['username', 'email', 'fname', 'lname']) {
        if (!user[field]) errors[field] = 'Cannot be empty';
        else errors[field] = '';
    }

    if (user.start_year && isNaN(parseInt(user.start_year))) {
        errors.start_year = 'Invalid Year';
    }

    for (const e in errors) {
        if (errors[e]) return;
    }

    loading.user = true;
    const updated = await window.std(`/api/user/${route.params.userid}`, {
        method: 'PATCH',
        body: {
            username: user.username,
            email: user.email,
            fname: user.fname,
            lname: user.lname,
            phone: user.phone,
            bday: user.bday || undefined,
            address_street: user.address_street,
            address_city: user.address_city,
            address_zip: user.address_zip,
            address_state: user.address_state,
            start_year: user.start_year ? parseInt(user.start_year) : undefined,
            emergency: user.emergency
        }
    });

    loading.user = false;
    router.push(`/user/${updated.id}`);
}

async function deleteUser() {
    loading.user = true;
    await window.std(`/api/user/${route.params.userid}`, {
        method: 'DELETE',
    });
    loading.user = false;
    router.push(`/user/${route.params.userid}`);
}

onMounted(async () => {
    await fetch();
    await fetchUserAgencies();
    if (is_iam('User:Admin')) {
        await fetchAvailableAgencies();
    }
});
</script>
