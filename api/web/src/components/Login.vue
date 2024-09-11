<template>
<div class="page page-center">
    <div class="container container-normal py-4">
        <div class="row align-items-center g-4">
            <div class="col-lg">
                <div class="container-tight">
                    <div class="card card-md">
                        <div class="card-body">
                            <div class='text-center' style='margin-bottom: 24px;'>
                                <img src='/logo.png' style='height: 150px;'/>
                            </div>
                            <h2 class="h2 text-center mb-4">Login to your account</h2>
                            <div class="mb-3">
                                <TablerInput
                                    v-model='username'
                                    icon='user'
                                    label='Username or Email'
                                    placeholder='your@email.com'
                                    autocomplete='off'
                                    @keyup.enter='createLogin'
                                />
                            </div>
                            <div class="mb-2">
                                <label class="form-label">
                                    Password
                                    <span class="form-label-description">
                                        <a @click='$router.push("/login/forgot")' class='cursor-pointer'>Forgot Password</a>
                                    </span>
                                </label>
                                <TablerInput
                                    v-model='password'
                                    icon='lock'
                                    type='password'
                                    placeholder='Your password'
                                    autocomplete='off'
                                    @keyup.enter='createLogin'
                                />
                            </div>
                            <div class="form-footer">
                              <button @click='createLogin' type="submit" class="btn btn-primary w-100">Sign In</button>
                            </div>
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
    TablerInput
} from '@tak-ps/vue-tabler';

export default {
    name: 'Login',
    data: function() {
        return {
            username: '',
            password: ''
        }
    },
    components: {
        TablerInput
    },
    methods: {
        createLogin: async function() {
            const login = await window.std('/api/login', {
                method: 'POST',
                body: {
                    username: this.username,
                    password: this.password
                }
            });

            localStorage.token = login.token;

            this.$emit('login');
            this.$router.push("/");
        }
    }
}
</script>
