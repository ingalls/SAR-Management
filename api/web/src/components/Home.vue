<template>
<div>
    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div class="col-lg-6">
                    <IssuesCard v-if='is_iam("Issue:View")' :limit='5'/>
                    <NoAccess title='Recent Issues' v-else/>
                </div>

                <div class="col-lg-6">
                    <TrainingsCard v-if='is_iam("Training:View")' :limit='5'/>
                    <NoAccess title='Upcoming Trainings' v-else/>
                </div>
            </div>
        </div>
    </div>

    <PageFooter/>
</div>
</template>

<script>
import iam from '../iam.js';
import IssuesCard from './cards/Issues.vue';
import TrainingsCard from './cards/Trainings.vue';
import PageFooter from './PageFooter.vue';
import NoAccess from './util/NoAccess.vue';

export default {
    name: 'Home',
    props: {
        iam: {
            type: Object,
            required: true
        },
        auth: {
            type: Object,
            required: true
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) }
    },
    components: {
        PageFooter,
        IssuesCard,
        TrainingsCard,
        NoAccess
    }
}
</script>
