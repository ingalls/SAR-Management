<template>
    <div class='col-md-12'>
        <div class='card'>
            <div class='card-body'>
                <div class='mb-3'>
                    <MDEditorShim v-model='body' />
                </div>

                <div class='col-md-12'>
                    <div class='d-flex'>
                        <div class='ms-auto'>
                            <div class='btn-list'>
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
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import MDEditorShim from '../util/MDEditorShim.vue';

const route = useRoute()
const emit = defineEmits(['comment'])

const body = ref('')

const create = async () => {
    await window.std(`/api/application/${route.params.applicationid}/comment`, {
        method: 'POST',
        body: {
            body: body.value
        }
    });

    body.value = '';
    emit('comment');
}
</script>
