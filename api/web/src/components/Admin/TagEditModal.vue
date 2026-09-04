<template>
    <TablerModal size='md'>
        <button
            type='button'
            class='btn-close'
            aria-label='Close'
            @click='emit("close")'
        />
        <div
            class='modal-status'
            :style='{ backgroundColor: edit.colour_bg }'
        />
        <div class='modal-header'>
            <h3
                class='modal-title'
                v-text='edit.id ? "Edit Tag" : "New Tag"'
            />
        </div>
        <div class='modal-body'>
            <TablerAlert
                v-if='err'
                :err='err'
            />

            <div
                class='d-flex align-items-center justify-content-center rounded border py-4 mb-3 tag-preview'
            >
                <TagBadge
                    :tag='preview'
                    :size='16'
                />
            </div>

            <TablerInput
                v-model='edit.name'
                label='Name'
                placeholder='Tag Name'
                :error='errors.name'
                autofocus
                @keyup.enter='save'
            />

            <div class='row g-2 mt-1'>
                <div class='col-6'>
                    <label class='form-label'>Background</label>
                    <input
                        v-model='edit.colour_bg'
                        type='color'
                        class='w-100 form-control form-control-color'
                        title='Background Colour'
                    >
                </div>
                <div class='col-6'>
                    <label class='form-label'>Text</label>
                    <input
                        v-model='edit.colour_txt'
                        type='color'
                        class='w-100 form-control form-control-color'
                        title='Text Colour'
                    >
                </div>
            </div>

            <div class='d-flex flex-wrap gap-1 mt-2'>
                <button
                    v-for='swatch in swatches'
                    :key='swatch.bg'
                    type='button'
                    class='btn btn-sm px-2 py-1 border'
                    :class='{ "border-primary border-2": swatch.bg === edit.colour_bg && swatch.txt === edit.colour_txt }'
                    :style='{ backgroundColor: swatch.bg, color: swatch.txt }'
                    :title='swatch.name'
                    @click='edit.colour_bg = swatch.bg; edit.colour_txt = swatch.txt'
                >
                    Aa
                </button>
            </div>

            <div class='mt-3'>
                <div class='d-flex align-items-start gap-2'>
                    <div class='flex-grow-1'>
                        <TablerUploadLogo
                            :key='iconKey'
                            :model-value='edit.icon'
                            input-id='tagLogo'
                            label='SVG Logo'
                            @update:model-value='onIcon'
                        />
                    </div>
                    <TablerIconButton
                        v-if='edit.icon'
                        class='mt-4'
                        title='Remove Logo'
                        @click='removeIcon'
                    >
                        <IconX
                            :size='20'
                            stroke='1'
                        />
                    </TablerIconButton>
                </div>
                <div
                    v-if='errors.icon'
                    class='text-danger small'
                    v-text='errors.icon'
                />
                <div
                    v-else
                    class='text-muted small'
                >
                    Optional. A square SVG works best - it is shown inline before the tag name.
                </div>
            </div>
        </div>
        <div class='modal-footer'>
            <TablerDelete
                v-if='edit.id'
                label='Delete Tag'
                @delete='remove'
            />
            <div class='ms-auto d-flex gap-2'>
                <button
                    type='button'
                    class='btn btn-link link-secondary'
                    @click='emit("close")'
                >
                    Cancel
                </button>
                <button
                    type='button'
                    class='btn btn-primary'
                    :disabled='saving'
                    @click='save'
                >
                    <span
                        v-if='saving'
                        class='spinner-border spinner-border-sm me-2'
                    />
                    <span v-text='edit.id ? "Save Tag" : "Create Tag"' />
                </button>
            </div>
        </div>
    </TablerModal>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import {
    TablerModal,
    TablerInput,
    TablerAlert,
    TablerDelete,
    TablerIconButton,
    TablerUploadLogo
} from '@tak-ps/vue-tabler';
import { IconX } from '@tabler/icons-vue';
import TagBadge from '../util/TagBadge.vue';

const props = defineProps({
    // Existing tag to edit, or a partial for a new tag
    tag: {
        type: Object,
        default: () => ({})
    },
    // API root ie: /api/mission-tag
    api: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['close', 'saved', 'deleted']);

// Tabler palette pairs that read well as badges
const swatches = [
    { name: 'Grey', bg: '#808080', txt: '#000000' },
    { name: 'Slate', bg: '#616876', txt: '#ffffff' },
    { name: 'Blue', bg: '#206bc4', txt: '#ffffff' },
    { name: 'Azure', bg: '#4299e1', txt: '#ffffff' },
    { name: 'Teal', bg: '#0ca678', txt: '#ffffff' },
    { name: 'Green', bg: '#2fb344', txt: '#ffffff' },
    { name: 'Lime', bg: '#74b816', txt: '#000000' },
    { name: 'Yellow', bg: '#f59f00', txt: '#000000' },
    { name: 'Orange', bg: '#f76707', txt: '#ffffff' },
    { name: 'Red', bg: '#d63939', txt: '#ffffff' },
    { name: 'Pink', bg: '#d6336c', txt: '#ffffff' },
    { name: 'Purple', bg: '#ae3ec9', txt: '#ffffff' },
    { name: 'Indigo', bg: '#4263eb', txt: '#ffffff' },
    { name: 'Dark', bg: '#1d273b', txt: '#ffffff' },
];

const edit = reactive({
    id: props.tag.id,
    name: props.tag.name || '',
    icon: props.tag.icon || '',
    colour_bg: props.tag.colour_bg || '#808080',
    colour_txt: props.tag.colour_txt || '#000000'
});

const errors = reactive({
    name: '',
    icon: ''
});

const err = ref(null);
const saving = ref(false);
// Bumped to remount the upload component so its native file input resets
const iconKey = ref(0);

const preview = computed(() => ({
    ...edit,
    name: edit.name || 'Tag Preview'
}));

// TablerUploadLogo accepts PNG or SVG - the API only stores SVG so
// reject anything else here rather than surfacing a server error on save
function onIcon(value) {
    errors.icon = '';
    const icon = value || '';

    if (!icon) {
        edit.icon = '';
        return;
    }

    if (!icon.startsWith('data:image/svg+xml')) {
        errors.icon = 'Logo must be an SVG file';
        removeIcon();
        return;
    }

    if (icon.length > 256 * 1024) {
        errors.icon = 'SVG must be smaller than 256KB';
        removeIcon();
        return;
    }

    edit.icon = icon;
}

function removeIcon() {
    edit.icon = '';
    iconKey.value++;
}

async function save() {
    errors.name = edit.name.trim() ? '' : 'Name is required';
    if (errors.name || errors.icon) return;

    saving.value = true;
    err.value = null;

    const body = {
        name: edit.name.trim(),
        icon: edit.icon,
        colour_bg: edit.colour_bg,
        colour_txt: edit.colour_txt
    };

    try {
        const saved = edit.id
            ? await window.std(`${props.api}/${edit.id}`, { method: 'PATCH', body })
            : await window.std(props.api, { method: 'POST', body });

        emit('saved', saved);
    } catch (error) {
        err.value = error instanceof Error ? error : new Error(String(error));
    }

    saving.value = false;
}

async function remove() {
    err.value = null;

    try {
        await window.std(`${props.api}/${edit.id}`, { method: 'DELETE' });
        emit('deleted', edit.id);
    } catch (error) {
        err.value = error instanceof Error ? error : new Error(String(error));
    }
}
</script>

<style scoped>
/* Checkerboard so light badges and transparent logos remain visible */
.tag-preview {
    background-color: var(--tblr-bg-surface-secondary);
    background-image:
        linear-gradient(45deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.05) 75%),
        linear-gradient(45deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.05) 75%);
    background-size: 16px 16px;
    background-position: 0 0, 8px 8px;
}
</style>
