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
                            v-if='!is_iam("User:View")'
                            title='Certificates'
                        />
                        <CardCerts
                            v-else
                            :iam='iam'
                            :auth='auth'
                            :assigned='userid'
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import iam from '../iam.js'
import CardCerts from './cards/Certs.vue'
import NoAccess from './util/NoAccess.vue'
import {
    TablerBreadCrumb,
} from '@tak-ps/vue-tabler'

const props = defineProps({
    iam: {
        type: Object,
        required: true
    },
    auth: {
        type: Object,
        required: true
    }
})

const route = useRoute()

const userid = computed(() => route.name === 'profile' ? props.auth.id : parseInt(route.params.userid))

const is_iam = (permission) => iam(props.iam, props.auth, permission)
</script>
