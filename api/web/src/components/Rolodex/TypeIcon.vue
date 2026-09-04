<template>
    <IconUser
        v-if='type === "person"'
        :size='size'
        :stroke='stroke'
    />
    <IconMapPin
        v-else-if='type === "place"'
        :size='size'
        :stroke='stroke'
    />
    <IconBox
        v-else
        :size='size'
        :stroke='stroke'
    />
</template>

<script setup>
import {
    IconUser,
    IconMapPin,
    IconBox
} from '@tabler/icons-vue';

defineProps({
    type: {
        type: String,
        default: 'person'
    },
    size: {
        type: Number,
        default: 24
    },
    stroke: {
        type: Number,
        default: 1
    }
});
</script>
