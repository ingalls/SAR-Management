<template>
    <div    
        class='page page-center position-relative'    
        style='overflow: auto;'    
    >
        <div class='container container-normal py-4'>
            <div class='row align-items-center g-4'>
                <div class='col-lg'>
                    <div class='container-tight'>
                        <div class='card card-md'>
                            <div class='card-body'>
                                <div
                                    class='text-center'
                                    style='margin-bottom: 24px;'
                                >
                                    <img
                                        src='/logo.png'
                                        draggable='false'
                                        style='height: 150px;'
                                    >
                                </div>

                                <TablerLoading
                                    v-if='loading'
                                />
                                <template v-else>
                                    <h2 class='h2 text-center mb-4 user-select-none'>
                                        Login to your account
                                    </h2>
                                    <div class='mb-3'>
                                        <TablerInput
                                            v-model='body.username'
                                            icon='user'
                                            label='Username or Email'
                                            placeholder='your@email.com'
                                            autocomplete='off'
                                            @keyup.enter='createLogin'
                                        />
                                    </div>
                                    <div class='mb-2'>
                                        <label class='form-label'>
                                            Password
                                            <span class='form-label-description'>
                                                <a
                                                    class='cursor-pointer user-select-none'
                                                    @click='$router.push("/login/forgot")'
                                                >Forgot Password</a>
                                            </span>
                                        </label>
                                        <TablerInput
                                            v-model='body.password'
                                            icon='lock'
                                            type='password'
                                            placeholder='Your password'
                                            autocomplete='off'
                                            @keyup.enter='createLogin'
                                        />
                                    </div>
                                    <div class='form-footer'>
                                        <button
                                            type='submit'
                                            class='btn btn-primary w-100'
                                            @click='createLogin'
                                        >
                                            Sign In
                                        </button>
                                    </div>
                                </template>
                            </div>
                        </div>
                        <div class='text-center text-muted mt-3 user-select-none'>
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
import { useRouter, useRoute } from 'vue-router';
import {
    TablerInput,
    TablerLoading
} from '@tak-ps/vue-tabler';

const emit = defineEmits(['login']);

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const body = ref({
    username: '',
    password: ''
});

async function createLogin() {
    loading.value = true;

    try {
        const login = await window.std('/api/login', {
            method: 'POST',
            body: body.value
        });

        localStorage.token = login.token;

        emit('login');

        if (route.query.redirect && !String(route.query.redirect).includes('/login')) {    
            router.push(String(route.query.redirect));    
        } else {                                      
            router.push("/");          
        } 
    } catch (err) {
        loading.value = false;
        throw err;
    }
}
</script>
