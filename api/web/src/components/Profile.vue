<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a @click='$router.push("/")' class='cursor-pointer'>Home</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="#">Profile</a></li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <div class='page-body'>
    </div>

    <PageFooter/>
</div>
</template>

<script>
import PageFooter from './PageFooter.vue';

export default {
    name: 'Profile',
    data: function() {
        return {
            err: false,
        }
    },
    components: {
        PageFooter,
    }
}
</script>
