<template>
    <div>
        <CoordinateInput
            v-if='!disabled'
            class='mb-2'
            :model-value='modelValue'
            :required='required'
            :invalid='!!error'
            @update:model-value='emit("update:modelValue", $event)'
        />

        <div
            class='location-inline-map'
            :class='{ "location-inline-map-invalid": error }'
        >
            <LocationMap
                ref='inline'
                :model-value='modelValue'
                :editable='!disabled'
                :search='search'
                :expandable='true'
                @update:model-value='emit("update:modelValue", $event)'
                @expand='expand'
            />
        </div>

        <div
            v-if='error'
            class='invalid-feedback d-block'
            v-text='error'
        />
        <small
            v-if='!disabled'
            class='form-hint mt-1'
        >Click the map to drop the pin and drag it to fine tune. Hold ctrl or ⌘ while scrolling to zoom, or open the large map.</small>
        <div
            v-else-if='modelValue'
            class='p-2'
        >
            <CoordinateInput
                :model-value='modelValue'
                label=''
                :readonly='true'
            />
        </div>

        <LocationModal
            v-if='expanded'
            :model-value='modelValue'
            :editable='!disabled'
            :search='true'
            :camera='camera'
            @update:model-value='emit("update:modelValue", $event)'
            @close='expanded = false'
        />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import LocationMap from '../Location/LocationMap.vue';
import LocationModal from '../Location/LocationModal.vue';
import CoordinateInput from '../Location/CoordinateInput.vue';

defineProps({
    modelValue: {
        type: Object,
        default: null
    },
    search: {
        type: Boolean,
        default: true
    },
    disabled: {
        type: Boolean,
        default: true
    },
    required: {
        type: Boolean,
        default: false
    },
    error: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:modelValue']);

const inline = ref(null);
const expanded = ref(false);
const camera = ref(null);

function expand() {
    camera.value = inline.value ? inline.value.getCamera() : null;
    expanded.value = true;
}
</script>

<style scoped>
.location-inline-map {
    height: 350px;
}

.location-inline-map-invalid {
    outline: 2px solid var(--tblr-danger);
    outline-offset: 1px;
}
</style>
