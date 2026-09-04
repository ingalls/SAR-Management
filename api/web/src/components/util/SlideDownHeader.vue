<template>
    <div
        class='slidedown'
        :class='{ "slidedown--expanded": expanded }'
    >
        <div
            class='slidedown__header d-flex align-items-center cursor-pointer user-select-none py-2 px-2'
            @click='toggle'
        >
            <slot name='icon' />
            <label class='subheader cursor-pointer m-0'>{{ label }}</label>

            <div class='ms-auto d-flex align-items-center'>
                <slot name='right' />
                <IconChevronDown
                    class='slidedown__chevron'
                    :class='{ "slidedown__chevron--collapsed": !expanded }'
                    :size='18'
                />
            </div>
        </div>

        <div
            class='slidedown__panel'
            :class='{ "slidedown__panel--expanded": expanded }'
        >
            <div
                class='slidedown__body'
                :style='{ overflow: overflow }'
            >
                <slot />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { IconChevronDown } from '@tabler/icons-vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    label: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['update:modelValue']);

const expanded = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
    expanded.value = val;
});

const overflow = ref('hidden');
let timeout;

watch(expanded, (val) => {
    if (timeout) clearTimeout(timeout);

    if (val) {
        timeout = setTimeout(() => {
            overflow.value = 'visible';
        }, 300);
    } else {
        overflow.value = 'hidden';
    }
});

function toggle() {
    expanded.value = !expanded.value;
    emit('update:modelValue', expanded.value);
}
</script>

<style scoped>
/*
 * Header and slide-down body are one bordered container so an expanded section
 * reads as a single block instead of two floating rows. Surfaces are translucent
 * overlays so the section sits correctly on whatever it's rendered over.
 */
.slidedown {
    --slidedown-radius: 6px;
    --slidedown-surface: rgba(15, 23, 42, 0.03);
    --slidedown-header-surface: rgba(15, 23, 42, 0.05);
    --slidedown-hover-surface: rgba(15, 23, 42, 0.04);

    /* Sections own the gap between themselves so stacked slide-downs are evenly
     * spaced no matter which parent renders them */
    margin-inline: 0.5rem;
    margin-block: 0.25rem;
    border: 1px solid transparent;
    border-radius: var(--slidedown-radius);
    transition: background-color 0.15s ease, border-color 0.15s ease;
}

[data-bs-theme='dark'] .slidedown {
    --slidedown-surface: rgba(255, 255, 255, 0.035);
    --slidedown-header-surface: rgba(255, 255, 255, 0.06);
    --slidedown-hover-surface: rgba(255, 255, 255, 0.05);
}

.slidedown--expanded {
    border-color: var(--tblr-border-color);
    background-color: var(--slidedown-surface);
}

/*
 * Inset by the container border so the header fill never overhangs the radius.
 */
.slidedown__header {
    border-radius: calc(var(--slidedown-radius) - 1px);
    border-bottom: 1px solid transparent;
    transition: background-color 0.15s ease, border-color 0.15s ease;
}

.slidedown__header:hover {
    background-color: var(--slidedown-hover-surface);
}

.slidedown--expanded .slidedown__header {
    background-color: var(--slidedown-header-surface);
    border-bottom-color: var(--tblr-border-color);
    border-end-start-radius: 0;
    border-end-end-radius: 0;
}

.slidedown__chevron {
    flex-shrink: 0;
    transition: transform 0.3s ease-out;
}

.slidedown__chevron--collapsed {
    transform: rotate(-90deg);
}

.slidedown__panel {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.3s ease-out;
}

.slidedown__panel--expanded {
    grid-template-rows: 1fr;
}

.slidedown__body {
    border-end-start-radius: calc(var(--slidedown-radius) - 1px);
    border-end-end-radius: calc(var(--slidedown-radius) - 1px);
}

.slidedown--expanded .slidedown__body {
    padding-bottom: 0.5rem;
}
</style>
