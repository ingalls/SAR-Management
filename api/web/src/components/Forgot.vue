<template>
<div class="page page-center">
    <div class="container container-normal py-4">
        <div class="row align-items-center g-4">
            <div class="col-lg">
                <div class="container-tight">
                    <div class="card card-md">
                        <div class="card-body">
                            <h2 class="h2 text-center mb-4">Forgot Password</h2>
                            <template v-if='loading'>
                                <TablerLoading desc='Sending Reset Email'/>
                            </template>
                            <template v-else-if='submitted'>
                                <div class='d-flex justify-content-center mb-4'>
                                    <CheckIcon width='48' height='48' />
                                </div>

                                <div class='d-flex justify-content-center'>
                                    <div>Password Reset Email Sent</div>
                                </div>
                                <div class="form-footer">
                                  <button @click='$router.push("/")' type="submit" class="btn btn-primary w-100">Return Home</button>
                                </div>
                            </template>
                            <template v-else>
                                <div class="mb-3">
                                    <label class="form-label">Username or Email</label>
                                    <input v-model='username' v-on:keyup.enter='reset' type="text" class="form-control" placeholder="your@email.com" autocomplete="off">
                                </div>
                                <div class="form-footer">
                                  <button @click='reset' type="submit" class="btn btn-primary w-100">Send Reset</button>
                                </div>
                            </template>
                        </div>
                    </div>
                    <div class="text-center text-muted mt-3">
                        Don't have account yet? <a href='mailto:rescue@ingalls.ca'>Contact Us</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

</template>

<script>
import {
    TablerLoading
} from '@tak-ps/vue-tabler';
import {
    CheckIcon
} from 'vue-tabler-icons';

export default {
    name: 'Forgot',
    data: function() {
        return {
            submitted: false,
            loading: false,
            username: '',
        }
    },
    methods: {
        reset: async function() {
            if (!this.username.length) return;
            this.loading = true;

            await window.std('/api/login/forgot', {
                method: 'POST',
                body: {
                    username: this.username
                }
            }, false);

            this.submitted = true;

            this.loading = false;
        }
    },
    components: {
        CheckIcon,
        TablerLoading
    }
}
</script>
