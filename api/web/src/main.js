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

        { path: '/profile', name: 'profile', component: () => import('./components/Profile.vue') },

        { path: '/issue', name: 'issues', component: () => import('./components/Issues.vue') },
        { path: '/issue/new', name: 'issues-new', component: () => import('./components/IssuesNew.vue') },

        { path: '/equipment', name: 'equipment', component: () => import('./components/Equipments.vue') },
        { path: '/equipment/new', name: 'equipment-new', component: () => import('./components/EquipmentsNew.vue') },

        { path: '/doc', name: 'docs', component: () => import('./components/Docs.vue') },

        { path: '/mission', name: 'missions', component: () => import('./components/Missions.vue') },
    ]
});

window.api = window.location.origin

const app = createApp(App);
app.config.devtools = true
app.use(router);
app.use(FloatingVue);
app.mount('#app');
