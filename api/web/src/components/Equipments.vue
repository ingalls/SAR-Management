<template>
    <div>
        <div class='page-wrapper'>
            <div class='page-header d-print-none'>
                <div class='container-xl'>
                    <div class='row g-2 align-items-center'>
                        <div class='col d-flex'>
                            <TablerBreadCrumb />
                            <div
                                v-if='is_iam("Equipment:Manage")'
                                class='ms-auto'
                            >
                                <div class='btn-list'>
                                    <a
                                        class='cursor-pointer btn btn-secondary'
                                        @click='$router.push("/equipment/type")'
                                    >
                                        Types
                                    </a>
                                    <a
                                        class='cursor-pointer btn btn-primary'
                                        @click='$router.push("/equipment/new")'
                                    >
                                        New Gear
                                    </a>
                                </div>
                            </div>
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
                        <CardEquipment v-else />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import NoAccess from './util/NoAccess.vue';
import iam from '../iam.js';
import CardEquipment from './cards/Equipment.vue';
import {
    TablerBreadCrumb 
} from '@tak-ps/vue-tabler';

export default {
    name: 'Equipments',
    components: {
        NoAccess,
        TablerBreadCrumb,
        CardEquipment
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
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
    }
}
</script>
