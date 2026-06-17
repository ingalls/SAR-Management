<template>
    <TablerModal
        v-if='show'
        @close='$emit("close")'
    >
        <div class='modal-status bg-primary' />
        <div class='modal-header'>
            <h5 class='modal-title'>
                Add Agency Association
            </h5>
            <button
                type='button'
                class='btn-close'
                aria-label='Close'
                @click='$emit("close")'
            />
        </div>
        <div class='modal-body'>
            <div class='mb-3'>
                <TablerSelect
                    v-model='form.agency_id'
                    label='Select Agency'
                    :options='availableAgencies'
                    placeholder='Choose an agency...'
                />
            </div>
            <div class='mb-3'>
                <TablerEnum
                    v-model='form.access'
                    label='Access Level'
                    :options='["user", "admin"]'
                />
            </div>
        </div>
        <div class='modal-footer'>
            <button
                type='button'
                class='btn btn-secondary'
                @click='$emit("close")'
            >
                Cancel
            </button>
            <button
                type='button'
                class='btn btn-primary'
                :disabled='!form.agency_id || loading'
                @click='submit'
            >
                <span
                    v-if='loading'
                    class='spinner-border spinner-border-sm me-2'
                />
                Add Association
            </button>
        </div>
    </TablerModal>
</template>

<script setup>
import { reactive, ref } from 'vue';
import {
    TablerModal,
    TablerSelect,
    TablerEnum
} from '@tak-ps/vue-tabler';

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    userId: {
        type: Number,
        required: true
    },
    availableAgencies: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['close', 'added']);

const loading = ref(false);
const form = reactive({
    agency_id: null,
    access: 'user'
});

async function submit() {
    if (!form.agency_id) return;
    
    loading.value = true;
    try {
        await window.std(`/api/user/${props.userId}/agency`, {
            method: 'POST',
            body: {
                agency_id: form.agency_id,
                access: form.access
            }
        });
        
        // Reset form
        form.agency_id = null;
        form.access = 'user';
        
        emit('added');
        emit('close');
    } catch (err) {
        console.error('Failed to add agency association:', err);
        alert(err.message || 'Failed to add agency association');
    } finally {
        loading.value = false;
    }
}
</script>
