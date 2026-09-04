<template>
    <div class='card'>
        <div class='card-header py-2'>
            <h3 class='card-title'>
                Add a Comment
            </h3>
        </div>
        <div class='card-body pb-0'>
            <MDEditorShim v-model='body' />
        </div>
        <div class='card-footer d-flex'>
            <div class='ms-auto d-flex gap-2'>
                <button
                    type='button'
                    class='btn btn-outline-secondary'
                    :disabled='saving'
                    @click='create(true)'
                >
                    <IconCircleCheck
                        :size='18'
                        stroke='1.5'
                        class='me-1'
                    />
                    <span v-text='body.trim() ? "Comment & Close" : "Close Issue"' />
                </button>
                <button
                    type='button'
                    class='btn btn-primary'
                    :disabled='saving || !body.trim()'
                    @click='create(false)'
                >
                    <span
                        v-if='saving'
                        class='spinner-border spinner-border-sm me-2'
                    />
                    Comment
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { IconCircleCheck } from '@tabler/icons-vue';
import MDEditorShim from '../util/MDEditorShim.vue';

const route = useRoute();

const emit = defineEmits(['comment', 'close']);

const body = ref('');
const saving = ref(false);

const create = async (close) => {
    saving.value = true;

    try {
        if (body.value.trim()) {
            await window.std(`/api/issue/${route.params.issueid}/comment`, {
                method: 'POST',
                body: {
                    body: body.value
                }
            });

            body.value = '';
            emit('comment');
        }

        if (close) emit('close');
    } finally {
        saving.value = false;
    }
};
</script>
