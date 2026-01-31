<template>
    <div    
        class='page page-center position-relative'    
        style='overflow: auto;'    
    >
        <div class='container container-normal py-4'>
            <div class='row align-items-center g-4'>
                <div class='col-lg'>
                    <div class='container-tight'>
                        <div class='card card-md'>
                            <div class='card-body'>
                                <div
                                    class='text-center'
                                    style='margin-bottom: 24px;'
                                >
                                    <img
                                        src='/logo.png'
                                        draggable='false'
                                        style='height: 150px;'
                                    >
                                </div>

                                <TablerLoading
                                    v-if='loading'
                                />
                                <template v-else-if='stage === "mfa"'>
                                    <div class='mb-4 text-center'>
                                        <h2 class='h2 user-select-none mb-1'>
                                            Two-Factor Authentication
                                        </h2>
                                        <div class='text-muted'>
                                            Verify your identity to continue
                                        </div>
                                    </div>

                                    <div
                                        v-if='mfa.secret'
                                        class='card mb-3'
                                    >
                                        <div class='card-body'>
                                            <div class='text-center mb-3'>
                                                <div class='fw-bold mb-2'>
                                                    Scan QR Code
                                                </div>
                                                <img 
                                                    :src='mfa.qr' 
                                                    alt='MFA QR Code'
                                                    style='width: 200px; height: 200px; border-radius: 4px; border: 1px solid #e6e7e9;'
                                                >
                                            </div>
                                            
                                            <div class='hr-text'>
                                                or enter manual code
                                            </div>
                                            
                                            <div class='input-group input-group-flat'>
                                                <input 
                                                    type='text' 
                                                    class='form-control text-center font-monospace' 
                                                    :value='mfa.secret' 
                                                    readonly
                                                >
                                                <span class='input-group-text'>
                                                    <a 
                                                        href='#' 
                                                        class='link-secondary' 
                                                        title='Copy secret' 
                                                        @click.prevent='copySecret'
                                                    >
                                                        <IconCheck
                                                            v-if='copied'
                                                            class='text-primary'
                                                        />
                                                        <IconCopy v-else />
                                                    </a>
                                                </span>
                                            </div>
                                            <div class='text-center mt-2 text-muted small'>
                                                Add this secret to your authenticator app
                                            </div>
                                        </div>
                                    </div>

                                    <div class='mb-3'>
                                        <label class='form-label'>Verification Code</label>
                                        <TablerInput
                                            v-model='mfa.token'
                                            icon='lock'
                                            placeholder='000 000'
                                            autocomplete='one-time-code'
                                            inputmode='numeric'
                                            pattern='[0-9]*'
                                            class='text-center letter-spacing-2'
                                            @keyup.enter='submitMFA'
                                        />
                                    </div>

                                    <div class='form-footer'>
                                        <button
                                            type='submit'
                                            class='btn btn-primary w-100'
                                            :disabled='!mfa.token || mfa.token.length < 6'
                                            @click='submitMFA'
                                        >
                                            Verify & Login
                                        </button>
                                    </div>
                                    
                                    <div class='text-center mt-3'>
                                        <a
                                            href='#'
                                            class='text-muted'
                                            @click.prevent='stage = "login"; mfa.token = ""'
                                        >
                                            Back to Login
                                        </a>
                                    </div>
                                </template>
                                <template v-else>
                                    <h2 class='h2 text-center mb-4 user-select-none'>
                                        Login to your account
                                    </h2>
                                    <div class='mb-3'>
                                        <TablerInput
                                            v-model='body.username'
                                            icon='user'
                                            label='Username or Email'
                                            placeholder='your@email.com'
                                            autocomplete='off'
                                            @keyup.enter='createLogin'
                                        />
                                    </div>
                                    <div class='mb-2'>
                                        <label class='form-label'>
                                            Password
                                            <span class='form-label-description'>
                                                <a
                                                    class='cursor-pointer user-select-none'
                                                    @click='$router.push("/login/forgot")'
                                                >Forgot Password</a>
                                            </span>
                                        </label>
                                        <TablerInput
                                            v-model='body.password'
                                            icon='lock'
                                            type='password'
                                            placeholder='Your password'
                                            autocomplete='off'
                                            @keyup.enter='createLogin'
                                        />
                                    </div>
                                    <div class='form-footer'>
                                        <button
                                            type='submit'
                                            class='btn btn-primary w-100'
                                            @click='createLogin'
                                        >
                                            Sign In
                                        </button>
                                    </div>
                                </template>
                            </div>
                        </div>
                        <div class='text-center text-muted mt-3 user-select-none'>
                            Don't have account yet? <a href='mailto:rescue@ingalls.ca'>Contact Us</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
    TablerInput,
    TablerLoading
} from '@tak-ps/vue-tabler';
import {
    IconCopy,
    IconCheck
} from '@tabler/icons-vue';

const emit = defineEmits(['login']);

const route = useRoute();
const router = useRouter();

const stage = ref('login');
const mfa = ref({
    token: '',
    secret: '',
    qr: ''
});

const copied = ref(false);
const loading = ref(false);
const body = ref({
    username: '',
    password: ''
});

function copySecret() {
    navigator.clipboard.writeText(mfa.value.secret);
    copied.value = true;
    setTimeout(() => {
        copied.value = false;
    }, 1000);
}

async function submitMFA() {
    loading.value = true;

    try {
        const login = await window.std('/api/login/mfa', {
            method: 'POST',
            body: {
                token: mfa.value.token
            }
        });

        localStorage.token = login.token;

        emit('login');

        if (route.query.redirect && !String(route.query.redirect).includes('/login')) {    
            router.push(String(route.query.redirect));    
        } else {                                      
            router.push("/");          
        } 
    } catch (err) {
        loading.value = false;
        throw err;
    }
}

async function createLogin() {
    loading.value = true;

    try {
        const login = await window.std('/api/login', {
            method: 'POST',
            body: body.value
        });

        localStorage.token = login.token;

        if (login.mfa || login.secret) {
            stage.value = 'mfa';
            if (login.secret) mfa.value.secret = login.secret;
            if (login.qr) mfa.value.qr = login.qr;
            loading.value = false;
        } else {
            emit('login');

            if (route.query.redirect && !String(route.query.redirect).includes('/login')) {    
                router.push(String(route.query.redirect));    
            } else {                                      
                router.push("/");          
            } 
        }
    } catch (err) {
        loading.value = false;
        throw err;
    }
}
</script>
