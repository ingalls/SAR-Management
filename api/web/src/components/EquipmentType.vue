<template>
    <div>
        <div class='page-wrapper'>
            <div class='page-header d-print-none'>
                <div class='container-xl'>
                    <div class='row g-2 align-items-center'>
                        <div class='col d-flex'>
                            <TablerBreadCrumb />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class='page-body'>
            <div class='container-xl'>
                <div class='row row-deck row-cards'>
                    <div class='col-lg-12'>
                        <NoAccess
                            v-if='!is_iam("Equipment:View")'
                            title='Equipment'
                        />
                        <TablerLoading v-else-if='loading.type' />
                        <template v-else>
                            <div class='card'>
                                <div class='card-header'>
                                    <h3
                                        class='card-title'
                                        v-text='type.type'
                                    />
                                    <div class='ms-auto'>
                                        <IconSettings
                                            v-if='is_iam("Equipment:Admin")'
                                            :size='32'
                                            stroke='1'
                                            class='cursor-pointer'
                                            @click='$router.push(`/equipment/type/${$route.params.typeid}/edit`)'
                                        />
                                    </div>
                                </div>
                                <div class='card-body'>
                                    <div class='row row-cards'>
                                        <div class='col-md-12'>
                                            <pre v-text='type.schema' />
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
import iam from '../iam.js';
import {
    TablerBreadCrumb,
    TablerLoading
} from '@tak-ps/vue-tabler';
import {
    IconSettings
} from '@tabler/icons-vue';

export default {
    name: 'Equipment',
    components: {
        NoAccess,
        TablerBreadCrumb,
        TablerLoading,
        IconSettings
    },
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
    }
}
</script>
