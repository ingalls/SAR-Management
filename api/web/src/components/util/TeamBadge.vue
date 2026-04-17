<template>
    <TablerBadge
        :background-color='team.colour_bg'
        :text-color='team.colour_txt'
        v-text='team.name'
    />
</template>

<script setup>
import { TablerBadge } from '@tak-ps/vue-tabler';

defineProps({
    team: {
        type: Object,
        required: true
    }
})
</script>
