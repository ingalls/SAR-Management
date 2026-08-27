<template>
    <div    
        class='page page-center position-relative'    
        style='overflow: hidden; height: 100vh; background: radial-gradient(at left top, #07556D, #023047);'    
    >
        <div class='container container-normal py-4'>
            <div class='row align-items-center g-4'>
                <div class='col-lg'>
                    <div class='container-tight'>
                        <div class='card card-md shadow-lg'>
                            <div class='card-body'>
                                <div
                                    class='text-center'
                                    style='margin-bottom: 24px;'
                                >
                                    <img
                                        src='/logo.png'
                                        draggable='false'
                                        style='height: 150px;'
                                        class='user-select-none'
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
                                    <template v-if='showLocal'>
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

                                    <template v-if='showSSO'>
                                        <div
                                            v-if='showLocal'
                                            class='hr-text'
                                        >
                                            or
                                        </div>
                                        <button
                                            type='button'
                                            class='btn btn-outline-primary w-100'
                                            @click='startSSO'
                                        >
                                            <IconLogin2
                                                size='18'
                                                class='me-2'
                                            />
                                            Sign In with {{ sso.name }}
                                        </button>
                                    </template>
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

        <div
            class='position-absolute bottom-0 start-0 end-0 text-center text-white-50 small py-3'
            style='z-index: 10;'
        >
            <div class='container-xl'>
                <div class='row text-center align-items-center flex-row-reverse'>
                    <div class='col-lg-auto ms-lg-auto'>
                        <ul class='list-inline list-inline-dots mb-0'>
                            <li class='list-inline-item'>
                                <a
                                    href='/docs/'
                                    class='text-white-50 text-decoration-none'
                                >Documentation</a>
                            </li>
                            <li class='list-inline-item'>
                                <a
                                    href='https://github.com/ingalls/SAR-Management'
                                    target='_blank'
                                    class='text-white-50 text-decoration-none'
                                    rel='noopener'
                                >Source code</a>
                            </li>
                        </ul>
                    </div>
                    <div class='col-12 col-lg-auto mt-3 mt-lg-0'>
                        <ul class='list-inline list-inline-dots mb-0'>
                            <li class='list-inline-item'>
                                Copyright © 2026
                                <a
                                    href='https://ingalls.ca'
                                    class='text-white-50 text-decoration-none'
                                >Nick Ingalls</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div
            class='dropup position-absolute'
            style='bottom: 24px; right: 24px; z-index: 20;'
        >
            <div
                class='cursor-pointer'
                @click='showSettings = !showSettings'
            >
                <IconSettings class='text-white' />
            </div>

            <div
                v-if='showSettings'
                class='dropdown-menu dropdown-menu-card show dropdown-menu-end p-0 shadow'
                style='min-width: 300px; bottom: 100% !important; top: auto !important; right: 0 !important; left: auto !important;'
            >
                <div class='card'>
                    <div class='card-header'>
                        <h3 class='card-title'>
                            Login Settings
                        </h3>
                        <div class='card-actions'>
                            <button
                                class='btn-close'
                                @click.stop='showSettings = false'
                            />
                        </div>
                    </div>
                    <div class='card-body p-0'>
                        <div class='px-3 pt-2 pb-1 border-bottom'>
                            <span class='text-muted small'>Running </span>
                            <code class='small'>v{{ version }}</code>
                            <span class='text-muted small'> (build: {{ buildHash }})</span>
                        </div>
                        <div
                            v-if='workers.length === 0'
                            class='p-3 text-muted text-center'
                        >
                            No Service Workers Found
                        </div>
                        <div
                            v-else
                            class='list-group list-group-flush'
                        >
                            <div
                                v-for='w in workers'
                                :key='w.url'
                                class='list-group-item'
                            >
                                <div class='d-flex justify-content-between align-items-center'>
                                    <div
                                        class='text-truncate me-2'
                                        title='Service Worker'
                                    >
                                        <div class='fw-bold'>
                                            {{ w.url }}
                                        </div>
                                        <div class='mt-1 d-flex align-items-center gap-2'>
                                            <TablerBadge
                                                background-color='rgba(34, 197, 94, 0.2)'
                                                border-color='rgba(34, 197, 94, 0.5)'
                                                text-color='#16a34a'
                                            >
                                                {{ w.state }}
                                            </TablerBadge>
                                            <div
                                                v-if='w.build'
                                                class='text-muted small'
                                            >
                                                {{ w.build }}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        class='btn btn-icon btn-ghost-danger btn-sm'
                                        title='Unregister'
                                        @click='unregister(w.registration)'
                                    >
                                        <IconTrash size='16' />
                                    </button>
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
import { ref, computed, watch, onMounted } from 'vue';
import { version } from '../../package.json';
import { useRouter, useRoute } from 'vue-router';
import { getCurrentEntryBuildId, supportsServiceWorker } from '../base/service-worker.ts';
import {
    TablerInput,
    TablerLoading,
    TablerBadge
} from '@tak-ps/vue-tabler';
import {
    IconCopy,
    IconCheck,
    IconSettings,
    IconLogin2,
    IconTrash
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
const buildHash = getCurrentEntryBuildId();
const showSettings = ref(false);
const workers = ref([]);

const body = ref({
    username: '',
    password: ''
});

const sso = ref({
    enabled: false,
    name: 'Single Sign-On'
});

// Server-wide toggle for traditional username/password login
const local = ref({
    enabled: true
});

// ?local=1 forces the password form only (ie: for admins when SSO is down)
const forceLocal = computed(() => Boolean(route.query.local) && route.query.local !== 'false');

// Always fall back to the password form if SSO isn't available
const showLocal = computed(() => forceLocal.value || local.value.enabled || !sso.value.enabled);
const showSSO = computed(() => sso.value.enabled && !forceLocal.value);

onMounted(async () => {
    // Returning from the OAuth2 provider - complete the login
    if (route.query.code && route.query.state) {
        await completeSSO(String(route.query.code), String(route.query.state));
        return;
    }

    try {
        const result = await window.std('/api/config?keys=oauth_enabled,oauth_name,local_login_enabled');
        const enabled = result.config.oauth_enabled.value;
        sso.value.enabled = enabled === true || enabled === 'true';
        sso.value.name = result.config.oauth_name.value || 'Single Sign-On';

        const localEnabled = result.config.local_login_enabled.value;
        local.value.enabled = localEnabled !== false && localEnabled !== 'false';
    } catch (err) {
        console.error('Failed to fetch SSO config:', err);
    }

    // Allow an IdP application tile (ie: /login?sso=1) to skip the login form
    // and start the SSO flow immediately
    if (showSSO.value && route.query.sso && route.query.sso !== 'false') {
        await startSSO();
    }
});

async function startSSO() {
    loading.value = true;

    try {
        if (route.query.redirect) sessionStorage.ssoRedirect = String(route.query.redirect);
        const res = await window.std('/api/login/oauth');
        window.location.href = res.url;
    } catch (err) {
        loading.value = false;
        throw err;
    }
}

async function completeSSO(code, state) {
    loading.value = true;

    try {
        const login = await window.std('/api/login/oauth', {
            method: 'POST',
            body: { code, state }
        });

        localStorage.token = login.token;

        const redirect = sessionStorage.ssoRedirect;
        delete sessionStorage.ssoRedirect;

        emit('login');

        if (redirect && !redirect.includes('/login')) {
            router.push(redirect);
        } else {
            router.push("/");
        }
    } catch (err) {
        loading.value = false;
        // Strip the consumed code/state from the URL so a refresh shows the login form
        router.replace({ path: '/login' });
        throw err;
    }
}

const fetchWorkers = async () => {
    if (!supportsServiceWorker()) return;
    const registrations = await navigator.serviceWorker.getRegistrations();
    workers.value = registrations.map(r => {
        const worker = r.active || r.waiting || r.installing;
        const scriptURL = worker?.scriptURL;

        let url = 'Unknown';
        let build = null;

        if (scriptURL) {
            try {
                const u = new URL(scriptURL);
                url = u.origin + u.pathname;
                build = u.searchParams.get('build');
            } catch {
                url = scriptURL;
            }
        }

        return {
            url,
            state: worker?.state || 'Unknown',
            build,
            registration: r
        }
    });
}

const unregister = async (r) => {
    await r.unregister();
    await fetchWorkers();
}

watch(showSettings, (val) => {
    if (val) fetchWorkers();
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
