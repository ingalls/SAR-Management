<template>
    <TablerModal size='xl'>
        <button
            type='button'
            class='btn-close'
            aria-label='Close'
            @click='emit("close")'
        />
        <div class='modal-status bg-primary' />
        <div class='modal-header'>
            <div class='modal-title'>
                Widget Explorer
            </div>
        </div>
        <div class='modal-body'>
            <div class='row g-2 mb-3 align-items-center'>
                <div class='col-md-6'>
                    <TablerInput
                        v-model='filter'
                        placeholder='Search widgets...'
                        icon='search'
                        autofocus
                    />
                </div>
                <div class='col-md-6'>
                    <div
                        class='btn-group w-100'
                        role='group'
                    >
                        <button
                            v-for='cat in categories'
                            :key='cat'
                            type='button'
                            class='btn btn-sm'
                            :class='category === cat ? "btn-primary" : "btn-outline-secondary"'
                            @click='category = cat'
                            v-text='cat'
                        />
                    </div>
                </div>
            </div>

            <TablerNone
                v-if='!filtered.length'
                :create='false'
                label='Matching Widgets'
            />
            <div
                v-else
                class='row g-3'
            >
                <div
                    v-for='widget in filtered'
                    :key='widget.name'
                    class='col-sm-6 col-lg-4'
                >
                    <div
                        class='card h-100 widget-explorer-card'
                        :class='{ "widget-explorer-card--added": isAdded(widget) }'
                    >
                        <div class='card-body d-flex flex-column'>
                            <div class='d-flex align-items-center mb-2'>
                                <span class='avatar avatar-md bg-primary-lt me-3'>
                                    <component
                                        :is='widget.icon'
                                        :size='28'
                                        stroke='1.5'
                                    />
                                </span>
                                <div>
                                    <h3
                                        class='card-title mb-0'
                                        v-text='widget.label'
                                    />
                                    <small
                                        class='text-muted'
                                        v-text='widget.category'
                                    />
                                </div>
                            </div>
                            <p
                                class='text-muted flex-fill mb-3'
                                v-text='widget.description'
                            />
                            <button
                                v-if='isAdded(widget)'
                                class='btn btn-outline-success w-100'
                                disabled
                            >
                                <IconCheck
                                    class='me-1'
                                    :size='18'
                                    :stroke='1.5'
                                />
                                Added
                            </button>
                            <button
                                v-else
                                class='btn btn-primary w-100'
                                :disabled='adding === widget.name'
                                @click='add(widget)'
                            >
                                <span
                                    v-if='adding === widget.name'
                                    class='spinner-border spinner-border-sm me-1'
                                    role='status'
                                />
                                <IconPlus
                                    v-else
                                    class='me-1'
                                    :size='18'
                                    :stroke='1.5'
                                />
                                Add Widget
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </TablerModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import {
    TablerModal,
    TablerInput,
    TablerNone
} from '@tak-ps/vue-tabler';
import {
    IconPlus,
    IconCheck
} from '@tabler/icons-vue';
import widgets from './widgets.js';

const props = defineProps({
    // Names of widgets already present on the dashboard
    added: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['add', 'close']);

const filter = ref('');
const category = ref('All');
const adding = ref(null);

const categories = computed(() => {
    return ['All', ...new Set(widgets.map((w) => w.category))];
});

const filtered = computed(() => {
    const term = filter.value.trim().toLowerCase();

    return widgets.filter((w) => {
        if (category.value !== 'All' && w.category !== category.value) return false;
        if (!term) return true;

        return w.label.toLowerCase().includes(term)
            || w.description.toLowerCase().includes(term)
            || w.category.toLowerCase().includes(term);
    });
});

const isAdded = (widget) => props.added.includes(widget.name);

// The parent performs the API call; once the widget shows up in `added`
// (or the list otherwise changes) the pending state is cleared.
watch(() => props.added, () => {
    adding.value = null;
});

const add = (widget) => {
    adding.value = widget.name;
    emit('add', widget);
};
</script>

<style scoped>
.widget-explorer-card {
    transition: transform 0.15s, border-color 0.15s;
}
.widget-explorer-card:not(.widget-explorer-card--added):hover {
    transform: translateY(-3px);
    border-color: var(--tblr-primary);
}
.widget-explorer-card--added {
    opacity: 0.7;
}
</style>
