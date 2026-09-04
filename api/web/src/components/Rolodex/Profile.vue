<template>
    <div>
        <template v-if='none'>
            <div />
        </template>
        <div
            v-else-if='!rolodex.photo'
            class='d-flex align-items-center justify-content-center bg-secondary-lt rounded'
            :style='`width: 100%; height: ${height}px;`'
        >
            <TypeIcon
                :type='rolodex.type'
                :size='Math.min(96, height / 2)'
                :stroke='1'
            />
        </div>
        <div
            v-else
            class='rounded'
            :style='`background-image: url(${base}/api/rolodex/${rolodex.id}/profile?size=${size}&token=${token}&cache=${cache}); width: 100%; height: ${height}px; background-size: ${bgstyle}; background-position: center; background-repeat: no-repeat;`'
        />
    </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import TypeIcon from './TypeIcon.vue';

const props = defineProps({
    rolodex: {
        type: Object,
        required: true
    },
    cache: {
        type: Number,
        default: +new Date()
    },
    size: {
        type: String,
        default: 'full'
    },
    height: {
        type: Number,
        default: 400
    },
    bgstyle: {
        type: String,
        default: 'cover'
    }
});

const none = ref(false);
const token = ref(localStorage.token);
const base = ref(window.stdurl('/').origin);

watch(() => props.cache, () => {
    none.value = true;
    nextTick(() => { none.value = false; });
});
</script>
