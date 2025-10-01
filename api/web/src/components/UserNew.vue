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

<script setup>
import { ref, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import iam from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import CardTeams from './cards/Teams.vue';
import {
    TablerBreadCrumb,
    TablerInput,
    TablerLoading
} from '@tak-ps/vue-tabler';

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
    username: false,
    email: false,
    fname: false,
    lname: false,
    phone: false
});

const loading = ref(false);

const user = reactive({
    username: '',
    email: '',
    fname: '',
    lname: '',
    phone: '',
    teams: []
});

watch(() => user.fname, () => {
    user.username = `${user.fname.toLowerCase()}.${user.lname.toLowerCase()}`;
});

watch(() => user.lname, () => {
    user.username = `${user.fname.toLowerCase()}.${user.lname.toLowerCase()}`;
});

const is_iam = (permission) => iam(props.iam, props.auth, permission);

const create = async () => {
    for (const field of ['username', 'email', 'fname', 'lname', 'phone']) {
        if (!user[field]) errors[field] = 'Cannot be empty';
        else errors[field] = false;
    }

    for (const e in errors) {
        if (errors[e]) return;
    }

    loading.value = true;
    const createResult = await window.std('/api/user', {
        method: 'POST', body: user
    });
    loading.value = false;

    router.push(`/user/${createResult.id}`);
};
</script>
