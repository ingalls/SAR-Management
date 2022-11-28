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
                                    <label class="form-label">First Name</label>
                                    <input v-model='user.fname' type="text" :class='{
                                        "is-invalid": errors.fname
                                    }' class="form-control" placeholder="First Name">
                                    <div v-if='errors.username' v-text='errors.username' class="invalid-feedback"></div>
                                </div>
                                <div class="col-md-5">
                                    <label class="form-label">Last Name</label>
                                    <input v-model='user.lname' type="text" :class='{
                                        "is-invalid": errors.lname
                                    }' class="form-control" placeholder="Last Name">
                                    <div v-if='errors.lname' v-text='errors.lname' class="invalid-feedback"></div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Username</label>
                                    <input v-model='user.username' type="text" :class='{
                                        "is-invalid": errors.username
                                    }' class="form-control" placeholder="Username">
                                    <div v-if='errors.username' v-text='errors.title' class="invalid-feedback"></div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Email</label>
                                    <input v-model='user.email' type="text" :class='{
                                        "is-invalid": errors.email
                                    }' class="form-control" placeholder="Email">
                                    <div v-if='errors.email' v-text='errors.email' class="invalid-feedback"></div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Phone</label>
                                    <input v-model='user.phone' type="text" placeholder='###-###-####' :class='{
                                        "is-invalid": errors.phone
                                    }' class="form-control">
                                    <div v-if='errors.phone' v-text='errors.phone' class="invalid-feedback"></div>
                                </div>

                                <div class="col-md-12">
                                    <div class='d-flex'>
                                        <div class='ms-auto'>
                                            <a @click='create' class="cursor-pointer btn btn-primary">Update User</a>
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
import Err from './Err.vue';

export default {
    name: 'TeamUserEdit',
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
                phone: ''
            }
        }
    },
    mounted: function() {
        this.fetch();
    },
    methods: {
        fetch: async function() {
            try {
                this.user = await window.std(`/api/user/${this.$route.params.userid}`);
            } catch (err) {
                this.err = err;
            }
        },
        create: async function() {
            for (const field of ['username', 'email', 'fname', 'lname']) {
                if (!this.user[field]) this.errors[field] = 'Cannot be empty';
                else this.errors[field] = false;
            }

            for (const e in this.errors) {
                if (this.errors[e]) return;
            }

            try {
                const create = await window.std(`/api/user/${this.$route.params.userid}`, {
                    method: 'PATCH',
                    body: {
                        username: this.user.username,
                        email: this.user.email,
                        fname: this.user.fname,
                        lname: this.user.lname,
                        phone: this.user.phone,
                    }
                });

                this.$router.push(`/team/user/${create.id}`);
            } catch (err) {
                this.err = err;
            }
        }
    },
    components: {
        Err,
        PageFooter,
    }
}
</script>
