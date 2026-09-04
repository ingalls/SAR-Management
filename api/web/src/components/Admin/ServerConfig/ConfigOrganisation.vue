<template>
    <ConfigSection
        v-model='isOpen'
        v-model:edit='edit'
        label='Organisation'
        :loading='loading'
        :err='err'
        @save='save'
        @cancel='cancel'
    >
        <TablerInput
            v-model='config.name'
            :disabled='!edit'
            label='Organisation Name'
            placeholder='Search & Rescue'
            description='Public display name for your organisation, shown in the application header and outgoing emails'
        />

        <TablerInput
            v-model='config.frontend'
            :disabled='!edit'
            label='Frontend URL'
            placeholder='https://team.example.com'
            description='Public URL where users access the application'
        />

        <TablerTimeZone
            v-model='config.timezone'
            :disabled='!edit'
            label='Default Timezone'
            description='Default timezone for new users and system operations'
        />
    </ConfigSection>
</template>

<script setup>
import ConfigSection from './ConfigSection.vue';
import { useConfig } from './useConfig.js';
import { loadBrand } from '../../../base/brand.ts';
import {
    TablerInput,
    TablerTimeZone
} from '@tak-ps/vue-tabler';

const { isOpen, loading, edit, err, config, save, cancel } = useConfig({
    defaults: {
        name: '',
        frontend: '',
        timezone: ''
    },
    public: ['name', 'frontend'],
    // The organisation name is part of the header branding
    onSaved: () => loadBrand(true)
});
</script>
