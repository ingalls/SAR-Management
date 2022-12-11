<template>
<div class='col-lg-12'>
    <div class="card">
        <div class="card-body">
            <div class="mb-3">
                <label class="form-label">Comment</label>
                <textarea v-model='body' type="text" class="form-control"/>
            </div>

            <div class="col-md-12">
                <div class='d-flex'>
                    <div class='ms-auto'>
                        <div class='btn-list'>
                            <a @click='create' class="cursor-pointer btn btn-outline-secondary">
                                Comment &amp; Close
                            </a>
                            <a @click='create' class="cursor-pointer btn btn-primary">
                                Comment
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <TablerError v-if='err' :err='err' @close='err = null'/>
</div>
</template>

<script>
import {
    TablerError
} from '@tak-ps/vue-tabler';

export default {
    name: 'CreateComment',
    data: function() {
        return {
            err: false,
            body: '',
        }
    },
    methods: {
        create: async function() {
            try {
                await window.std(`/api/issue/${this.$route.params.issueid}/comment`, {
                    method: 'POST',
                    body: {
                        body: this.body
                    }
                });

                this.body = '';
                this.$emit('comment');
            } catch (err) {
                this.err = err;
            }
        }
    },
    components: {
        TablerError,
    }
}
</script>
