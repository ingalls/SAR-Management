<template>
    <div>
        <div class='page-wrapper'>
            <div class='page-header d-print-none'>
                <div class='container-xl'>
                    <div class='row g-2 align-items-center'>
                        <div class='col d-flex'>
                            <TablerBreadCrumb />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class='page-body'>
            <div class='container-xl'>
                <div class='row row-deck row-cards'>
                    <NoAccess
                        v-if='!is_iam("Team:View")'
                        title='Team'
                    />
                    <template v-else>
                        <div class='col-lg-12'>
                            <div class='card'>
                                <template v-if='loading.team'>
                                    <TablerLoading desc='Loading Team' />
                                </template>
                                <template v-else>
                                    <div class='card-header'>
                                        <h3
                                            class='card-title'
                                            v-text='team.name'
                                        />

                                        <div class='ms-auto'>
                                            <div class='btn-list'>
                                                <span
                                                    v-if='team.fieldable'
                                                    class='ms-auto badge bg-green text-white'
                                                    style='height: 20px;'
                                                >Fieldable</span>
                                                <TeamBadge :team='team' />

                                                <button
                                                    data-bs-toggle='dropdown'
                                                    type='button'
                                                    class='btn dropdown-toggle dropdown-toggle-split'
                                                    aria-expanded='false'
                                                />
                                                <div
                                                    class='dropdown-menu dropdown-menu-end'
                                                    style=''
                                                >
                                                    <a
                                                        class='dropdown-item cursor-pointer'
                                                        @click='$router.push(`/team/${$route.params.teamid}/edit`)'
                                                    >Edit</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        class='card-body'
                                        v-text='team.body'
                                    />
                                </template>
                            </div>
                        </div>

                        <div class='col-lg-12'>
                            <CardUsers
                                v-if='team.id'
                                :dropdown='false'
                                :url='`/api/team/${$route.params.teamid}/user`'
                                :edit='is_iam("Team:Manage")'
                            />
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import NoAccess from './util/NoAccess.vue';
import TeamBadge from './util/TeamBadge.vue';
import iamHelper from '../iam.js';
import CardUsers from './cards/Users.vue';
import {
    TablerBreadCrumb,
    TablerLoading
} from '@tak-ps/vue-tabler';

const route = useRoute();

const props = defineProps({
    iam: {
        type: Object,
        required: true
    },
    auth: {
        type: Object,
        required: true
    }
})

const loading = reactive({
    team: true
})

const team = reactive({
    id: null,
    name: '',
    body: ''
})

function is_iam(permission) { 
    return iamHelper(props.iam, props.auth, permission) 
}

async function fetch() {
    loading.team = true;
    const result = await window.std(`/api/team/${route.params.teamid}`);
    team.id = result.id;
    team.name = result.name;
    team.body = result.body;
    team.fieldable = result.fieldable;
    loading.team = false;
}

onMounted(async () => {
    if (is_iam("Team:View")) await fetch();
})
</script>
