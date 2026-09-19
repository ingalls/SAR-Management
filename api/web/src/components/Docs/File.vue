<template>
    <div class='card'>
        <TablerLoading v-if='loading.main' />
        <template v-else>
            <div class='card-header'>
                <div class='col d-flex align-items-center'>
                    <IconCircleArrowLeft
                        v-tooltip='"Back to Folder"'
                        class='cursor-pointer me-2'
                        :stroke='1'
                        :size='32'
                        @click='emit("close")'
                    />
                    <div>
                        <h1
                            class='card-title'
                            v-text='doc.name'
                        />
                        <div
                            class='text-muted small'
                            v-text='doc.path'
                        />
                    </div>
                    <div class='ms-auto btn-list'>
                        <IconFolderSymlink
                            v-if='manage'
                            v-tooltip='"Rename or Move File"'
                            class='cursor-pointer'
                            :stroke='1'
                            :size='32'
                            @click='move = true'
                        />
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
            <div v-else>
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

        <Move
            v-if='move'
            :doc='doc'
            @close='move = false'
            @done='move = false; emit("move", $event)'
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Move from './Move.vue';
import {
    TablerDelete,
    TablerLoading
} from '@tak-ps/vue-tabler';
import {
    IconEyeOff,
    IconDownload,
    IconFolderSymlink,
    IconCircleArrowLeft
} from '@tabler/icons-vue';

const PreviewExt = '.preview.pdf';

const props = defineProps({
    docid: {
        type: String,
        required: true
    },
    manage: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['delete', 'close', 'move']);

const loading = ref({
    main: true,
    generate: false,
    preview: true
});
const move = ref(false);
const preview = ref(null);
const doc = ref({
    id: props.docid,
    path: '/',
    name: '',
    artifacts: []
});

const is_img = computed(() => {
    const name = doc.value.name.toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].some((format) => name.endsWith(format));
});

const is_pdf = computed(() => {
    return doc.value.name.toLowerCase().endsWith('.pdf');
});

const loadPreview = () => {
    loading.value.preview = true;

    if (is_pdf.value) {
        preview.value = url(false);
    } else if (doc.value.artifacts.some((artifact) => artifact.ext === PreviewExt)) {
        preview.value = url(false, PreviewExt);
    } else {
        preview.value = null;
    }

    loading.value.preview = false;
};

const url = (download = true, artifact) => {
    const url = window.stdurl(`/api/doc/${doc.value.id}/raw`);
    url.searchParams.append('download', download);
    if (artifact) url.searchParams.append('artifact', artifact);
    url.searchParams.append('token', localStorage.token);
    return String(url);
};

const download = () => {
    window.open(url(true), '_blank');
};

const generate = async () => {
    loading.value.generate = true;

    try {
        doc.value = await window.std(`/api/doc/${doc.value.id}/convert`, {
            method: 'POST'
        });
    } finally {
        loading.value.generate = false;
    }

    loadPreview();
};

const deleteFile = async () => {
    loading.value.main = true;

    try {
        await window.std(`/api/doc/${doc.value.id}`, {
            method: 'DELETE'
        });

        emit('delete');
    } finally {
        loading.value.main = false;
    }
};

onMounted(async () => {
    try {
        doc.value = await window.std(`/api/doc/${props.docid}`);
    } catch (err) {
        emit('close');
        throw err;
    }

    loading.value.main = false;
    loadPreview();
});
</script>
