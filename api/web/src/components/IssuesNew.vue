<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a @click='$router.push("/")' class="cursor-pointer">Home</a></li>
                            <li class="breadcrumb-item" aria-current="page"><a  @click='$router.push("/issue")' class="cursor-pointer">Issues</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="#">New</a></li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div class="col-lg-12">
                    <div class="card">
                        <div class="card-body">
                            <div class='row row-cards'>
                                <div class="col-md-10">
                                    <label class="form-label">Issue Title</label>
                                    <input v-model='title' type="text" :class='{
                                        "is-invalid": errors.title
                                    }' class="form-control" placeholder="Issue Title">
                                    <div v-if='errors.title' v-text='errors.title' class="invalid-feedback"></div>
                                </div>
                                <div class="col-md-2">
                                    <UserSelect
                                        @err='err = $event'
                                        label='Assigned'
                                    />

                                    <label class="form-label">Labels</label>
                                </div>
                                <div class="col-md-10">
                                    <label class="form-label">Issue Title</label>
                                    <textarea v-model='body' :class='{
                                        "is-invalid": errors.body
                                    }' class="form-control" rows="6" placeholder="Issue Content.."></textarea>
                                    <div v-if='errors.body' v-text='errors.body' class="invalid-feedback"></div>
                                </div>

                                <div class="col-md-10">
                                    <div class='d-flex'>
                                        <div class='ms-auto'>
                                            <a @click='create' class="cursor-pointer btn btn-primary">
                                                Create Issue
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <PageFooter/>
    <Err v-if='err' :err='err' @close='err = null'/>
</div>
</template>

<script>
import PageFooter from './PageFooter.vue';
import UserSelect from './util/UserSelect.vue';
import Err from './Err.vue';

export default {
    name: 'IssuesNew',
    data: function() {
        return {
            err: false,
            errors: {
                title: false,
                body: false
            },
            title: '',
            body: ''
        }
    },
    methods: {
        create: async function() {
            for (const field of ['title', 'body']) {
                if (!this[field]) this.errors[field] = 'Cannot be empty';
                else this.errors[field] = false;
            }

            for (const e in this.errors) {
                if (this.errors[e]) return;
            }

            try {
                const create = await window.std('/api/issue', {
                    method: 'POST',
                    body: {
                        title: this.title,
                        body: this.body
                    }
                });

                this.$router.push(`/issue/${create.id}`);
            } catch (err) {
                this.err = err;
            }
        }
    },
    components: {
        Err,
        PageFooter,
        UserSelect
    }
}
</script>
