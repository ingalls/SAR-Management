<template>
    <span
        class='badge'
        :class='`bg-${meta.colour}-lt`'
        :title='meta.description'
        v-text='meta.label'
    />
</template>

<script setup>
import { computed } from 'vue';
import { statusMeta } from './status.ts';

const props = defineProps({
    status: {
        type: String,
        required: true
    }
});

const meta = computed(() => statusMeta(props.status));
</script>
