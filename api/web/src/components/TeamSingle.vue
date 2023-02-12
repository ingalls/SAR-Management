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
                            <li class="breadcrumb-item active" aria-current="page"><a href="#" v-text='$route.params.teamid'></a></li>
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
                        <div class='card-header'>
                            <h3 class='card-title' v-text='team.name'></h3>

                            <div class='ms-auto'>
                                <div class='btn-list'>
                                    <button data-bs-toggle="dropdown" type="button" class="btn dropdown-toggle dropdown-toggle-split" aria-expanded="false"></button>
                                    <div class="dropdown-menu dropdown-menu-end" style="">
                                        <a @click='$router.push(`/team/${$route.params.teamid}/edit`)' class="dropdown-item cursor-pointer">Edit</a>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div class="card-body" v-text='team.body'></div>
                    </div>
                </div>

                <CardUsers
                    v-if='team.id'
                    :team='team.id'
                    :dropdown='false'
                />
            </div>
        </div>
    </div>

    <PageFooter/>
</div>
</template>

<script>
import PageFooter from './PageFooter.vue';
import CardUsers from './cards/Users.vue';

export default {
    name: 'TeamSingle',
    data: function() {
        return {
            team: {
                id: null,
                name: '',
                body: ''
            }
        }
    },
    mounted: async function() {
        await this.fetch();
    },
    methods: {
        fetch: async function() {
            this.team = await window.std(`/api/team/${this.$route.params.teamid}`);
        }
    },
    components: {
        PageFooter,
        CardUsers
    }
}
</script>
