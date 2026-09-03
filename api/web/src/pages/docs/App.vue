<template>
    <ApiReference :configuration='configuration' />
</template>

<script setup lang='ts'>
import { ApiReference } from '@scalar/api-reference';
import '@scalar/api-reference/style.css';

const configuration = {
    url: String(new URL('/api/openapi', window.location.origin)),
    hideDarkModeToggle: false,
    showSidebar: true,
    hideClientButton: true,
    metaData: {
        title: 'SAR Management',
    },
};
</script>
