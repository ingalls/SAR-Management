<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a @click='$router.push("/")' class='cursor-pointer'>Home</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="#">Team</a></li>
                        </ol>

                        <div class='ms-auto'>
                            <a @click='$router.push("/user/new")' class="cursor-pointer btn btn-primary">
                                New User
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div class="col-lg-12">
                    <CardLeadership/>
                </div>
                <div class="col-lg-12">
                    <CardTeams/>
                </div>
                <div class="col-lg-12">
                    <CardUsers/>
                </div>
            </div>
        </div>
    </div>

    <PageFooter/>
</div>
</template>

<script>
import PageFooter from './PageFooter.vue';
import CardLeadership from './cards/Leadership.vue';
import CardUsers from './cards/Users.vue';
import CardTeams from './cards/Teams.vue';

export default {
    name: 'Team',
    components: {
        PageFooter,
        CardLeadership,
        CardUsers,
        CardTeams
    }
}
</script>
