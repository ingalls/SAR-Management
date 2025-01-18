<template>
    <div class='page page-center'>
        <div class='container container-normal py-4'>
            <div class='row align-items-center g-4'>
                <div class='col-lg'>
                    <div class='container-tight'>
                        <div class='card card-md'>
                            <div class='card-body'>
                                <template v-if='err'>
                                    <div class='text-center py-4'>
                                        <IconAlertCircle
                                            :size='48'
                                            stroke='1'
                                        />
                                        <h3 class='pt-3'>
                                            Password Reset Failed
                                        </h3>
                                        <div
                                            class='text-muted'
                                            v-text='err.message'
                                        />

                                        <div class='form-footer'>
                                            <button
                                                type='submit'
                                                class='btn btn-primary w-100'
                                                @click='$router.push("/login/forgot")'
                                            >
                                                Forgot Password
                                            </button>
                                        </div>
                                    </div>
                                </template>
                                <template v-else>
                                    <h2 class='h2 text-center mb-4'>
                                        Reset Password
                                    </h2>
                                    <template v-if='loading'>
                                        <TablerLoading />
                                    </template>
                                    <template v-else-if='success'>
                                        <div class='d-flex justify-content-center mb-4'>
                                            <IconCheck
                                                :size='48'
                                                stroke='1'
                                            />
                                        </div>

                                        <div class='d-flex justify-content-center'>
                                            <div>Password Reset</div>
                                        </div>
                                        <div class='form-footer'>
                                            <button
                                                type='submit'
                                                class='btn btn-primary w-100'
                                                @click='$router.push("/login")'
                                            >
                                                Login
                                            </button>
                                        </div>
                                    </template>
                                    <template v-else>
                                        <div class='mb-2'>
                                            <label class='form-label'>
                                                New Password
                                            </label>
                                            <div class='input-group input-group-flat'>
                                                <input
                                                    v-model='password'
                                                    type='password'
                                                    class='form-control'
                                                    placeholder='Your password'
                                                    autocomplete='off'
                                                    @keyup.enter='reset'
                                                >
                                            </div>
                                        </div>
                                        <div class='form-footer'>
                                            <button
                                                type='submit'
                                                class='btn btn-primary w-100'
                                                @click='reset'
                                            >
                                                Reset Password
                                            </button>
                                        </div>
                                    </template>
                                </template>
                            </div>
                        </div>
                        <div class='text-center text-muted mt-3'>
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
    IconCheck,
    IconAlertCircle
} from '@tabler/icons-vue';

export default {
    name: 'Reset',
    components: {
        IconCheck,
        TablerLoading,
        IconAlertCircle
    },
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
    }
}
</script>
