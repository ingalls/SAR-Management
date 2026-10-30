<template>
    <div
        v-if='!tags.length'
        class='text-muted'
        v-text='empty'
    />
    <div
        v-else
        class='divide-y'
    >
        <div
            v-for='tag in tags'
            :key='tag.id'
            class='py-2'
        >
            <div class='d-flex align-items-center mb-1'>
                <TagBadge :tag='tag' />
                <div class='ms-auto text-muted small'>
                    <span v-text='tag.count' />
                    {{ tag.count === 1 ? 'event' : 'events' }}
                    &middot;
                    <span v-text='tag.hours' />
                    personnel hours
                </div>
            </div>
            <div
                class='progress'
                style='height: 6px'
            >
                <div
                    class='progress-bar bg-primary'
                    role='progressbar'
                    :style='{ width: `${(tag.count / max) * 100}%` }'
                    :aria-valuenow='tag.count'
                    aria-valuemin='0'
                    :aria-valuemax='max'
                    :title='`${tag.name}: ${tag.count}`'
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import TagBadge from '../util/TagBadge.vue';

const props = defineProps({
    tags: {
        type: Array,
        required: true
    },
    empty: {
        type: String,
        default: 'No tagged events in this period'
    }
});

const max = computed(() => {
    return Math.max(1, ...props.tags.map((tag) => tag.count));
});
</script>
