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

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import {
    TablerLoading
} from '@tak-ps/vue-tabler';
import {
    IconCheck,
    IconAlertCircle
} from '@tabler/icons-vue';

const route = useRoute();

const err = ref(false);
const loading = ref(false);
const success = ref(false);
const token = ref(route.query.token);
const password = ref('');

async function reset() {
    if (!token.value.length) return;
    if (!password.value.length) return;

    loading.value = true;

    try {
        await window.std('/api/login/reset', {
            method: 'POST',
            body: {
                token: token.value,
                password: password.value
            }
        }, false);

        success.value = true;
    } catch (error) {
        console.error('HERE');
        err.value = error;
    }

    loading.value = false
}
</script>
