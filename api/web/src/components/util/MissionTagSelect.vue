<template>
    <TagSelect
        v-model='tags'
        api='/api/mission-tag'
        :label='label'
        :limit='limit'
        @push='emit("push", $event)'
        @delete='emit("delete", $event)'
    />
</template>

<script setup>
import { computed } from 'vue';
import TagSelect from './TagSelect.vue';

const props = defineProps({
    modelValue: {
        type: Array,
        required: true
    },
    label: {
        type: String,
        default: 'Tags'
    },
    limit: {
        type: Number,
        default: 100
    }
})

const emit = defineEmits(['update:modelValue', 'push', 'delete'])

const tags = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});
</script>
