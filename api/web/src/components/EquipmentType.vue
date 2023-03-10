<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <BreadCrumb/>
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
                    <TablerLoading v-else-if='loading.type'/>
                    <template v-else>
                        <div class="card">
                            <div class='card-header'>
                                <h3 class='card-title' v-text='type.type'/>
                                <div class='ms-auto'>
                                    <SettingsIcon v-if='is_iam("Equipment:Admin")' @click='$router.push(`/equipment/type/${$route.params.typeid}/edit`)' class='cursor-pointer'/>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class='row row-cards'>
                                    <div class="col-md-12">
                                        <pre v-text='type.schema'/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import NoAccess from './util/NoAccess.vue';
import BreadCrumb from './util/BreadCrumb.vue';
import iam from '../iam.js';
import {
    TablerLoading
} from '@tak-ps/vue-tabler';
import {
    SettingsIcon
} from 'vue-tabler-icons';

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
                type: true
            },
            type: {},
        }
    },
    mounted: async function() {
        if (this.is_iam("Equipment:View")) await this.fetch();
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        fetch: async function() {
            this.loading.type = true;
            this.type = await window.std(`/api/equipment-type/${this.$route.params.typeid}`);
            this.loading.type = false;
        },
    },
    components: {
        NoAccess,
        BreadCrumb,
        TablerLoading,
        SettingsIcon
    }
}
</script>
