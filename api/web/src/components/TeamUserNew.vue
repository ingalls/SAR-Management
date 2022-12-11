<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a @click='$router.push("/")' class="cursor-pointer">Home</a></li>
                            <li class="breadcrumb-item" aria-current="page"><a  @click='$router.push("/team")' class="cursor-pointer">Team</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="#">New User</a></li>
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
                                <div class="col-md-6">
                                    <TablerInput label='First Name' v-model='user.fname' :errors='errors.fname'/>
                                </div>
                                <div class="col-md-6">
                                    <TablerInput label='Last Name' v-model='user.lname' :errors='errors.lname'/>
                                </div>
                                <div class="col-md-6">
                                    <TablerInput label='Username' v-model='user.username' :errors='errors.username'/>
                                </div>
                                <div class="col-md-6">
                                    <TablerInput label='Email' v-model='user.email' :errors='errors.email'/>
                                </div>
                                <div class="col-md-6">
                                    <TablerInput label='Phone' v-model='user.phone' :errors='errors.phone'/>
                                </div>
                                <div class="col-md-6">
                                    <TablerInput type='date' label='Birthday' v-model='user.bday' :errors='errors.bday'/>
                                </div>

                                <div class="col-md-12">
                                    <div class='d-flex'>
                                        <div class='ms-auto'>
                                            <a @click='create' class="cursor-pointer btn btn-primary">Create User</a>
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
    <TablerError v-if='err' :err='err' @close='err = null'/>
</div>
</template>

<script>
import PageFooter from './PageFooter.vue';
import {
    TablerError,
    TablerInput
} from '@tak-ps/vue-tabler';

export default {
    name: 'TeamUserNew',
    data: function() {
        return {
            err: false,
            errors: {
                username: false,
                email: false,
                fname: false,
                lname: false,
                phone: false
            },
            user: {
                username: '',
                email: '',
                fname: '',
                lname: '',
                phone: '',
                bday: null
            }
        }
    },
    methods: {
        create: async function() {
            for (const field of ['username', 'email', 'fname', 'lname']) {
                if (!this.user[field]) this.errors[field] = 'Cannot be empty';
                else this.errors[field] = false;
            }

            for (const e in this.errors) {
                if (this.errors[e]) return;
            }

            try {
                const create = await window.std('/api/user', {
                    method: 'POST',
                    body: this.user
                });

                this.$router.push(`/team/user/${create.id}`);
            } catch (err) {
                this.err = err;
            }
        }
    },
    components: {
        TablerError,
        TablerInput,
        PageFooter,
    }
}
</script>
