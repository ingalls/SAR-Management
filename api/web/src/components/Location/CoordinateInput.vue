<template>
    <div>
        <label
            v-if='label'
            class='form-label'
            :for='id'
        >
            <span v-text='label' />
            <span
                v-if='required'
                class='text-red mx-1'
            >*</span>
        </label>
        <div class='coordinate-row'>
            <div class='input-group coordinate-text'>
                <span class='input-group-text'>
                    <IconMapPin
                        :size='20'
                        stroke='1.5'
                    />
                </span>
                <input
                    :id='id'
                    v-model='text'
                    type='text'
                    class='form-control'
                    :class='{ "is-invalid": error || invalid }'
                    :readonly='readonly'
                    :placeholder='readonly ? "No coordinates" : `eg: ${example}`'
                    autocomplete='off'
                    spellcheck='false'
                    @keydown.enter.prevent='commit'
                    @blur='commit'
                    @paste='onPaste'
                >
            </div>
            <select
                v-model='format'
                class='form-select coordinate-format'
                aria-label='Coordinate format'
            >
                <option
                    v-for='option in CoordFormats'
                    :key='option.value'
                    :value='option.value'
                    v-text='option.label'
                />
            </select>
            <button
                v-if='!readonly'
                v-tooltip='"Use my current location"'
                type='button'
                class='btn btn-icon'
                aria-label='Use my current location'
                :disabled='locating'
                @click='locate'
            >
                <span
                    v-if='locating'
                    class='spinner-border spinner-border-sm'
                />
                <IconCurrentLocation
                    v-else
                    :size='20'
                    stroke='1.5'
                />
            </button>
            <button
                v-if='lnglat'
                v-tooltip='copied ? "Copied" : "Copy coordinates"'
                type='button'
                class='btn btn-icon'
                aria-label='Copy coordinates'
                @click='copy'
            >
                <IconCheck
                    v-if='copied'
                    :size='20'
                    stroke='1.5'
                />
                <IconCopy
                    v-else
                    :size='20'
                    stroke='1.5'
                />
            </button>
            <a
                v-if='readonly && lnglat'
                v-tooltip='"Open in Google Maps"'
                class='btn btn-icon'
                aria-label='Open in Google Maps'
                target='_blank'
                rel='noopener'
                :href='`https://www.google.com/maps/search/?api=1&query=${lnglat[1]},${lnglat[0]}`'
            >
                <IconExternalLink
                    :size='20'
                    stroke='1.5'
                />
            </a>
            <button
                v-if='!readonly && lnglat'
                v-tooltip='"Clear location"'
                type='button'
                class='btn btn-icon'
                aria-label='Clear location'
                @click='clear'
            >
                <IconX
                    :size='20'
                    stroke='1.5'
                />
            </button>
        </div>
        <div
            v-if='error'
            class='invalid-feedback d-block'
            v-text='error'
        />
        <small
            v-else-if='!readonly'
            class='form-hint mt-1'
        >Latitude, longitude in decimal degrees, degrees &amp; minutes or DMS, or a UTM position such as 13S 458680E 4329759N</small>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue';
import {
    IconX,
    IconCopy,
    IconCheck,
    IconMapPin,
    IconExternalLink,
    IconCurrentLocation
} from '@tabler/icons-vue';
import { CoordFormats, parseCoordinates, formatCoordinates } from './coords.ts';

const props = defineProps({
    modelValue: {
        type: Object,
        default: null
    },
    label: {
        type: String,
        default: 'Coordinates'
    },
    readonly: {
        type: Boolean,
        default: false
    },
    required: {
        type: Boolean,
        default: false
    },
    // Highlight the input for an error that is reported by the parent
    invalid: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue']);

const id = 'coordinates-' + Math.random().toString(36).slice(2, 10);

const format = ref(storedFormat());
const text = ref('');
const error = ref('');
const locating = ref(false);
const copied = ref(false);
let copiedTimer = null;

const lnglat = computed(() => {
    const geometry = props.modelValue;
    if (!geometry || !Array.isArray(geometry.coordinates)) return null;
    const [lng, lat] = geometry.coordinates;
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
    return [lng, lat];
});

const example = computed(() => {
    return CoordFormats.find((option) => option.value === format.value).example;
});

function storedFormat() {
    try {
        const stored = localStorage.getItem('location-coord-format');
        if (CoordFormats.some((option) => option.value === stored)) return stored;
    } catch {
        // Storage is unavailable in private windows
    }

    return 'dd';
}

function render() {
    error.value = '';
    text.value = lnglat.value ? formatCoordinates(lnglat.value, format.value) : '';
}

function set(coordinates) {
    emit('update:modelValue', { type: 'Point', coordinates });
}

function commit() {
    if (props.readonly) return;

    const value = text.value.trim();

    if (!value) {
        error.value = '';
        if (lnglat.value) emit('update:modelValue', null);
        return;
    }

    if (lnglat.value && value === formatCoordinates(lnglat.value, format.value)) {
        error.value = '';
        return;
    }

    const parsed = parseCoordinates(value);
    if (!parsed) {
        error.value = 'Coordinates not recognised, try 39.11601, -105.47796 or 13S 458680E 4329759N';
        return;
    }

    error.value = '';
    set(parsed);
}

function onPaste() {
    nextTick(commit);
}

function clear() {
    text.value = '';
    error.value = '';
    emit('update:modelValue', null);
}

function locate() {
    if (!navigator.geolocation) {
        error.value = 'This browser cannot share its location';
        return;
    }

    locating.value = true;
    navigator.geolocation.getCurrentPosition((position) => {
        locating.value = false;
        error.value = '';
        set([
            Math.round(position.coords.longitude * 1e6) / 1e6,
            Math.round(position.coords.latitude * 1e6) / 1e6
        ]);
    }, (err) => {
        locating.value = false;
        error.value = err.code === err.PERMISSION_DENIED
            ? 'Location permission was denied'
            : 'Your location could not be determined';
    }, {
        enableHighAccuracy: true,
        timeout: 15000
    });
}

async function copy() {
    try {
        await navigator.clipboard.writeText(formatCoordinates(lnglat.value, format.value));
        copied.value = true;
        clearTimeout(copiedTimer);
        copiedTimer = setTimeout(() => { copied.value = false; }, 1500);
    } catch {
        error.value = 'Could not copy to the clipboard';
    }
}

watch(() => props.modelValue, render, { immediate: true });

watch(format, () => {
    try {
        localStorage.setItem('location-coord-format', format.value);
    } catch {
        // Storage is unavailable in private windows
    }

    render();
});

onBeforeUnmount(() => {
    clearTimeout(copiedTimer);
});
</script>

<style scoped>
.coordinate-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.coordinate-text {
    flex: 1 1 16rem;
    width: auto;
}

.coordinate-format {
    flex: 0 0 auto;
    width: auto;
}
</style>
