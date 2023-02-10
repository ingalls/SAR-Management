import { createApp } from 'vue'
import * as VueRouter from 'vue-router'

import 'floating-vue/dist/style.css'
import FloatingVue from 'floating-vue'

import App from './App.vue'

import std from './std.js';
std();

const router = new VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes: [
        { path: '/', name: 'home', component: () => import('./components/Home.vue') },

        { path: '/logout', name: 'logout', component: () => import('./components/Logout.vue') },

        { path: '/login', name: 'login', component: () => import('./components/Login.vue') },
        { path: '/login/forgot', name: 'login-forgot', component: () => import('./components/Forgot.vue') },
        { path: '/login/verify', name: 'login-verify', component: () => import('./components/Verify.vue') },
        { path: '/login/reset', name: 'login-reset', component: () => import('./components/Reset.vue') },

        { path: '/profile', name: 'profile', component: () => import('./components/User.vue') },

        { path: '/issue', name: 'issues', component: () => import('./components/Issues.vue') },
        { path: '/issue/new', name: 'issues-new', component: () => import('./components/IssuesNew.vue') },
        { path: '/issue/:issueid', name: 'issue', component: () => import('./components/Issue.vue') },

        { path: '/equipment', name: 'equipment', component: () => import('./components/Equipments.vue') },
        { path: '/equipment/new', name: 'equipment-new', component: () => import('./components/EquipmentsNew.vue') },
        { path: '/equipment/:equipid', name: 'equipment', component: () => import('./components/Equipment.vue') },

        { path: '/doc', name: 'docs', component: () => import('./components/Docs.vue') },

        { path: '/calendar', name: 'calendar', component: () => import('./components/Calendar.vue') },

        { path: '/notification', name: 'notifications', component: () => import('./components/Notifications.vue') },

        { path: '/mission', name: 'missions', component: () => import('./components/Missions.vue') },
        { path: '/mission/new', name: 'missions-new', component: () => import('./components/MissionsNew.vue') },
        { path: '/mission/:missionid', name: 'mission', component: () => import('./components/Mission.vue') },

        { path: '/training', name: 'trainings', component: () => import('./components/Trainings.vue') },
        { path: '/training/new', name: 'trainings-new', component: () => import('./components/TrainingsNew.vue') },
        { path: '/training/:trainingid', name: 'training', component: () => import('./components/Training.vue') },

        { path: '/team', name: 'team', component: () => import('./components/Team.vue') },
        { path: '/team/new', name: 'team-single-new', component: () => import('./components/TeamSingleNew.vue') },
        { path: '/team/:teamid', name: 'team-single', component: () => import('./components/TeamSingle.vue') },
        { path: '/team/:teamid/edit', name: 'team-single-edit', component: () => import('./components/TeamSingleEdit.vue') },
        { path: '/team/leadership', name: 'team-leadership', component: () => import('./components/TeamLeadership.vue') },

        { path: '/user/new', name: 'user-new', component: () => import('./components/UserNew.vue') },
        { path: '/user', name: 'users', component: () => import('./components/Users.vue') },
        { path: '/user/:userid', name: 'user', component: () => import('./components/User.vue') },
        { path: '/user/:userid/edit', name: 'user-edit', component: () => import('./components/UserEdit.vue') },

        { path: '/admin', name: 'admin', component: () => import('./components/Admin.vue') },

        { path: '/(.*)', name: 'lost', component: () => import('./components/Lost.vue') },
    ]
});

window.api = window.location.origin

const app = createApp(App);
app.config.devtools = true
app.use(router);
app.use(FloatingVue);
app.mount('#app');
