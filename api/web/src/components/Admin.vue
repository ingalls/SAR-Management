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
                        <div class='card'>
                            <TablerLoading v-if='isAdmin === undefined' />
                            <TablerAlert
                                v-else-if='!isAdmin'
                                :err='new Error("Insufficient Access")'
                            />
                            <div
                                v-else
                                style='height: 100%;'
                                class='row g-0'
                            >
                                <div class='col-12 col-md-3 border-end'>
                                    <div class='card-body'>
                                        <h4 class='subheader user-select-none'>
                                            Team Management Admin
                                        </h4>
                                        <div
                                            role='menu'
                                            class='list-group list-group-transparent'
                                        >
                                            <span
                                                tabindex='0'
                                                role='menuitem'
                                                class='list-group-item list-group-item-action d-flex align-items-center user-select-none'
                                                :class='{
                                                    "active": String(route.name) === "admin-server",
                                                    "cursor-pointer": String(route.name) !== "admin-server"
                                                }'
                                                @keyup.enter='router.push(`/admin/server`)'
                                                @click='router.push(`/admin/server`)'
                                            >
                                                <IconSettings
                                                    :size='32'
                                                    stroke='1'
                                                />
                                                <span class='mx-3'>Server Settings</span>
                                            </span>
                                            <span
                                                tabindex='0'
                                                role='menuitem'
                                                class='list-group-item list-group-item-action d-flex align-items-center user-select-none'
                                                :class='{
                                                    "active": String(route.name) === "admin-roles",
                                                    "cursor-pointer": String(route.name) !== "admin-roles"
                                                }'
                                                @keyup.enter='router.push(`/admin/roles`)'
                                                @click='router.push(`/admin/roles`)'
                                            >
                                                <IconShield
                                                    :size='32'
                                                    stroke='1'
                                                />
                                                <span class='mx-3'>Mission Roles</span>
                                            </span>
                                            <span
                                                tabindex='0'
                                                role='menuitem'
                                                class='list-group-item list-group-item-action d-flex align-items-center user-select-none'
                                                :class='{
                                                    "active": String(route.name) === "admin-tags",
                                                    "cursor-pointer": String(route.name) !== "admin-tags"
                                                }'
                                                @keyup.enter='router.push(`/admin/tags`)'
                                                @click='router.push(`/admin/tags`)'
                                            >
                                                <IconTags
                                                    :size='32'
                                                    stroke='1'
                                                />
                                                <span class='mx-3'>Mission Tags</span>
                                            </span>
                                            <span
                                                tabindex='0'
                                                role='menuitem'
                                                class='list-group-item list-group-item-action d-flex align-items-center user-select-none'
                                                :class='{
                                                    "active": String(route.name) === "admin-training-tags",
                                                    "cursor-pointer": String(route.name) !== "admin-training-tags"
                                                }'
                                                @keyup.enter='router.push(`/admin/training-tags`)'
                                                @click='router.push(`/admin/training-tags`)'
                                            >
                                                <IconSchool
                                                    :size='32'
                                                    stroke='1'
                                                />
                                                <span class='mx-3'>Training Tags</span>
                                            </span>
                                            <span
                                                tabindex='0'
                                                role='menuitem'
                                                class='list-group-item list-group-item-action d-flex align-items-center user-select-none'
                                                :class='{
                                                    "active": String(route.name) === "admin-certs",
                                                    "cursor-pointer": String(route.name) !== "admin-certs"
                                                }'
                                                @keyup.enter='router.push(`/admin/certs`)'
                                                @click='router.push(`/admin/certs`)'
                                            >
                                                <IconCertificate
                                                    :size='32'
                                                    stroke='1'
                                                />
                                                <span class='mx-3'>Known Certificates</span>
                                            </span>
                                            <span
                                                tabindex='0'
                                                role='menuitem'
                                                class='list-group-item list-group-item-action d-flex align-items-center user-select-none'
                                                :class='{
                                                    "active": String(route.name) === "admin-heartbeat",
                                                    "cursor-pointer": String(route.name) !== "admin-heartbeat"
                                                }'
                                                @keyup.enter='router.push(`/admin/heartbeat`)'
                                                @click='router.push(`/admin/heartbeat`)'
                                            >
                                                <IconHeartbeat
                                                    :size='32'
                                                    stroke='1'
                                                />
                                                <span class='mx-3'>Heartbeats</span>
                                            </span>
                                            <span
                                                tabindex='0'
                                                role='menuitem'
                                                class='list-group-item list-group-item-action d-flex align-items-center user-select-none'
                                                :class='{
                                                    "active": String(route.name) === "admin-slack",
                                                    "cursor-pointer": String(route.name) !== "admin-slack"
                                                }'
                                                @keyup.enter='router.push(`/admin/slack`)'
                                                @click='router.push(`/admin/slack`)'
                                            >
                                                <IconBrandSlack
                                                    :size='32'
                                                    stroke='1'
                                                />
                                                <span class='mx-3'>Slack Management</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    class='col-12 col-md-9 position-relative'
                                    style='height: 100%;'
                                >
                                    <router-view
                                        :auth='auth'
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
    IconSettings,
    IconShield,
    IconTags,
    IconSchool,
    IconCertificate,
    IconHeartbeat,
    IconBrandSlack,
} from '@tabler/icons-vue';
import {
    TablerBreadCrumb,
    TablerLoading,
    TablerAlert,
} from '@tak-ps/vue-tabler';

const props = defineProps({
    iam: {
        type: Object,
        required: true
    },
    auth: {
        type: Object,
        required: true
    }
});

const route = useRoute();
const router = useRouter();
const isAdmin = ref(undefined);

onMounted(async () => {
    isAdmin.value = props.auth && props.auth.access === 'admin';
});
</script>
