<template>
    <div class='page'>
        <header
            class='navbar navbar-expand-md d-print-none sticky-top'
            data-bs-theme='dark'
        >
            <div class='container-xl'>
                <div class='col-auto'>
                    <img
                        class='cursor-pointer'
                        height='50'
                        width='50'
                        src='/logo.png'
                        @click='$router.push("/")'
                    >
                </div>
                <div class='col mx-2'>
                    <div
                        class='page-pretitle text-white'
                        v-text='name'
                    />
                    <h2 class='page-title'>
                        Team Management
                    </h2>
                </div>

                <div
                    v-if='user'
                    class='ms-auto'
                >
                    <div class='btn-list'>
                        <button
                            class='btn btn-dark dropdown-toggle d-md-none'
                            type='button'
                            data-bs-toggle='dropdown'
                            aria-expanded='false'
                        >
                            <IconMenu
                                size='32'
                                stroke='1'
                            />
                        </button>
                        <div class='dropdown-menu dropdown-menu-end'>
                            <a
                                class='dropdown-item'
                                @click='$router.push("/")'
                            >Home</a>
                            <a
                                class='dropdown-item'
                                @click='$router.push("/issue")'
                            >Issues</a>
                            <a
                                class='dropdown-item'
                                @click='$router.push("/equipment")'
                            >Equipment</a>
                            <a
                                class='dropdown-item'
                                @click='$router.push("/doc")'
                            >Docs</a>
                            <a
                                class='dropdown-item'
                                @click='$router.push("/mission")'
                            >Missions</a>
                            <a
                                class='dropdown-item'
                                @click='$router.push("/training")'
                            >Training</a>
                            <a
                                class='dropdown-item'
                                @click='$router.push("/team")'
                            >Team</a>
                            <a
                                class='dropdown-item'
                                @click='$router.push("/calendar")'
                            >Calendar</a>
                            <a
                                class='dropdown-item'
                                @click='$router.push("/schedule")'
                            >On-Call</a>
                            <a
                                class='dropdown-item'
                                @click='$router.push("/application")'
                            >Applications</a>
                            <a
                                class='dropdown-item'
                                @click='$router.push("/rolodex")'
                            >Rolodex</a>
                        </div>


                        <a
                            class='btn btn-dark'
                            target='_blank'
                            rel='noreferrer'
                            @click='$router.push("/notification")'
                        >
                            <IconBell
                                size='32'
                                stroke='1'
                            />
                            <span
                                v-if='notifications'
                                class='badge bg-red'
                            />
                        </a>

                        <div class='dropdown'>
                            <div
                                id='userProfileButton'
                                type='button'
                                data-bs-toggle='dropdown'
                                aria-expanded='false'
                                class='btn btn-dark'
                            >
                                <IconUser
                                    size='32'
                                    stroke='1'
                                />
                            </div>
                            <ul
                                class='dropdown-menu'
                                aria-labelledby='userProfileButton'
                            >
                                <a
                                    class='cursor-pointer dropdown-item'
                                    @click='$router.push("/profile")'
                                >Profile</a>
                                <a
                                    class='cursor-pointer dropdown-item'
                                    @click='$router.push("/logout")'
                                >Logout</a>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </header>
        <div
            v-if='user'
            class='navbar-expand-md'
        >
            <div
                id='navbar-menu'
                class='collapse navbar-collapse'
            >
                <div class='navbar navbar-light'>
                    <div class='container-xl'>
                        <ul class='navbar-nav'>
                            <li class='nav-item'>
                                <a
                                    class='nav-link cursor-pointer'
                                    @click='$router.push("/")'
                                >
                                    <span class='nav-link-icon d-md-none d-lg-inline-block'>
                                        <IconHome
                                            size='32'
                                            stroke='2'
                                        />
                                    </span>
                                    <span class='nav-link-title'>Home</span>
                                </a>
                            </li>
                            <li class='nav-item'>
                                <a
                                    class='nav-link cursor-pointer'
                                    @click='$router.push("/issue")'
                                >
                                    <span class='nav-link-icon d-md-none d-lg-inline-block'>
                                        <IconBug
                                            size='32'
                                            stroke='2'
                                        />
                                    </span>
                                    <span class='nav-link-title'>Issues</span>
                                </a>
                            </li>
                            <li class='nav-item'>
                                <a
                                    class='nav-link cursor-pointer'
                                    @click='$router.push("/equipment")'
                                >
                                    <span class='nav-link-icon d-md-none d-lg-inline-block'>
                                        <IconShovel
                                            size='32'
                                            stroke='2'
                                        />
                                    </span>
                                    <span class='nav-link-title'>Equipment</span>
                                </a>
                            </li>
                            <li class='nav-item'>
                                <a
                                    class='nav-link cursor-pointer'
                                    @click='$router.push("/doc")'
                                >
                                    <span class='nav-link-icon d-md-none d-lg-inline-block'>
                                        <IconNotebook
                                            size='32'
                                            stroke='2'
                                        />
                                    </span>
                                    <span class='nav-link-title'>Docs</span>
                                </a>
                            </li>
                            <li class='nav-item'>
                                <a
                                    class='nav-link cursor-pointer'
                                    @click='$router.push("/training")'
                                >
                                    <span class='nav-link-icon d-md-none d-lg-inline-block'>
                                        <IconTruck
                                            size='32'
                                            stroke='2'
                                        />
                                    </span>
                                    <span class='nav-link-title'>Training</span>
                                </a>
                            </li>
                            <li class='nav-item'>
                                <a
                                    class='nav-link cursor-pointer'
                                    @click='$router.push("/mission")'
                                >
                                    <span class='nav-link-icon d-md-none d-lg-inline-block'>
                                        <IconAmbulance
                                            size='32'
                                            stroke='2'
                                        />
                                    </span>
                                    <span class='nav-link-title'>Missions</span>
                                </a>
                            </li>
                            <li class='nav-item'>
                                <a
                                    class='nav-link cursor-pointer'
                                    @click='$router.push("/team")'
                                >
                                    <span class='nav-link-icon d-md-none d-lg-inline-block'>
                                        <IconUsers
                                            size='32'
                                            stroke='2'
                                        />
                                    </span>
                                    <span class='nav-link-title'>Team</span>
                                </a>
                            </li>
                            <li class='nav-item'>
                                <a
                                    class='nav-link cursor-pointer'
                                    @click='$router.push("/calendar")'
                                >
                                    <span class='nav-link-icon d-md-none d-lg-inline-block'>
                                        <IconCalendar
                                            size='32'
                                            stroke='2'
                                        />
                                    </span>
                                    <span class='nav-link-title'>Calendar</span>
                                </a>
                            </li>
                            <li class='nav-item'>
                                <TablerDropdown>
                                    <template #default>
                                        <a class='nav-link cursor-pointer'>
                                            <span class='nav-link-icon'>
                                                <IconCaretDown
                                                    size='32'
                                                    stroke='2'
                                                />
                                            </span>
                                            <span class='nav-link-title'>More</span>
                                        </a>
                                    </template>
                                    <template #dropdown>
                                        <a
                                            class='nav-link cursor-pointer'
                                            @click='$router.push("/schedule")'
                                        >
                                            <span class='nav-link-icon'>
                                                <IconCalendarTime
                                                    size='32'
                                                    stroke='2'
                                                />
                                            </span>
                                            <span class='nav-link-title'>On-Call</span>
                                        </a>
                                        <a
                                            class='nav-link cursor-pointer'
                                            @click='$router.push("/application")'
                                        >
                                            <span class='nav-link-icon'>
                                                <IconUserPlus
                                                    size='32'
                                                    stroke='2'
                                                />
                                            </span>
                                            <span class='nav-link-title'>Applications</span>
                                        </a>
                                        <a
                                            class='nav-link cursor-pointer'
                                            @click='$router.push("/rolodex")'
                                        >
                                            <span class='nav-link-icon'>
                                                <IconAddressBook
                                                    size='32'
                                                    stroke='2'
                                                />
                                            </span>
                                            <span class='nav-link-title'>Rolodex</span>
                                        </a>
                                    </template>
                                </TablerDropdown>
                            </li>
                        </ul>
                        <div
                            v-if='user && user.access === "admin"'
                            class='ms-auto'
                        >
                            <ul class='navbar-nav'>
                                <li class='nav-item'>
                                    <a
                                        class='nav-link cursor-pointer'
                                        @click='$router.push("/admin")'
                                    >
                                        <span class='nav-link-icon d-md-none d-lg-inline-block'>
                                            <IconAdjustments
                                                size='32'
                                                stroke='2'
                                            />
                                        </span>
                                        <span class='nav-link-title'>Admin</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <TablerLoading
            v-if='loading'
            desc='Loading User...'
        />
        <template v-else-if='enableNav'>
            <router-view
                :key='$route.fullPath'
                :iam='iam'
                :auth='user'
                @login='refetch'
                @notifications='notifications = $event'
            />
        </template>

        <TablerError
            v-if='err'
            :err='err'
            @close='err = null'
        />

        <PageFooter />
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onErrorCaptured } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
    IconAddressBook,
    IconCalendarTime,
    IconTruck,
    IconAmbulance,
    IconAdjustments,
    IconCaretDown,
} from '@tabler/icons-vue';

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const notifications = ref(false)
const name = ref('Search & Rescue')
const iam = reactive({})
const user = ref(null)
const err = ref(false)

const enableNav = computed(() => {
    if (!route || !route.name) return false;
    return route.name.includes("login") || user.value;
})

const refetch = async () => {
    loading.value = true;
    await getIAM();
    await fetchNotify();
    await getUser();
}

const fetchName = async () => {
    name.value = (await window.std('/api/server/name')).value;
}

const fetchNotify = async () => {
    notifications.value = !!(await window.std('/api/notification')).total;
}

const getIAM = async () => {
    Object.assign(iam, await window.std('/api/iam'));
}

const getUser = async () => {
    try {
        loading.value = true;
        user.value = await window.std('/api/login');
        loading.value = false;
    } catch (error) {
        loading.value = false;
        user.value = null;

        if (error.message === 'Authentication Required') {
            if (route.path.split('/')[1] !== 'login') return router.push('/login');
        }
    }

    if (route.name && route.name.includes('login')) {
        router.push("/");
    }
}

// Watch for route changes
watch(route, async () => {
    if (route.name === 'logout') {
        delete localStorage.token;
        user.value = null;
        router.push("/login");
    } else if (!user.value && !localStorage.token && !route.name.includes('login')) {
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
})

onErrorCaptured((error) => {
    err.value = error;
    return false;
})

onMounted(async () => {
    window.addEventListener('error', (evt) => {
        evt.preventDefault();
        err.value = evt;
    });

    await fetchName();

    if (localStorage.token) {
        await refetch();
    }
})
</script>

<style>
.hover-light:hover {
    background: #f5f5f5;
}

.hover-dark:hover {
    background: #0f172a;
}
</style>

