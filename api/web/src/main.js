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

        { path: '/login', name: 'login', component: () => import('./components/Login.vue') },

        { path: '/profile', name: 'profile', component: () => import('./components/TeamUser.vue') },

        { path: '/issue', name: 'issues', component: () => import('./components/Issues.vue') },
        { path: '/issue/new', name: 'issues-new', component: () => import('./components/IssuesNew.vue') },
        { path: '/issue/:issueid', name: 'issue', component: () => import('./components/Issue.vue') },

        { path: '/equipment', name: 'equipment', component: () => import('./components/Equipments.vue') },
        { path: '/equipment/new', name: 'equipment-new', component: () => import('./components/EquipmentsNew.vue') },

        { path: '/doc', name: 'docs', component: () => import('./components/Docs.vue') },

        { path: '/calendar', name: 'calendar', component: () => import('./components/Calendar.vue') },

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
        { path: '/team/user/new', name: 'team-user-new', component: () => import('./components/TeamUserNew.vue') },
        { path: '/team/user/:userid', name: 'team-user', component: () => import('./components/TeamUser.vue') },
        { path: '/team/user/:userid/edit', name: 'team-user-edit', component: () => import('./components/TeamUserEdit.vue') },

        { path: '/(.*)', name: 'lost', component: () => import('./components/Lost.vue') },
    ]
});

window.api = window.location.origin

const app = createApp(App);
app.config.devtools = true
app.use(router);
app.use(FloatingVue);
app.mount('#app');
