<template>
    <ConfigSection
        v-model='isOpen'
        v-model:edit='edit'
        label='Slack Integration'
        :loading='loading'
        :err='err'
        @save='save'
        @cancel='cancel'
    >
        <TablerToggle
            v-model='config.slack_enabled'
            :disabled='!edit'
            label='Enable Slack Integration'
            description='Enable integration with Slack for notifications and channel management'
        />

        <template v-if='config.slack_enabled'>
            <TablerInput
                v-model='config.slack_app_id'
                :disabled='!edit'
                label='App ID'
                description='Slack App ID from your Slack app configuration'
            />

            <TablerInput
                v-model='config.slack_token'
                :disabled='!edit'
                label='Access Token'
                type='password'
                autocomplete='new-password'
                description='Bot User OAuth Token for Slack API access'
            />

            <TablerInput
                v-model='config.slack_refresh'
                :disabled='!edit'
                label='Refresh Token'
                type='password'
                autocomplete='new-password'
                description='OAuth refresh token for maintaining Slack connection'
            />
        </template>
    </ConfigSection>
</template>

<script setup>
import ConfigSection from './ConfigSection.vue';
import { useConfig } from './useConfig.js';
import {
    TablerInput,
    TablerToggle
} from '@tak-ps/vue-tabler';

const { isOpen, loading, edit, err, config, save, cancel } = useConfig({
    defaults: {
        slack_enabled: false,
        slack_app_id: '',
        slack_token: '',
        slack_refresh: ''
    }
});
</script>
