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
                        v-if='!is_iam("User:View")'
                        title='Certificate'
                    />
                    <template v-else>
                        <div class='col-md-12'>
                            <div class='card'>
                                <TablerLoading v-if='loading.cert' />
                                <template v-else>
                                    <div class='card-header d-flex align-items-center'>
                                        <h3
                                            class='card-title'
                                            v-text='cert.name'
                                        />

                                        <div class='ms-auto btn-list'>
                                            <IconDownload
                                                v-tooltip='"Download File"'
                                                class='cursor-pointer'
                                                :stroke='1'
                                                :size='32'
                                                @click='download'
                                            />
                                            <TablerDelete
                                                displaytype='icon'
                                                @delete='deleteCert'
                                            />
                                        </div>
                                    </div>
                                    <div class='card-body'>
                                        <div v-if='loading.cert'>
                                            <TablerLoading desc='Loading Preview' />
                                        </div>
                                        <img
                                            v-else-if='is_img'
                                            :src='preview'
                                        >
                                        <embed
                                            v-else-if='is_pdf'
                                            :src='preview'
                                            width='100%'
                                            height='1000px'
                                        >
                                        <div v-else>
                                            <div class='d-flex justify-content-center mt-4 mb-2'>
                                                <IconEyeOff
                                                    :size='48'
                                                    :stroke='1'
                                                />
                                            </div>

                                            <div class='text-center mb-4 mt-2'>
                                                <div>Unsupported Preview Format</div>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import iamHelper from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import DocFile from './Docs/File.vue';
import {
    IconEyeOff,
    IconDownload
} from '@tabler/icons-vue';
import {
    TablerBreadCrumb,
    TablerDelete,
    TablerLoading,
} from '@tak-ps/vue-tabler'
import Avatar from './util/Avatar.vue';

const route = useRoute();
const router = useRouter();

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

const cert = reactive({
    id: '',
})

const asset = ref(null)

const loading = reactive({
    cert: true,
})

const is_img = computed(() => {
    if (!asset.value) return false;
    return asset.value.name.toLowerCase().endsWith('.jpg')
        || asset.value.name.toLowerCase().endsWith('.jpeg')
        || asset.value.name.toLowerCase().endsWith('.png')
})

const is_pdf = computed(() => {
    if (!asset.value) return false;
    return asset.value.name.endsWith('.pdf')
})

const preview = computed(() => {
    const url = window.stdurl(`/api/asset/${cert.asset}/raw`);
    url.searchParams.append('token', localStorage.token);
    return url;
})

function is_iam(permission) { 
    return iamHelper(props.iam, props.auth, permission) 
}

async function deleteCert() {
    loading.cert = true;

    await window.std(`/api/user/${route.params.userid}/cert/${route.params.certid}`, {
        method: 'DELETE'
    });

    router.push(`/user/${route.params.userid}/cert/`);
}

function url(download = true) {
    const url = window.stdurl(`/api/asset/${cert.asset}/raw`);
    url.searchParams.append('download', download);
    url.searchParams.append('token', localStorage.token);
    return String(url);
}

function download() {
    window.open(url(true), '_blank');
}

async function fetch() {
    loading.cert = true;
    const certResult = await window.std(`/api/user/${route.params.userid}/cert/${route.params.certid}`);
    Object.assign(cert, certResult);
    asset.value = await window.std(`/api/asset/${cert.asset}`);
    loading.cert = false;
}

onMounted(async () => {
    if (is_iam("User:View")) {
        await fetch();
    }
})

defineExpose({
    deleteCert,
    download
})
</script>
