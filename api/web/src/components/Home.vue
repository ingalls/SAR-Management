<template>
<div>
    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div class="col-lg-6">
                    <IssuesCard :limit='5'/>
                </div>

                <div class="col-lg-6">
                    <TrainingsCard :limit='5'/>
                </div>
            </div>
        </div>
    </div>

    <PageFooter/>
</div>
</template>

<script>
import IssuesCard from './cards/Issues.vue';
import TrainingsCard from './cards/Trainings.vue';
import PageFooter from './PageFooter.vue';

export default {
    name: 'Home',
    data: function() {
        return {
            err: false,
        }
    },
    components: {
        PageFooter,
        IssuesCard,
        TrainingsCard
    }
}
</script>
