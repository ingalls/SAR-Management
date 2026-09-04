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
                    <NoAccess
                        v-if='!is_iam("Rolodex:View")'
                        title='Rolodex Item'
                    />
                    <TablerLoading v-else-if='loading' />
                    <template v-else>
                        <div class='col-lg-4'>
                            <div class='card'>
                                <RolodexProfile
                                    :rolodex='rolodex'
                                    :cache='cache'
                                    :height='320'
                                />
                                <div class='card-body'>
                                    <div class='d-flex align-items-center mb-2'>
                                        <span
                                            class='badge me-2'
                                            :class='typeClass(rolodex.type)'
                                            v-text='rolodex.type'
                                        />
                                        <TablerBadge
                                            v-if='rolodex.archived'
                                            background-color='#d63939'
                                            text-color='#ffffff'
                                        >
                                            Archived
                                        </TablerBadge>
                                    </div>

                                    <div class='subheader'>
                                        Shared With
                                    </div>
                                    <div
                                        v-if='!rolodex.agencies.length'
                                        class='text-secondary'
                                    >
                                        Everyone in the organization
                                    </div>
                                    <div
                                        v-for='agency in rolodex.agencies'
                                        v-else
                                        :key='agency.id'
                                        class='d-flex align-items-center my-1'
                                    >
                                        <img
                                            v-if='agency.logo'
                                            :src='agency.logo'
                                            :alt='agency.name'
                                            class='rounded me-2'
                                            style='width: 24px; height: 24px; object-fit: cover;'
                                        >
                                        <div v-text='agency.name' />
                                    </div>

                                    <template v-if='rolodex.tags.length'>
                                        <div class='subheader mt-3'>
                                            Tags
                                        </div>
                                        <div class='d-flex flex-wrap gap-1'>
                                            <span
                                                v-for='tag in rolodex.tags'
                                                :key='tag'
                                                class='badge bg-secondary-lt'
                                                v-text='tag'
                                            />
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>

                        <div class='col-lg-8'>
                            <div class='card'>
                                <div class='card-header'>
                                    <div>
                                        <h3
                                            class='card-title mb-0'
                                            v-text='rolodex.name'
                                        />
                                        <div
                                            v-if='rolodex.title || rolodex.organization'
                                            class='text-secondary'
                                            v-text='[rolodex.title, rolodex.organization].filter(Boolean).join(" · ")'
                                        />
                                    </div>

                                    <div class='ms-auto btn-list'>
                                        <TablerIconButton
                                            v-if='is_iam("Rolodex:Manage")'
                                            :title='"Edit " + rolodex.name'
                                            @click='$router.push(`/rolodex/${rolodex.id}/edit`)'
                                        >
                                            <IconPencil
                                                :size='32'
                                                stroke='1'
                                            />
                                        </TablerIconButton>
                                    </div>
                                </div>
                                <div class='card-body'>
                                    <div class='datagrid'>
                                        <div
                                            v-if='rolodex.phone'
                                            class='datagrid-item'
                                        >
                                            <div class='datagrid-title'>
                                                Phone
                                            </div>
                                            <div class='datagrid-content'>
                                                <a
                                                    :href='`tel:${rolodex.phone}`'
                                                    v-text='rolodex.phone'
                                                />
                                            </div>
                                        </div>
                                        <div
                                            v-if='rolodex.email'
                                            class='datagrid-item'
                                        >
                                            <div class='datagrid-title'>
                                                Email
                                            </div>
                                            <div class='datagrid-content'>
                                                <a
                                                    :href='`mailto:${rolodex.email}`'
                                                    v-text='rolodex.email'
                                                />
                                            </div>
                                        </div>
                                        <div
                                            v-if='rolodex.website'
                                            class='datagrid-item'
                                        >
                                            <div class='datagrid-title'>
                                                Website
                                            </div>
                                            <div class='datagrid-content'>
                                                <a
                                                    :href='websiteHref(rolodex.website)'
                                                    target='_blank'
                                                    rel='noopener'
                                                    v-text='rolodex.website'
                                                />
                                            </div>
                                        </div>
                                        <div
                                            v-if='rolodex.address'
                                            class='datagrid-item'
                                        >
                                            <div class='datagrid-title'>
                                                Address
                                            </div>
                                            <div
                                                class='datagrid-content'
                                                style='white-space: pre-line'
                                                v-text='rolodex.address'
                                            />
                                        </div>
                                        <div class='datagrid-item'>
                                            <div class='datagrid-title'>
                                                Created
                                            </div>
                                            <div class='datagrid-content'>
                                                <TablerEpoch :date='rolodex.created' />
                                            </div>
                                        </div>
                                        <div class='datagrid-item'>
                                            <div class='datagrid-title'>
                                                Updated
                                            </div>
                                            <div class='datagrid-content'>
                                                <TablerEpoch :date='rolodex.updated' />
                                            </div>
                                        </div>
                                    </div>

                                    <template v-if='rolodex.remarks'>
                                        <div class='subheader mt-4'>
                                            Remarks
                                        </div>
                                        <div
                                            style='white-space: pre-line'
                                            v-text='rolodex.remarks'
                                        />
                                    </template>
                                </div>

                                <div
                                    v-if='rolodex.location_geom'
                                    class='card-body p-0'
                                >
                                    <Location
                                        v-model='rolodex.location_geom'
                                        :search='false'
                                        :disabled='true'
                                    />
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>

        <TablerError
            v-if='err'
            :err='err'
            @close='err = null'
        />
    </div>
</template>

<script setup>
import iamHelper from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import Location from './Mission/Location.vue';
import RolodexProfile from './Rolodex/Profile.vue';
import {
    IconPencil
} from '@tabler/icons-vue';
import {
    TablerBreadCrumb,
    TablerIconButton,
    TablerBadge,
    TablerEpoch,
    TablerError,
    TablerLoading
} from '@tak-ps/vue-tabler';
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

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

const err = ref(null);
const loading = ref(true);
const cache = ref(+new Date());
const rolodex = reactive({
    id: null,
    type: 'person',
    name: '',
    title: '',
    organization: '',
    remarks: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    location_geom: null,
    tags: [],
    agencies: [],
    photo: false,
    archived: false
});

function is_iam(permission) { return iamHelper(props.iam, props.auth, permission); }

function typeClass(type) {
    if (type === 'person') return 'bg-blue-lt';
    if (type === 'place') return 'bg-green-lt';
    return 'bg-orange-lt';
}

function websiteHref(website) {
    return /^https?:\/\//i.test(website) ? website : `https://${website}`;
}

async function fetch() {
    loading.value = true;
    try {
        Object.assign(rolodex, await window.std(`/api/rolodex/${route.params.rolodexid}`));
        cache.value = +new Date();
    } catch (e) {
        err.value = e;
    }
    loading.value = false;
}

watch(() => route.params.rolodexid, async () => {
    if (route.params.rolodexid) await fetch();
});

onMounted(async () => {
    if (is_iam('Rolodex:View')) {
        await fetch();
    } else {
        loading.value = false;
    }
});
</script>
