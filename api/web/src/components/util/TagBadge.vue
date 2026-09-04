<template>
    <TablerBadge
        class='d-inline-flex align-items-center'
        :background-color='tag.colour_bg || "#808080"'
        :text-color='tag.colour_txt || "#000000"'
    >
        <img
            v-if='tag.icon'
            :src='tag.icon'
            alt=''
            draggable='false'
            class='me-1 user-select-none'
            :style='{ height: `${size}px`, width: `${size}px` }'
        >
        <span v-text='tag.name' />
    </TablerBadge>
</template>

<script setup>
import { TablerBadge } from '@tak-ps/vue-tabler';

/**
 * Renders a Mission or Training Tag as a coloured badge with its optional
 * SVG logo - the tag equivalent of TeamBadge
 */
defineProps({
    tag: {
        type: Object,
        required: true
    },
    size: {
        type: Number,
        default: 14
    }
})
</script>
