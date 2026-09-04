<template>
    <ConfigSection
        v-model='isOpen'
        v-model:edit='edit'
        label='Branding'
        :loading='loading'
        :err='err'
        @save='save'
        @cancel='cancel'
    >
        <TablerInlineAlert
            class='mb-3'
            title='Server Branding'
            description='Branding is applied across the application header, the login page and the public application form.'
        />

        <TablerInput
            v-model='config.brand_title'
            :disabled='!edit'
            label='Application Title'
            placeholder='Team Management'
            description='Title shown beside the logo in the application header'
        />

        <TablerUploadLogo
            v-model='config.brand_logo'
            :disabled='!edit'
            label='Logo'
        />
        <div
            v-if='!config.brand_logo'
            class='text-muted small mb-3'
        >
            No custom logo uploaded - the built-in logo will be used
        </div>

        <TablerInput
            v-model='config.login_username_label'
            :disabled='!edit'
            label='Username Label'
            placeholder='Username or Email'
            description='Label for the username field on the login page ie: Email, Callsign, etc.'
        />

        <TablerInput
            v-model='config.login_contact'
            :disabled='!edit'
            label='Account Request Contact'
            placeholder='rescue@example.com'
            description='Email address or URL shown to visitors without an account. Leave blank to hide the "Contact Us" link'
        />

        <TablerEnum
            v-model='config.login_brand_enabled'
            :disabled='!edit'
            class='mt-3'
            label='Large Brand Logo'
            description='Show a large brand logo in the corner of the login page. "Default" only shows the logo once one is uploaded.'
            :options='[
                "default",
                "enabled",
                "disabled"
            ]'
        />

        <TablerUploadLogo
            v-if='config.login_brand_enabled !== "disabled"'
            v-model='config.login_brand_logo'
            :disabled='!edit'
            label='Large Brand Logo'
        />

        <TablerToggle
            v-model='config.login_background_enabled'
            :disabled='!edit'
            class='mt-3'
            label='Enable Custom Login Background'
        />
        <TablerInput
            v-if='config.login_background_enabled'
            v-model='config.login_background_color'
            :disabled='!edit'
            type='color'
            label='Background Colour'
        />
    </ConfigSection>
</template>

<script setup>
import ConfigSection from './ConfigSection.vue';
import { useConfig } from './useConfig.js';
import { loadBrand } from '../../../base/brand.ts';
import {
    TablerInput,
    TablerEnum,
    TablerToggle,
    TablerInlineAlert,
    TablerUploadLogo
} from '@tak-ps/vue-tabler';

const keys = [
    'brand_title',
    'brand_logo',
    'login_username_label',
    'login_contact',
    'login_brand_enabled',
    'login_brand_logo',
    'login_background_enabled',
    'login_background_color'
];

const { isOpen, loading, edit, err, config, save, cancel } = useConfig({
    defaults: {
        brand_title: '',
        brand_logo: '',
        login_username_label: '',
        login_contact: '',
        login_brand_enabled: 'default',
        login_brand_logo: '',
        login_background_enabled: false,
        login_background_color: '#023047'
    },
    public: keys,
    // Refresh the live header/login branding once saved
    onSaved: () => loadBrand(true)
});
</script>
