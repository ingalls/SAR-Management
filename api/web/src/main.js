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
        { path: '/login/reset', name: 'login-reset', component: () => import('./components/Reset.vue') },

        { path: '/profile', name: 'profile', component: () => import('./components/User.vue') },

        { path: '/issue', name: 'issues', component: () => import('./components/Issues.vue') },
        { path: '/issue/new', name: 'issues-new', component: () => import('./components/IssuesNew.vue') },
        { path: '/issue/:issueid', name: 'issue', component: () => import('./components/Issue.vue') },

        { path: '/equipment', name: 'equipments', component: () => import('./components/Equipments.vue') },
        { path: '/equipment/type', name: 'equipment-types', component: () => import('./components/EquipmentTypes.vue') },
        { path: '/equipment/new', name: 'equipment-new', component: () => import('./components/EquipmentEdit.vue') },
        { path: '/equipment/:equipid', name: 'equipment', component: () => import('./components/Equipment.vue') },
        { path: '/equipment/:equipid/edit', name: 'equipment-edit', component: () => import('./components/EquipmentEdit.vue') },

        { path: '/doc', name: 'docs', component: () => import('./components/Docs.vue') },

        { path: '/calendar', name: 'calendar', component: () => import('./components/Calendar.vue') },

        { path: '/notification', name: 'notifications', component: () => import('./components/Notifications.vue') },

        { path: '/mission', name: 'missions', component: () => import('./components/Missions.vue') },
        { path: '/mission/new', name: 'missions-new', component: () => import('./components/MissionsNew.vue') },
        { path: '/mission/:missionid', name: 'mission', component: () => import('./components/Mission.vue') },

        { path: '/training', name: 'trainings', component: () => import('./components/Trainings.vue') },
        { path: '/training/new', name: 'trainings-new', component: () => import('./components/TrainingEdit.vue') },
        { path: '/training/:trainingid', name: 'training', component: () => import('./components/Training.vue') },
        { path: '/training/:trainingid/edit', name: 'training-edit', component: () => import('./components/TrainingEdit.vue') },

        { path: '/team', name: 'teams', component: () => import('./components/Teams.vue') },
        { path: '/team/new', name: 'teams-new', component: () => import('./components/TeamsNew.vue') },
        { path: '/team/:teamid', name: 'team', component: () => import('./components/Team.vue') },
        { path: '/team/:teamid/edit', name: 'team-edit', component: () => import('./components/TeamEdit.vue') },
        { path: '/team/leadership', name: 'team-leadership', component: () => import('./components/TeamLeadership.vue') },

        { path: '/user/new', name: 'user-new', component: () => import('./components/UserNew.vue') },
        { path: '/user', name: 'users', component: () => import('./components/Users.vue') },
        { path: '/user/:userid', name: 'user', component: () => import('./components/User.vue') },
        { path: '/user/:userid/edit', name: 'user-edit', component: () => import('./components/UserEdit.vue') },

        { path: '/admin', name: 'admin', component: () => import('./components/Admin.vue') },

        { path: '/:catchAll(.*)', name: 'lost', component: () => import('./components/Lost.vue') },
    ]
});

window.api = window.location.origin

const app = createApp(App);
app.config.devtools = true
app.use(router);
app.use(FloatingVue);
app.mount('#app');
