<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col">
                        <h2 class="page-title">Home</h2>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div class="col-lg-6">
                    <IssuesCard/>
                </div>
            </div>
        </div>
    </div>

    <PageFooter/>
</div>
</template>

<script>
import IssuesCard from './cards/Issues.vue';
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
        IssuesCard
    }
}
</script>
