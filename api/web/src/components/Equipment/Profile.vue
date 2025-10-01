<template>
    <div>
        <template v-if='none'>
            <div />
        </template>
        <template v-else-if='bgstyle === "contain"'>
            <div
                :style='`background-image: url(${base}/api/equipment/${equipmentid}/profile?token=${token}&cache=${cache});`'
                style='width: 100%; height: 400px; background-size: contain; background-repeat: no-repeat'
            />
        </template>
        <template v-else>
            <div
                :style='`background-image: url(${base}/api/equipment/${equipmentid}/profile?token=${token}&cache=${cache});`'
                style='width: 100%; height: 400px; background-size: cover; background-position: center;'
            />
        </template>
    </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
    equipmentid: Number,
    cache: {
        type: Number,
        default: +new Date()
    },
    bgstyle: {
        type: String,
        default: 'contain'
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
