<template>
<div class='col-md-12'>
    <div class="card">
        <div class="card-body">
            <div class="mb-3">
                <MdEditor
                    :preview='false' noUploadImg noMermaid
                    :noKatex='true'
                    :toolbarsExclude='[
                        "save",
                        "prettier",
                        "mermaid"
                    ]'
                    language='en-US'
                    v-model="body"
                />
            </div>

            <div class="col-md-12">
                <div class='d-flex'>
                    <div class='ms-auto'>
                        <div class='btn-list'>
                            <a @click='create(false)' class="cursor-pointer btn btn-primary">
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

<script>
import {
    TablerInput
} from '@tak-ps/vue-tabler'
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

export default {
    name: 'CreateComment',
    data: function() {
        return {
            body: '',
        }
    },
    methods: {
        create: async function() {
            await window.std(`/api/application/${this.$route.params.applicationid}/comment`, {
                method: 'POST',
                body: {
                    body: this.body
                }
            });

            this.body = '';
            this.$emit('comment');
        }
    },
    components: {
        MdEditor,
        TablerInput
    }
}
</script>
