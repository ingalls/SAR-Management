<template>
    <div>
        <div class='card-header'>
            <h3 class='card-title'>
                Server Settings
            </h3>
        </div>
        <div class='card-body'>
            <TablerLoading v-if='loading' />
            <template v-else>
                <!-- Organisation Settings -->
                <div class='mb-4'>
                    <h4 class='mb-3'>
                        Organisation Settings
                    </h4>
                    <div class='row'>
                        <div class='col-12 pb-3'>
                            <TablerInput
                                v-model='config.name.value'
                                label='Organisation Name'
                                desc='Public display name for your organization'
                                :disabled='auth.access !== "admin"'
                            />
                        </div>
                        <div class='col-12 pb-3'>
                            <TablerInput
                                v-model='config.frontend.value'
                                label='Frontend URL'
                                desc='Public URL where users access the application'
                                :disabled='auth.access !== "admin"'
                            />
                        </div>
                        <div class='col-12 pb-3'>
                            <TablerTimeZone
                                v-model='config.timezone.value'
                                label='Default Timezone'
                                desc='Default timezone for new users and system operations'
                                :disabled='auth.access !== "admin"'
                            />
                        </div>
                    </div>
                </div>

                <!-- Slack Integration -->
                <div class='mb-4'>
                    <h4 class='mb-3'>
                        Slack Integration
                    </h4>
                    <div class='row'>
                        <div class='col-12 pb-3'>
                            <TablerToggle
                                v-model='slackEnabled'
                                label='Enable Slack Integration'
                                desc='Enable integration with Slack for notifications and channel management'
                                :disabled='auth.access !== "admin"'
                            />
                        </div>
                        <template v-if='slackEnabled'>
                            <div class='col-12 pb-3'>
                                <TablerInput
                                    v-model='config.slack_app_id.value'
                                    label='App ID'
                                    desc='Slack App ID from your Slack app configuration'
                                    :disabled='auth.access !== "admin"'
                                />
                            </div>
                            <div class='col-12 pb-3'>
                                <TablerInput
                                    v-model='config.slack_token.value'
                                    label='Access Token'
                                    type='password'
                                    desc='Bot User OAuth Token for Slack API access'
                                    :disabled='auth.access !== "admin"'
                                />
                            </div>
                            <div class='col-12 pb-3'>
                                <TablerInput
                                    v-model='config.slack_refresh.value'
                                    label='Refresh Token'
                                    type='password'
                                    desc='OAuth refresh token for maintaining Slack connection'
                                    :disabled='auth.access !== "admin"'
                                />
                            </div>
                        </template>
                    </div>
                </div>

                <!-- Single Sign-On (OAuth2) -->
                <div class='mb-4'>
                    <h4 class='mb-3'>
                        Single Sign-On (OAuth2)
                    </h4>
                    <div class='row'>
                        <div class='col-12 pb-3'>
                            <TablerToggle
                                v-model='oauthEnabled'
                                label='Enable Single Sign-On'
                                desc='Show an SSO button on the login page that authenticates users via an external OAuth2 provider. Users are matched to existing accounts by email address.'
                                :disabled='auth.access !== "admin"'
                            />
                        </div>
                        <template v-if='oauthEnabled'>
                            <div class='col-12 pb-3'>
                                <TablerToggle
                                    v-model='localLoginEnabled'
                                    label='Allow Username & Password Login'
                                    desc='When disabled, only administrators may sign in with a password; all other users must use Single Sign-On. The password form remains reachable at /login?local=1'
                                    :disabled='auth.access !== "admin"'
                                />
                            </div>
                            <div class='col-12 pb-3'>
                                <TablerInput
                                    v-model='config.oauth_name.value'
                                    label='Button Label'
                                    desc='Provider name shown on the login button, e.g. "Google" or "Okta"'
                                    :disabled='auth.access !== "admin"'
                                />
                            </div>
                            <div class='col-12 pb-3'>
                                <TablerInput
                                    v-model='config.oauth_client_id.value'
                                    label='Client ID'
                                    desc='OAuth2 Client ID issued by your identity provider'
                                    :disabled='auth.access !== "admin"'
                                />
                            </div>
                            <div class='col-12 pb-3'>
                                <TablerInput
                                    v-model='config.oauth_client_secret.value'
                                    label='Client Secret'
                                    type='password'
                                    desc='OAuth2 Client Secret issued by your identity provider'
                                    :disabled='auth.access !== "admin"'
                                />
                            </div>
                            <div class='col-12 pb-3'>
                                <TablerInput
                                    v-model='config.oauth_authorize_url.value'
                                    label='Authorization URL'
                                    desc='Provider endpoint users are redirected to in order to sign in'
                                    :disabled='auth.access !== "admin"'
                                />
                            </div>
                            <div class='col-12 pb-3'>
                                <TablerInput
                                    v-model='config.oauth_token_url.value'
                                    label='Token URL'
                                    desc='Provider endpoint used to exchange the authorization code for an access token'
                                    :disabled='auth.access !== "admin"'
                                />
                            </div>
                            <div class='col-12 pb-3'>
                                <TablerInput
                                    v-model='config.oauth_userinfo_url.value'
                                    label='UserInfo URL'
                                    desc='Provider endpoint returning the signed-in user profile (must include an email address)'
                                    :disabled='auth.access !== "admin"'
                                />
                            </div>
                            <div class='col-12 pb-3'>
                                <TablerInput
                                    v-model='config.oauth_scopes.value'
                                    label='Scopes'
                                    desc='Space separated scopes to request, e.g. "openid email profile"'
                                    :disabled='auth.access !== "admin"'
                                />
                            </div>
                            <div class='col-12 pb-3'>
                                <TablerInput
                                    :model-value='redirectURI'
                                    label='Redirect URI'
                                    desc='Register this exact URL as an allowed redirect/callback URI with your identity provider'
                                    disabled
                                />
                            </div>
                        </template>
                    </div>
                </div>

                <div
                    v-if='auth.access === "admin"'
                    class='col-12 pb-3 d-flex'
                >
                    <div class='ms-auto'>
                        <button
                            class='btn btn-primary'
                            :disabled='saving'
                            @click='save'
                        >
                            <span
                                v-if='saving'
                                class='spinner-border spinner-border-sm me-2'
                            />
                            {{ saving ? 'Saving...' : 'Save Settings' }}
                        </button>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import {
    TablerLoading,
    TablerTimeZone,
    TablerInput,
    TablerToggle,
} from '@tak-ps/vue-tabler';

defineProps({
    auth: {
        type: Object,
        required: true
    }
});

const loading = ref(true);
const saving = ref(false);
const config = reactive({});

// Initialize config keys
const configKeys = [
    'name',
    'frontend',
    'timezone',
    'slack_enabled',
    'slack_app_id',
    'slack_token',
    'slack_refresh',
    'oauth_enabled',
    'oauth_name',
    'local_login_enabled',
    'oauth_client_id',
    'oauth_client_secret',
    'oauth_authorize_url',
    'oauth_token_url',
    'oauth_userinfo_url',
    'oauth_scopes'
];

for (const key of configKeys) {
    config[key] = {
        key: key,
        value: '',
        public: ['name', 'frontend', 'oauth_enabled', 'oauth_name', 'local_login_enabled'].includes(key)
    };
}

// Computed property for slack enabled state
const slackEnabled = computed({
    get: () => config.slack_enabled.value === true || config.slack_enabled.value === 'true',
    set: (val) => {
        config.slack_enabled.value = val;
    }
});

// Computed property for SSO enabled state
const oauthEnabled = computed({
    get: () => config.oauth_enabled.value === true || config.oauth_enabled.value === 'true',
    set: (val) => {
        config.oauth_enabled.value = val;
    }
});

// Computed property for local (username/password) login state - defaults to enabled
const localLoginEnabled = computed({
    get: () => config.local_login_enabled.value !== false && config.local_login_enabled.value !== 'false',
    set: (val) => {
        config.local_login_enabled.value = val;
    }
});

// The callback URL the admin must register with the identity provider
const redirectURI = computed(() => {
    const base = config.frontend.value || window.location.origin;
    try {
        return new URL('/login', base).toString();
    } catch {
        return `${base}/login`;
    }
});

// Fetch all config values in a single request
const fetchConfig = async () => {
    try {
        const keys = configKeys.join(',');
        const result = await window.std(`/api/config?keys=${keys}`);
        
        // Update config with fetched values
        for (const [key, data] of Object.entries(result.config)) {
            if (config[key]) {
                config[key].value = data.value;
                config[key].public = data.public;
            }
        }
    } catch (err) {
        console.error('Failed to fetch config:', err);
    }
};

// Save all config values in a single request
const save = async () => {
    saving.value = true;
    try {
        const updates = {};
        for (const key of configKeys) {
            updates[key] = {
                value: config[key].value,
                public: config[key].public
            };
        }
        
        await window.std('/api/config', {
            method: 'PUT',
            body: { config: updates }
        });
    } catch (err) {
        console.error('Failed to save config:', err);
        alert('Failed to save settings: ' + err.message);
    } finally {
        saving.value = false;
    }
};

onMounted(async () => {
    loading.value = true;
    await fetchConfig();
    loading.value = false;
});
</script>
