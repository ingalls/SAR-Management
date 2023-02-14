<template>
<div class='page'>
    <header class='navbar navbar-expand-md navbar-dark d-print-none sticky-top'>
        <div class="container-xl">
            <div class="col-auto">
                <img @click='$router.push("/")' class='cursor-pointer' height='50' width='50' src='/logo.png'>
            </div>
            <div class="col mx-2">
                <div class="page-pretitle text-white">Mesa County Search &amp; Rescue</div>
                <h2 class="page-title">Team Management</h2>
            </div>

            <div v-if='user' class='ms-auto'>
                <div class='btn-list'>
                    <button class="btn btn-dark dropdown-toggle d-md-none" type='button' data-bs-toggle="dropdown" aria-expanded="false">
                        <PlusIcon/>
                    </button>
                    <div class="dropdown-menu dropdown-menu-end">
                        <a @click='$router.push("/")' class="dropdown-item">Home</a>
                        <a @click='$router.push("/issue")' class="dropdown-item">Issues</a>
                        <a @click='$router.push("/equipment")' class="dropdown-item">Equipment</a>
                        <a @click='$router.push("/doc")' class="dropdown-item">Docs</a>
                        <a @click='$router.push("/mission")' class="dropdown-item">Missions</a>
                        <a @click='$router.push("/team")' class="dropdown-item">Team</a>
                        <a @click='$router.push("/calendar")' class="dropdown-item">Calendar</a>
                    </div>


                    <a @click='$router.push("/notification")' class="btn btn-dark" target="_blank" rel="noreferrer">
                        <BellIcon/>
                    </a>

                    <button class="btn btn-dark dropdown-toggle" type='button' data-bs-toggle="dropdown" aria-expanded="false">
                        <UserIcon/>
                    </button>
                    <div class="dropdown-menu dropdown-menu-end">
                        <a @click='$router.push("/profile")' class="dropdown-item">Profile</a>
                        <a @click='$router.push("/logout")' class="dropdown-item">Logout</a>
                    </div>
                </div>
            </div>
        </div>
    </header>
    <div v-if='user' class="navbar-expand-md">
        <div class="collapse navbar-collapse" id="navbar-menu">
            <div class="navbar navbar-light">
                <div class="container-xl">
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <a class="nav-link cursor-pointer" @click='$router.push("/")'>
                                <span class="nav-link-icon d-md-none d-lg-inline-block">
                                    <HomeIcon/>
                                </span>
                                <span class="nav-link-title">Home</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link cursor-pointer" @click='$router.push("/issue")'>
                                <span class="nav-link-icon d-md-none d-lg-inline-block">
                                    <BugIcon/>
                                </span>
                                <span class="nav-link-title">Issues</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link cursor-pointer" @click='$router.push("/equipment")'>
                                <span class="nav-link-icon d-md-none d-lg-inline-block">
                                    <ShovelIcon/>
                                </span>
                                <span class="nav-link-title">Equipment</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link cursor-pointer" @click='$router.push("/doc")'>
                                <span class="nav-link-icon d-md-none d-lg-inline-block">
                                    <NotebookIcon/>
                                </span>
                                <span class="nav-link-title">Docs</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link cursor-pointer" @click='$router.push("/mission")'>
                                <span class="nav-link-icon d-md-none d-lg-inline-block">
                                    <AmbulanceIcon/>
                                </span>
                                <span class="nav-link-title">Missions</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link cursor-pointer" @click='$router.push("/team")'>
                                <span class="nav-link-icon d-md-none d-lg-inline-block">
                                    <UsersIcon/>
                                </span>
                                <span class="nav-link-title">Team</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link cursor-pointer" @click='$router.push("/calendar")'>
                                <span class="nav-link-icon d-md-none d-lg-inline-block">
                                    <CalendarIcon/>
                                </span>
                                <span class="nav-link-title">Calendar</span>
                            </a>
                        </li>
                    </ul>
                    <div v-if='auth && auth.access === "admin"' class='ms-auto'>
                        <ul class="navbar-nav">
                            <li class="nav-item">
                                <a class="nav-link cursor-pointer" @click='$router.push("/admin")'>
                                    <span class="nav-link-icon d-md-none d-lg-inline-block">
                                        <AdjustmentsIcon/>
                                    </span>
                                    <span class="nav-link-title">Admin</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <template v-if='loading.user'>
        <TablerLoading desc='Loading User...'/>
    </template>
    <template v-else-if='enableNav'>
        <router-view
            @login='getUser'
            :iam='iam'
            :auth='user'
        />
    </template>

    <TablerError v-if='err' :err='err' @close='err = null'/>
</div>
</template>

<script>
import '@tabler/core/dist/js/tabler.min.js';
import '@tabler/core/dist/css/tabler.min.css';
import {
    TablerError,
    TablerLoading
} from '@tak-ps/vue-tabler'

import {
    UserIcon,
    BellIcon,
    HomeIcon,
    PlusIcon,
    UsersIcon,
    ShovelIcon,
    BugIcon,
    NotebookIcon,
    AmbulanceIcon,
    CalendarIcon,
    AdjustmentsIcon
} from 'vue-tabler-icons';

export default {
    name: 'SearchAndRescue',
    data: function() {
        return {
            loading: {
                user: false
            },
            iam: {},
            user: null,
            err: false,
        }
    },
    errorCaptured: function(err) {
        this.err = err;
    },
    computed: {
        enableNav() {
            if (!this.$route || !this.$route.name) return false;
            return this.$route.name.includes("login") || this.user;
        }
    },
    watch: {
        $route: async function() {
            if (this.$route.name === 'logout') {
                delete localStorage.token;
                this.user = null;
                this.$router.push("/login");
            } else if (!this.user && !localStorage.token && !this.$route.name.includes('login')) {
                this.$router.push("/login");
            }
        }
    },
    mounted: async function() {
        await this.getIAM();
        if (localStorage.token) return await this.getUser();
    },
    methods: {
        getIAM: async function() {
            this.iam = await window.std('/api/iam');
        },
        getUser: async function() {
            try {
                this.loading.user = true;
                this.user = await window.std('/api/login');
                this.loading.user = false;
            } catch (err) {
                this.loading.user = false;

                if (err.message === 'Authentication Required') {
                    if (this.$route.path.split('/')[1] !== 'login') return this.$router.push('/login');
                }
            }

            if (this.$route.name && this.$route.name.includes('login')) {
                this.$router.push("/");
            }
        }
    },
    components: {
        BugIcon,
        HomeIcon,
        PlusIcon,
        UsersIcon,
        UserIcon,
        BellIcon,
        ShovelIcon,
        NotebookIcon,
        CalendarIcon,
        AmbulanceIcon,
        AdjustmentsIcon,
        TablerError,
        TablerLoading
    }
}
</script>
