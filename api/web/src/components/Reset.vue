<template>
<div class="page page-center">
    <div class="container container-normal py-4">
        <div class="row align-items-center g-4">
            <div class="col-lg">
                <div class="container-tight">
                    <div class="card card-md">
                        <div class="card-body">
                            <template v-if='err'>
                                <div class="text-center py-4">
                                    <AlertCircleIcon height='48' width='48'/>
                                    <h3 class='pt-3'>Password Reset Failed</h3>
                                    <div class="text-muted" v-text='err.message'></div>

                                    <div class="form-footer">
                                        <button @click='$router.push("/login/forgot")' type="submit" class="btn btn-primary w-100">Forgot Password</button>
                                    </div>
                                </div>
                            </template>
                            <template v-else>
                                <h2 class="h2 text-center mb-4">Reset Password</h2>
                                <template v-if='loading'>
                                    <TablerLoading/>
                                </template>
                                <template v-else-if='success'>
                                    <div class='d-flex justify-content-center mb-4'>
                                        <CheckIcon width='48' height='48' />
                                    </div>

                                    <div class='d-flex justify-content-center'>
                                        <div>Password Reset</div>
                                    </div>
                                    <div class="form-footer">
                                        <button @click='$router.push("/login")' type="submit" class="btn btn-primary w-100">Login</button>
                                    </div>
                                </template>
                                <template v-else>
                                    <div class="mb-2">
                                        <label class="form-label">
                                            New Password
                                        </label>
                                        <div class="input-group input-group-flat">
                                            <input v-model='password' v-on:keyup.enter='reset' type="password" class="form-control" placeholder="Your password" autocomplete="off">
                                        </div>
                                    </div>
                                    <div class="form-footer">
                                        <button @click='reset' type="submit" class="btn btn-primary w-100">Reset Password</button>
                                    </div>
                                </template>
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
    CheckIcon,
    AlertCircleIcon
} from 'vue-tabler-icons';

export default {
    name: 'Reset',
    data: function() {
        return {
            err: false,
            loading: false,
            success: false,
            token: this.$route.query.token,
            password: ''
        }
    },
    methods: {
        reset: async function() {
            if (!this.token.length) return;
            if (!this.password.length) return;

            this.loading = true;

            try {
                await window.std('/api/login/reset', {
                    method: 'POST',
                    body: {
                        token: this.token,
                        password: this.password
                    }
                }, false);

                this.success = true;
            } catch (err) {
                console.error('HERE');
                this.err = err;
            }

            this.loading = false
        }
    },
    components: {
        CheckIcon,
        TablerLoading,
        AlertCircleIcon
    }
}
</script>
