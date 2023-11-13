<template>
<div class='col-md-9'>
    <div class="card">
        <div class="card-body">
            <div class="mb-3">
                <TablerInput label='Comment' v-model='body' rows='2'/>
            </div>

            <div class="col-md-12">
                <div class='d-flex'>
                    <div class='ms-auto'>
                        <div class='btn-list'>
                            <a @click='create(true)' class="cursor-pointer btn btn-outline-secondary">
                                Comment &amp; Close
                            </a>
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

export default {
    name: 'CreateComment',
    data: function() {
        return {
            body: '',
        }
    },
    methods: {
        create: async function(close) {
            await window.std(`/api/issue/${this.$route.params.issueid}/comment`, {
                method: 'POST',
                body: {
                    body: this.body
                }
            });

            this.body = '';
            this.$emit('comment');
            if (close) this.$emit('close');
        }
    },
    components: {
        TablerInput
    }
}
</script>
