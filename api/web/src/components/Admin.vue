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
                        <ServerConfig :auth='auth' />
                    </div>
                    <template v-if='auth.access === "admin"'>
                        <div class='col-lg-4'>
                            <CardRoles />
                        </div>
                        <div class='col-lg-4'>
                            <CardTags />
                        </div>
                        <div class='col-lg-4'>
                            <CardTrainingTags />
                        </div>
                        <div class='col-lg-4'>
                            <CardKnownCerts />
                        </div>
                        <div class='col-lg-4'>
                            <CardHeartbeat />
                        </div>
                        <div class='col-lg-4'>
                            <div class='card'>
                                <div class='card-header'>
                                    <h3 class='card-title'>
                                        Slack Management
                                    </h3>
                                </div>
                                <div class='card-body'>
                                    <p class='text-secondary'>
                                        Manage Slack channel memberships and audit team presence.
                                    </p>
                                    <a
                                        class='btn btn-primary'
                                        @click='$router.push("/admin/slack")'
                                    >
                                        <IconBrandSlack
                                            :size='20'
                                            class='me-2'
                                        />
                                        Channel Membership
                                    </a>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { IconBrandSlack } from '@tabler/icons-vue';
import CardRoles from './Admin/Roles.vue';
import CardTags from './Admin/Tags.vue';
import CardTrainingTags from './Admin/TrainingTags.vue';
import CardHeartbeat from './Admin/Heartbeat.vue';
import ServerConfig from './Admin/ServerConfig.vue';
import CardKnownCerts from './Admin/KnownCerts.vue';
import {
    TablerBreadCrumb
} from '@tak-ps/vue-tabler';

defineProps({
    iam: {
        type: Object,
        required: true
    },
    auth: {
        type: Object,
        required: true
    }
})
</script>
