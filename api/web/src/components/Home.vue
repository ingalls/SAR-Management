<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col">
                        <h2 class="page-title">Charts</h2>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div class="col-lg-12">
                    <RegisteredCard/>
                </div>

                <div class="col-lg-6">
                    <LocationCard/>
                </div>

                <div class="col-lg-6">
                    <TopStatsCard/>
                </div>
            </div>
        </div>
    </div>

    <PageFooter/>
</div>
</template>

<script>
import RegisteredCard from './cards/Registered.vue';
import LocationCard from './cards/Location.vue';
import TopStatsCard from './cards/TopStats.vue';
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
        TopStatsCard,
        RegisteredCard,
        LocationCard
    }
}
</script>
