<template>
    <TablerModal>
        <button
            type='button'
            class='btn-close'
            aria-label='Close'
            @click='emit("close")'
        />
        <div class='modal-status bg-yellow' />
        <div class='modal-header'>
            <div
                class='modal-title'
                v-text='doc.type === "dir" ? "Rename or Move Folder" : "Rename or Move File"'
            />
        </div>
        <div class='modal-body'>
            <TablerLoading v-if='loading' />
            <template v-else>
                <div class='col-12'>
                    <TablerInput
                        v-model='name'
                        label='Name'
                        class='w-full'
                        @keyup.enter='save'
                    />
                </div>
                <div class='col-12 mt-2'>
                    <TablerEnum
                        v-model='path'
                        label='Folder'
                        :options='folders'
                    />
                </div>
                <div class='col-12 d-flex'>
                    <button
                        class='btn btn-primary mt-3 ms-auto'
                        @click='save'
                    >
                        Save
                    </button>
                </div>
            </template>
        </div>
    </TablerModal>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
    TablerEnum,
    TablerInput,
    TablerModal,
    TablerLoading
} from '@tak-ps/vue-tabler';

const props = defineProps({
    doc: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['close', 'done']);

const loading = ref(true);
const name = ref(props.doc.name);
const path = ref(props.doc.path);
const folders = ref(['/']);

const save = async () => {
    if (!name.value.trim()) throw new Error('Name cannot be empty');
    if (name.value.includes('/')) throw new Error('Name cannot contain "/"');

    loading.value = true;

    try {
        const doc = await window.std(`/api/doc/${props.doc.id}`, {
            method: 'PATCH',
            body: {
                name: name.value,
                path: path.value
            }
        });

        emit('done', doc);
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    const found = ['/'];

    try {
        let page = 0;
        let total = 0;

        do {
            const url = window.stdurl('/api/doc');
            url.searchParams.append('type', 'dir');
            url.searchParams.append('recursive', 'true');
            url.searchParams.append('limit', '1000');
            url.searchParams.append('page', String(page++));

            const list = await window.std(url);
            total = list.total;
            found.push(...list.items.map((dir) => `${dir.path}${dir.name}/`));

            if (!list.items.length) break;
        } while (found.length - 1 < total);

        // A folder cannot be moved inside of itself
        const self = props.doc.type === 'dir' ? `${props.doc.path}${props.doc.name}/` : null;

        folders.value = found
            .filter((folder) => !self || !folder.startsWith(self))
            .sort((a, b) => a.localeCompare(b));
    } finally {
        loading.value = false;
    }
});
</script>
