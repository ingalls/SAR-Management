<template>
    <TablerModal
        size='xl'
        :dismissable='!editable'
        @close='emit("close")'
    >
        <button
            type='button'
            class='btn-close'
            aria-label='Close'
            @click='emit("close")'
        />
        <div class='modal-header'>
            <div
                class='modal-title'
                v-text='editable ? "Set Location" : "Location"'
            />
        </div>
        <div class='modal-body pb-2'>
            <CoordinateInput
                v-model='draft'
                label=''
                :readonly='!editable'
            />
        </div>
        <div class='location-modal-map'>
            <LocationMap
                v-model='draft'
                :editable='editable'
                :search='search'
                :scroll-zoom='true'
                :camera='camera'
            />
        </div>
        <div class='modal-footer'>
            <div
                v-if='editable'
                class='text-secondary small me-auto'
            >
                Click the map to drop the pin, then drag it to fine tune
            </div>
            <template v-if='editable'>
                <button
                    type='button'
                    class='btn'
                    @click='emit("close")'
                >
                    Cancel
                </button>
                <button
                    type='button'
                    class='btn btn-primary'
                    :disabled='!changed'
                    @click='save'
                >
                    Use Location
                </button>
            </template>
            <button
                v-else
                type='button'
                class='btn ms-auto'
                @click='emit("close")'
            >
                Close
            </button>
        </div>
    </TablerModal>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { TablerModal } from '@tak-ps/vue-tabler';
import LocationMap from './LocationMap.vue';
import CoordinateInput from './CoordinateInput.vue';

const props = defineProps({
    modelValue: {
        type: Object,
        default: null
    },
    editable: {
        type: Boolean,
        default: false
    },
    search: {
        type: Boolean,
        default: false
    },
    camera: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['update:modelValue', 'close']);

const draft = ref(props.modelValue ? { type: 'Point', coordinates: [...props.modelValue.coordinates] } : null);

const changed = computed(() => {
    return JSON.stringify(draft.value?.coordinates || null) !== JSON.stringify(props.modelValue?.coordinates || null);
});

function save() {
    emit('update:modelValue', draft.value);
    emit('close');
}

function onKeydown(e) {
    if (e.key !== 'Escape') return;
    // Escape inside the search box only clears the search
    if (e.target instanceof HTMLElement && e.target.closest('.mapboxgl-ctrl-geocoder')) return;
    emit('close');
}

onMounted(() => {
    window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown);
});
</script>

<style scoped>
.location-modal-map {
    height: calc(100vh - 20rem);
    min-height: 320px;
}
</style>
