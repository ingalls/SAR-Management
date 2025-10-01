<template>
    <TablerModal>
        <button
            type='button'
            class='btn-close'
            aria-label='Close'
            @click='close'
        />
        <div class='modal-status bg-yellow' />
        <div class='modal-header'>
            <div class='modal-title'>
                Create Folder
            </div>
        </div>
        <div class='modal-body'>
            <div class='col-12'>
                <TablerInput
                    v-model='name'
                    label='Folder Name'
                    class='w-full'
                    @keyup.enter='createFolder'
                />
            </div>
            <div class='col-12 d-flex'>
                <button
                    class='btn btn-primary mt-2 ms-auto'
                    @click='createFolder'
                >
                    Create Folder
                </button>
            </div>
        </div>
    </TablerModal>
</template>

<script setup>
import { ref } from 'vue';
import {
    TablerInput,
    TablerModal
} from '@tak-ps/vue-tabler';

const props = defineProps({
    prefix: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['close', 'done']);

const name = ref('');

const close = () => {
    emit('close');
};

const createFolder = async () => {
    if (name.value.includes('.')) throw new Error('Name cannot contain "."');
    if (name.value.includes('/')) throw new Error('Name cannot contain "/"');

    const url = window.stdurl('/api/doc/folder');
    url.searchParams.append('prefix', props.prefix + name.value + '/');

    await window.std(url, {
        method: 'POST'
    });

    emit('done');
};
</script>
