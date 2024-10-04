<template>
    <div class='col-md-12'>
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

<script>
import {
    TablerInput
} from '@tak-ps/vue-tabler'
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

export default {
    name: 'CreateComment',
    components: {
        MdEditor,
        TablerInput
    },
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
    }
}
</script>
