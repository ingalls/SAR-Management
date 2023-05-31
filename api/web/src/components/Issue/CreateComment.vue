<template>
<div class='col-md-9'>
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
}
</script>
