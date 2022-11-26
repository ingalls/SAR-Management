<template>
    <div class="card card-md">
        <div class="card-body">
            <h2 class="h2 text-center mb-4">Login to your account</h2>
            <div class="mb-3">
                <label class="form-label">Username or Email</label>
                <input v-model='username' type="text" class="form-control" placeholder="your@email.com" autocomplete="off">
            </div>
        </div>

    <Err v-if='err' :err='err' @close='err = null'/>
</div>
</template>

<script>
import Err from '../Err.vue';

export default {
    name: 'CreateComment',
    data: function() {
        return {
            body: '',
        }
    },
    methods: {
        createComment: async function() {
            try {
                const login = await window.std('/api/login', {
                    method: 'POST',
                    body: {
                        username: this.username,
                        password: this.password
                    }
                });

                localStorage.token = login.token;

                this.$router.push("/");
            } catch (err) {
                this.err = err;
            }
        }
    },
    components: {
        Err
    }
}
</script>
