<template>
<div class='page'>
    <header class='navbar navbar-expand-md d-print-none sticky-top' data-bs-theme="dark">
        <div class="container-xl">
            <div class="col-auto">
                <img @click='$router.push("/")' class='cursor-pointer' height='50' width='50' src='/logo.png'>
            </div>
            <div class="col mx-2">
                <div class="page-pretitle text-white" v-text='name'></div>
                <h2 class="page-title">Team Management</h2>
            </div>

            <div v-if='user' class='ms-auto'>
                <div class='btn-list'>
                    <button class="btn btn-dark dropdown-toggle d-md-none" type='button' data-bs-toggle="dropdown" aria-expanded="false">
                        <IconMenu size='32' stroke='1'/>
                    </button>
                    <div class="dropdown-menu dropdown-menu-end">
                        <a @click='$router.push("/")' class="dropdown-item">Home</a>
                        <a @click='$router.push("/issue")' class="dropdown-item">Issues</a>
                        <a @click='$router.push("/equipment")' class="dropdown-item">Equipment</a>
                        <a @click='$router.push("/doc")' class="dropdown-item">Docs</a>
                        <a @click='$router.push("/mission")' class="dropdown-item">Missions</a>
                        <a @click='$router.push("/training")' class="dropdown-item">Training</a>
                        <a @click='$router.push("/team")' class="dropdown-item">Team</a>
                        <a @click='$router.push("/calendar")' class="dropdown-item">Calendar</a>
                        <a @click='$router.push("/schedule")' class="dropdown-item">On-Call</a>
                        <a @click='$router.push("/application")' class="dropdown-item">Applications</a>
                    </div>


                    <a @click='$router.push("/notification")' class="btn btn-dark" target="_blank" rel="noreferrer">
                        <IconBell size='32' stroke='1'/>
                        <span v-if='notifications' class="badge bg-red"></span>
                    </a>

                    <div class='dropdown'>
                        <div type="button" id="userProfileButton" data-bs-toggle="dropdown" aria-expanded="false" class='btn btn-dark'>
                            <IconUser size='32' stroke='1'/>
                        </div>
                        <ul class="dropdown-menu" aria-labelledby='userProfileButton'>
                            <a @click='$router.push("/profile")' class="cursor-pointer dropdown-item">Profile</a>
                            <a @click='$router.push("/logout")' class="cursor-pointer dropdown-item">Logout</a>
                        </ul>
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
                                    <IconHome size='32' stroke='2'/>
                                </span>
                                <span class="nav-link-title">Home</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link cursor-pointer" @click='$router.push("/issue")'>
                                <span class="nav-link-icon d-md-none d-lg-inline-block">
                                    <IconBug size='32' stroke='2'/>
                                </span>
                                <span class="nav-link-title">Issues</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link cursor-pointer" @click='$router.push("/equipment")'>
                                <span class="nav-link-icon d-md-none d-lg-inline-block">
                                    <IconShovel size='32' stroke='2'/>
                                </span>
                                <span class="nav-link-title">Equipment</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link cursor-pointer" @click='$router.push("/doc")'>
                                <span class="nav-link-icon d-md-none d-lg-inline-block">
                                    <IconNotebook size='32' stroke='2'/>
                                </span>
                                <span class="nav-link-title">Docs</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link cursor-pointer" @click='$router.push("/training")'>
                                <span class="nav-link-icon d-md-none d-lg-inline-block">
                                    <IconTruck size='32' stroke='2'/>
                                </span>
                                <span class="nav-link-title">Training</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link cursor-pointer" @click='$router.push("/mission")'>
                                <span class="nav-link-icon d-md-none d-lg-inline-block">
                                    <IconAmbulance size='32' stroke='2'/>
                                </span>
                                <span class="nav-link-title">Missions</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link cursor-pointer" @click='$router.push("/team")'>
                                <span class="nav-link-icon d-md-none d-lg-inline-block">
                                    <IconUsers size='32' stroke='2'/>
                                </span>
                                <span class="nav-link-title">Team</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link cursor-pointer" @click='$router.push("/calendar")'>
                                <span class="nav-link-icon d-md-none d-lg-inline-block">
                                    <IconCalendar size='32' stroke='2'/>
                                </span>
                                <span class="nav-link-title">Calendar</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <TablerDropdown>
                                <template #default>
                                    <a class="nav-link cursor-pointer">
                                        <span class="nav-link-icon">
                                            <IconCaretDown size='32' stroke='2'/>
                                        </span>
                                        <span class="nav-link-title">More</span>
                                    </a>
                                </template>
                                <template #dropdown>
                                    <a class="nav-link cursor-pointer" @click='$router.push("/schedule")'>
                                        <span class="nav-link-icon">
                                            <IconCalendarTime size='32' stroke='2'/>
                                        </span>
                                        <span class="nav-link-title">On-Call</span>
                                    </a>
                                    <a class="nav-link cursor-pointer" @click='$router.push("/application")'>
                                        <span class="nav-link-icon">
                                            <IconUserPlus size='32' stroke='2'/>
                                        </span>
                                        <span class="nav-link-title">Applications</span>
                                    </a>
                                </template>
                            </TablerDropdown>
                        </li>
                    </ul>
                    <div v-if='user && user.access === "admin"' class='ms-auto'>
                        <ul class="navbar-nav">
                            <li class="nav-item">
                                <a class="nav-link cursor-pointer" @click='$router.push("/admin")'>
                                    <span class="nav-link-icon d-md-none d-lg-inline-block">
                                        <IconAdjustments size='32' stroke='2'/>
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
            :key="$route.fullPath"
            @login='getUser'
            @notifications='notifications = $event'
            :iam='iam'
            :auth='user'
        />
    </template>

    <TablerError v-if='err' :err='err' @close='err = null'/>

    <PageFooter/>
</div>
</template>

<script>
import '@tabler/core/dist/js/tabler.min.js';
import '@tabler/core/dist/css/tabler.min.css';
import PageFooter from './components/util/PageFooter.vue';
import {
    TablerError,
    TablerDropdown,
    TablerLoading
} from '@tak-ps/vue-tabler'

import {
    IconBug,
    IconHome,
    IconUserPlus,
    IconMenu,
    IconUsers,
    IconUser,
    IconBell,
    IconShovel,
    IconNotebook,
    IconCalendar,
    IconCalendarTime,
    IconTruck,
    IconAmbulance,
    IconAdjustments,
    IconCaretDown,
} from '@tabler/icons-vue';

export default {
    name: 'SearchAndRescue',
    data: function() {
        return {
            loading: {
                user: false
            },
            notifications: false,
            name: 'Search & Rescue',
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
        window.addEventListener('error', (evt) => {
            evt.preventDefault();
            this.err = evt;
        });

        await this.fetchName();
        if (localStorage.token) {
            await this.getUser();
            await this.getIAM();
            await this.fetchNotify();
        }
    },
    methods: {
        fetchName: async function() {
            this.name = (await window.std('/api/server/name')).value;
        },
        fetchNotify: async function() {
            this.notifications = !!(await window.std('/api/notification')).total;
        },
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
                this.user = null;

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
        IconBug,
        IconHome,
        IconUserPlus,
        IconMenu,
        IconUsers,
        IconUser,
        IconBell,
        IconShovel,
        IconNotebook,
        IconCalendar,
        IconCalendarTime,
        IconTruck,
        IconAmbulance,
        IconAdjustments,
        IconCaretDown,
        TablerError,
        TablerDropdown,
        TablerLoading,
        PageFooter
    }
}
</script>

<style>
.hover-light:hover {
    background: #f5f5f5;
}

.hover-dark:hover {
    background: #0f172a;
}
</style>

