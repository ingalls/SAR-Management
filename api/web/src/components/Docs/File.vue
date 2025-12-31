<template>
    <div class='card'>
        <TablerLoading v-if='loading.main' />
        <template v-else>
            <div class='card-header'>
                <div class='col d-flex'>
                    <h1
                        class='card-title'
                        v-text='file'
                    />
                    <div class='ms-auto btn-list'>
                        <TablerDelete
                            v-if='manage'
                            v-tooltip='"Delete File"'
                            displaytype='icon'
                            @delete='deleteFile'
                        />
                        <IconDownload
                            v-tooltip='"Download File"'
                            class='cursor-pointer'
                            :stroke='1'
                            :size='32'
                            @click='download'
                        />
                    </div>
                </div>
            </div>
            <div v-if='is_img'>
                <img :src='url(false)'>
            </div>
            <div v-else-if='loading.preview'>
                <TablerLoading desc='Loading Preview' />
            </div>
            <div v-else-if='is_pdf || preview'>
                <embed
                    :src='preview'
                    width='100%'
                    height='1000px'
                >
            </div>
            <div v-else-if='preview === null'>
                <div class='d-flex justify-content-center mt-4 mb-2'>
                    <IconEyeOff
                        :size='48'
                        :stroke='1'
                    />
                </div>

                <div class='text-center mb-4 mt-2'>
                    <div>Unsupported Preview Format</div>
                </div>

                <div
                    v-if='manage'
                    class='d-flex justify-content-center my-4'
                >
                    <TablerLoading
                        v-if='loading.generate'
                        desc='Generating Preview'
                    />
                    <div
                        v-else
                        class='btn btn-secondary'
                        @click='generate'
                    >
                        Generate PDF
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
    TablerDelete,
    TablerLoading
} from '@tak-ps/vue-tabler';
import {
    IconEyeOff,
    IconDownload
} from '@tabler/icons-vue';

const props = defineProps({
    prefix: {
        type: String,
        required: true
    },
    manage: {
        type: Boolean,
        default: false
    },
    file: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['delete']);

const loading = ref({
    main: false,
    generate: false,
    preview: true
});
const preview = ref(null);

const is_img = computed(() => {
    for (const format of ['.jpg', '.jpeg', 'png', '.webp']) {
        if (props.file.endsWith(format)) return true;
    }
    return false;
});

const is_pdf = computed(() => {
    return props.file.endsWith('.pdf')
});

const loadPreview = async () => {
    loading.value.preview = true;

    if (is_pdf.value) {
        preview.value = url(false);
        loading.value.preview = false;
        return;
    }

    const req_url = window.stdurl('/api/doc');
    req_url.searchParams.append('prefix', props.prefix + props.file + '/');
    const res = await window.std(req_url)

    for (const doc of res.items) {
        if (doc.key === 'preview.pdf') {
            const dl_url = window.stdurl('/api/doc/download');
            dl_url.searchParams.append('prefix', props.prefix + props.file);
            dl_url.searchParams.append('file', 'preview.pdf');
            dl_url.searchParams.append('download', 'false');
            dl_url.searchParams.append('token', localStorage.token);
            preview.value = String(dl_url);
            break;
        }
    }

    loading.value.preview = false;
};

const url = (download = true) => {
    const url = window.stdurl('/api/doc/download');
    url.searchParams.append('prefix', props.prefix);
    url.searchParams.append('file', props.file);
    url.searchParams.append('download', download);
    url.searchParams.append('token', localStorage.token);
    return String(url);
};

const download = () => {
    window.open(url(true), '_blank');
};

const generate = async () => {
    loading.value.generate = true;
    const url = window.stdurl('/api/doc/convert');
    url.searchParams.append('prefix', props.prefix);
    url.searchParams.append('file', props.file);
    await window.std(url);
    loading.value.generate = false;

    await loadPreview();
};

const deleteFile = async () => {
    loading.value.main = true;
    const url = window.stdurl('/api/doc');
    url.searchParams.append('file', props.prefix + props.file);
    await window.std(url, {
        method: 'DELETE'
    });

    loading.value.main = false;
    emit('delete');
};

onMounted(async () => {
    await loadPreview();
});
</script>
