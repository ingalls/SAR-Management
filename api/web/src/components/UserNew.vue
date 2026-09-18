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
                                    <div
                                        v-if='application'
                                        class='col-md-12'
                                    >
                                        <div class='alert alert-info mb-0'>
                                            Creating a member from the application of
                                            <a
                                                class='cursor-pointer'
                                                @click='router.push(`/application/${application.id}`)'
                                                v-text='application.name'
                                            />. The application will be linked to the new member and marked as onboarded.
                                        </div>
                                    </div>
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

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import iamHelper from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import CardTeams from './cards/Teams.vue';
import {
    TablerBreadCrumb,
    TablerInput,
    TablerLoading
} from '@tak-ps/vue-tabler';

const route = useRoute();
const router = useRouter();

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

const errors = reactive({
    email: false,
    fname: false,
    lname: false,
    phone: false
});

const loading = ref(false);

// Set when the member is being created from an accepted application: /user/new?application=<id>
const application = ref(null);

const user = reactive({
    email: '',
    fname: '',
    lname: '',
    phone: '',
    teams: []
});

const is_iam = (permission) => iamHelper(props.iam, props.auth, permission);

const create = async () => {
    for (const field of ['email', 'fname', 'lname', 'phone']) {
        if (!user[field]) errors[field] = 'Cannot be empty';
        else errors[field] = false;
    }

    for (const e in errors) {
        if (errors[e]) return;
    }

    loading.value = true;

    let createResult;
    try {
        createResult = await window.std('/api/user', {
            method: 'POST', body: user
        });
    } catch (err) {
        loading.value = false;
        throw err;
    }

    try {
        if (application.value) {
            await window.std(`/api/application/${application.value.id}`, {
                method: 'PATCH',
                body: {
                    user_id: createResult.id,
                    status: 'onboarded'
                }
            });
        }
    } finally {
        // The member exists at this point even if the application could not be updated
        loading.value = false;
        router.push(`/user/${createResult.id}`);
    }
};

const prefill = async () => {
    if (!route.query.application || !is_iam('Application:View')) return;

    loading.value = true;
    try {
        const app = await window.std(`/api/application/${route.query.application}`);
        application.value = app;

        const name = String(app.name || '').trim().split(/\s+/);
        user.fname = name.shift() || '';
        user.lname = name.join(' ');
        user.email = app.email;
        user.phone = app.phone;

        // Address answers are only present if the application form asks for them
        const address = {
            address_street: app.answers.addr,
            address_city: app.answers.city,
            address_state: app.answers.state,
            address_zip: app.answers.zip
        };

        for (const key in address) {
            if (typeof address[key] === 'string' && address[key].trim()) user[key] = address[key].trim();
        }
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    await prefill();
});
</script>
