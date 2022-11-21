<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a href="/">Home</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="/issue">Issues</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="#">New</a></li>
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
                        <div class="card-body">
                            <div class='row row-cards'>
                                <div class="col-md-10">
                                    <label class="form-label">Issue Title</label>
                                    <input type="text" class="form-control" placeholder="Issue Title">
                                </div>
                                <div class="col-md-2">
                                    <label class="form-label">Assigned</label>
                                    <label class="form-label">Labels</label>
                                </div>
                                <div class="col-md-10">
                                    <label class="form-label">Issue Title</label>
                                    <textarea class="form-control" rows="6" placeholder="Issue Content.."></textarea>
                                </div>

                                <div class="col-md-10">
                                    <div class='d-flex'>
                                        <div class='ms-auto'>
                                            <a @click='$router.push("/issue/new")' class="cursor-pointer btn btn-primary">
                                                <PlusIcon/>
                                                Create Issue
                                            </a>
                                        </div>
                                    </div>
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

export default {
    name: 'Issues',
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
