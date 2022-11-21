<template>
<div class='page'>
    <header class='navbar navbar-expand-md navbar-dark d-print-none sticky-top'>
        <div class="container-xl">
            <div class="col">
                <div class="page-pretitle">Mesa County Search &amp; Rescue</div>
                <h2 class="page-title">Team Management</h2>
            </div>

            <div class='ms-auto'>
                <div class='btn-list'>
                    <a class="btn btn-dark dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                        <PlusIcon/>
                    </a>
                    <div class="dropdown-menu dropdown-menu-end">
                        <a @click='$router.push("/issue/new")' class="dropdown-item">New Issue</a>
                        <a @click='$router.push("/equipment/new")' class="dropdown-item">New Equipment</a>
                        <a @click='$router.push("/mission/new")' class="dropdown-item">New Mission</a>
                    </div>


                    <a @click='$router.push("/profile")' class="btn btn-dark" target="_blank" rel="noreferrer">
                        <BellIcon/>
                    </a>

                    <a class="btn btn-dark dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                        <UserIcon/>
                    </a>
                    <div class="dropdown-menu dropdown-menu-end">
                        <a @click='$router.push("/profile")' class="dropdown-item">Profile</a>
                        <a @click='$router.push("/logout")' class="dropdown-item">Logout</a>
                    </div>
                </div>
            </div>
        </div>
    </header>
    <div class="navbar-expand-md">
        <div class="collapse navbar-collapse" id="navbar-menu">
            <div class="navbar navbar-light">
                <div class="container-xl">
                    <ul class="navbar-nav">
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
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <router-view/>
</div>
</template>

<script>
import '@tabler/core/dist/js/tabler.min.js';
import '@tabler/core/dist/css/tabler.min.css';
import {
    UserIcon,
    BellIcon,
    PlusIcon,
    UsersIcon,
    ShovelIcon,
    BugIcon,
    NotebookIcon,
    AmbulanceIcon,
} from 'vue-tabler-icons';

export default {
    name: 'Tak-PS-Stats',
    data: function() {
        return {
            err: false,
        }
    },
    components: {
        BugIcon,
        PlusIcon,
        UsersIcon,
        UserIcon,
        BellIcon,
        ShovelIcon,
        NotebookIcon,
        AmbulanceIcon
    }
}
</script>
