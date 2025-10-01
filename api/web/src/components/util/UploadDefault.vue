<template>
    <div class='card-body'>
        <div
            class='row'
            :class='{ "d-none": progress !== 0 }'
        >
            <div
                class='col-12 d-flex justify-content-center mb-3'
                v-text='label'
            />
            <div class='col-12 d-flex justify-content-center'>
                <div class='btn-list'>
                    <button
                        v-if='cancel'
                        class='btn btn-secondary'
                        @click='$emit("cancel")'
                    >
                        Cancel
                    </button>
                    <button
                        class='btn btn-primary'
                        @click='$refs.fileInput.click()'
                    >
                        Upload
                    </button>
                </div>
            </div>
            <form>
                <input
                    id='file'
                    ref='fileInput'
                    class='d-none'
                    type='file'
                    name='file'
                    :accept='mimetype'
                    @change='upload'
                >
            </form>
        </div>
        <div
            v-if='progress && progress < 101'
            class='row'
        >
            <TablerLoading :desc='`Uploading ${name}`' />
            <TablerProgress :percent='progress / 100' />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import {
    TablerLoading,
    TablerProgress
} from '@tak-ps/vue-tabler';

const props = defineProps({
    url: {
        type: [String, URL],
        required: true
    },
    cancel: {
        type: Boolean,
        default: true
    },
    headers: {
        type: Object,
        default: () => ({})
    },
    label: {
        type: String,
        default: 'Select a file to upload'
    },
    mimetype: {
        type: String,
        default: '*'
    }
});

const emit = defineEmits(['cancel', 'done']);

const name = ref('');
const progress = ref(0);
const fileInput = ref(null);

const refresh = () => {
    name.value = '';
    progress.value = 0;
    const input = fileInput.value;
    input.type = 'text';
    input.type = 'file';
};

const upload = (event) => {
    return new Promise((resolve, reject) => {
        const file = event.target.files[0];
        name.value = file.name;

        const xhr = new XMLHttpRequest()
        const formData = new FormData()

        xhr.open('POST', props.url, true)
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        for (const header of Object.keys(props.headers)) {
            xhr.setRequestHeader(header, props.headers[header]);
        }

        xhr.upload.addEventListener('progress', (e) => {
            progress.value = (e.loaded * 100.0 / e.total) || 100
        });

        xhr.addEventListener('readystatechange', () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                progress.value = 100;
            } else if (xhr.readyState == 4 && xhr.status != 200) {
                return reject(new Error('Failed to upload file'));
            }

            progress.value = 101;

            if (!xhr.response) return;
            emit('done', JSON.parse(xhr.response));
        });

        formData.append('file', file)
        xhr.send(formData)
    });
};

defineExpose({
    refresh
});
</script>
