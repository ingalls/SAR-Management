<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a @click='$router.push("/")' class="cursor-pointer">Home</a></li>
                            <li class="breadcrumb-item" aria-current="page"><a  @click='$router.push("/mission")' class="cursor-pointer">Mission</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="#" v-text='mission.id'></a></li>
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
                            <h3 class='card-title' v-text='mission.title'/>

                            <div class='ms-auto'>
                                <span class='' v-text='mission.start_ts'/> - <span class='' v-text='mission.end_ts'/>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class='row row-cards'>
                                <div class="col-md-12" v-text='mission.body'></div>

                                <div class='col-md-12'>
                                    <Location/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <PageFooter/>
</div>
</template>

<script>
import PageFooter from './PageFooter.vue';
import Location from './Mission/Location.vue';

export default {
    name: 'MissionsNew',
    data: function() {
        return {
            err: false,
            mission: {
                title: '',
                body: '',
                start_ts: '',
                end_ts: ''
            }
        }
    },
    mounted: async function() {
        await this.fetch();
    },
    methods: {
        fetch: async function() {
            this.mission = await window.std(`/api/mission/${this.$route.params.missionid}`);
        }
    },
    components: {
        Location,
        PageFooter,
    }
}
</script>