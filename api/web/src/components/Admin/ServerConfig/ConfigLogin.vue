<template>
    <ConfigSection
        v-model='isOpen'
        v-model:edit='edit'
        label='Login &amp; Single Sign-On'
        :loading='loading'
        :err='err'
        @save='save'
        @cancel='cancel'
    >
        <TablerToggle
            v-model='config.oauth_enabled'
            :disabled='!edit'
            label='Enable Single Sign-On (OAuth2)'
            description='Show an SSO button on the login page that authenticates users via an external OAuth2 provider. Users are matched to existing accounts by email address.'
        />

        <template v-if='config.oauth_enabled'>
            <TablerToggle
                v-model='config.local_login_enabled'
                :disabled='!edit'
                label='Allow Username &amp; Password Login'
                description='When disabled, only administrators may sign in with a password; all other users must use Single Sign-On. The password form remains reachable at /login?local=1'
            />

            <TablerInput
                v-model='config.oauth_name'
                :disabled='!edit'
                label='Button Label'
                placeholder='Single Sign-On'
                description='Provider name shown on the login button, e.g. "Google" or "Okta"'
            />

            <TablerInput
                v-model='config.oauth_client_id'
                :disabled='!edit'
                label='Client ID'
                description='OAuth2 Client ID issued by your identity provider'
            />

            <TablerInput
                v-model='config.oauth_client_secret'
                :disabled='!edit'
                label='Client Secret'
                type='password'
                autocomplete='new-password'
                description='OAuth2 Client Secret issued by your identity provider'
            />

            <TablerInput
                v-model='config.oauth_authorize_url'
                :disabled='!edit'
                label='Authorization URL'
                placeholder='https://...'
                description='Provider endpoint users are redirected to in order to sign in'
            />

            <TablerInput
                v-model='config.oauth_token_url'
                :disabled='!edit'
                label='Token URL'
                placeholder='https://...'
                description='Provider endpoint used to exchange the authorization code for an access token'
            />

            <TablerInput
                v-model='config.oauth_userinfo_url'
                :disabled='!edit'
                label='UserInfo URL'
                placeholder='https://...'
                description='Provider endpoint returning the signed-in user profile (must include an email address)'
            />

            <TablerInput
                v-model='config.oauth_scopes'
                :disabled='!edit'
                label='Scopes'
                placeholder='openid email profile'
                description='Space separated scopes to request'
            />

            <TablerInput
                :model-value='redirectURI'
                label='Redirect URI'
                description='Register this exact URL as an allowed redirect/callback URI with your identity provider'
                disabled
            />
        </template>
    </ConfigSection>
</template>

<script setup>
import { computed } from 'vue';
import ConfigSection from './ConfigSection.vue';
import { useConfig } from './useConfig.js';
import {
    TablerInput,
    TablerToggle
} from '@tak-ps/vue-tabler';

const { isOpen, loading, edit, err, config, save, cancel } = useConfig({
    defaults: {
        oauth_enabled: false,
        local_login_enabled: true,
        oauth_name: '',
        oauth_client_id: '',
        oauth_client_secret: '',
        oauth_authorize_url: '',
        oauth_token_url: '',
        oauth_userinfo_url: '',
        oauth_scopes: '',
        frontend: ''
    },
    public: ['oauth_enabled', 'oauth_name', 'local_login_enabled', 'frontend'],
    // Frontend URL is owned by the Organisation section - only read it here
    // so the Redirect URI can be displayed
    readonly: ['frontend']
});

// The callback URL the admin must register with the identity provider
const redirectURI = computed(() => {
    const base = config.frontend || window.location.origin;
    try {
        return new URL('/login', base).toString();
    } catch {
        return `${base}/login`;
    }
});
</script>
