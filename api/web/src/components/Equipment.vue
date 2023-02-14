<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a @click='$router.push("/")' class="cursor-pointer">Home</a></li>
                            <li class="breadcrumb-item" aria-current="page"><a  @click='$router.push("/equipment")' class="cursor-pointer">Equipment</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="#" v-text='$route.params.equipid'></a></li>
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
                    <NoAccess v-if='!is_iam("Equipment:View")' title='Equipment'/>
                    <template v-else>
                        <div class="card">
                            <div class='card-header'>
                                <h3 class='card-title' v-text='equipment.name'/>
                            </div>
                            <div class="card-body">
                                <div class='row row-cards'>
                                    <div class="col-md-12" v-text='equipment.description'></div>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>

    <PageFooter/>
</div>
</template>

<script>
import NoAccess from './util/NoAccess.vue';
import iam from '../iam.js';
import PageFooter from './PageFooter.vue';

export default {
    name: 'Equipment',
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
    data: function() {
        return {
            loading: {
                equipment: true
            },
            equipment: {},
        }
    },
    mounted: async function() {
        if (this.is_iam("Equipment:View")) await this.fetch();
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        fetch: async function() {
            this.equipment = await window.std(`/api/equipment/${this.$route.params.equipid}`);
        },
    },
    components: {
        NoAccess,
        PageFooter,
    }
}
</script>
