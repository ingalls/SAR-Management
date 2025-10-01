<template>
    <div class='col-md-9'>
        <div class='card'>
            <div class='card-body'>
                <div class='mb-3'>
                    <MdEditor
                        v-model='body'
                        :preview='false'
                        no-upload-img
                        no-mermaid
                        :no-katex='true'
                        :toolbars-exclude='[
                            "save",
                            "prettier",
                            "mermaid"
                        ]'
                        language='en-US'
                    />
                </div>

                <div class='col-md-12'>
                    <div class='d-flex'>
                        <div class='ms-auto'>
                            <div class='btn-list'>
                                <a
                                    class='cursor-pointer btn btn-outline-secondary'
                                    @click='create(true)'
                                >
                                    Comment &amp; Close
                                </a>
                                <a
                                    class='cursor-pointer btn btn-primary'
                                    @click='create(false)'
                                >
                                    Comment
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

const route = useRoute();

const emit = defineEmits(['comment', 'close']);

const body = ref('');

const create = async (close) => {
    await window.std(`/api/issue/${route.params.issueid}/comment`, {
        method: 'POST',
        body: {
            body: body.value
        }
    });

    body.value = '';
    emit('comment');
    if (close) emit('close');
};
</script>
