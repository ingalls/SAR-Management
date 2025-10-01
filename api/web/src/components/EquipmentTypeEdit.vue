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
                            v-if='!is_iam("Equipment:Admin")'
                            title='Equipment Type Editing'
                        />
                        <div
                            v-else
                            class='card'
                        >
                            <TablerLoading v-if='loading.type' />
                            <div
                                v-else
                                class='card-body'
                            >
                                <div class='row row-cards'>
                                    <div class='col-md-12'>
                                        <TablerInput
                                            v-model='type.type'
                                            label='Equipment Type'
                                            :error='errors.type'
                                        />

                                        <TablerInput
                                            v-model='type.schema'
                                            :rows='10'
                                            label='Equipment Schema'
                                            :error='errors.schema'
                                        />
                                    </div>

                                    <div class='col-md-12'>
                                        <div class='d-flex'>
                                            <div class='ms-auto'>
                                                <a
                                                    class='cursor-pointer btn btn-primary'
                                                    @click='save'
                                                >
                                                    <span v-text='$route.params.typeid ? "Update Type" : "Create Type"' />
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
    </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
    TablerBreadCrumb,
    TablerLoading,
    TablerInput
} from '@tak-ps/vue-tabler'
import NoAccess from './util/NoAccess.vue';
import iamHelper from '../iam.js';

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

const loading = reactive({
    type: false,
})

const errors = reactive({
    type: '',
    schema: ''
})

const type = reactive({
    type: '',
    schema: ''
})

function is_iam(permission) { 
    return iamHelper(props.iam, props.auth, permission) 
}

async function fetch() {
    loading.type = true;
    const result = await window.std(`/api/equipment-type/${route.params.typeid}`);
    result.schema = JSON.stringify(result.schema, null, 4);
    Object.assign(type, result);
    loading.type = false;
}

async function save() {
    for (const field of ['type', 'schema']) {
        if (!type[field]) errors[field] = 'Cannot be empty';
        else errors[field] = false;
    }

    try {
        JSON.parse(type.schema);
        errors.schema = '';
    } catch (err) {
        errors.schema = `Invalid JSON: ${err.message}`;
    }

    for (const e in errors) {
        if (errors[e]) return;
    }

    loading.type = true;

    if (route.params.typeid) {
        await window.std(`/api/equipment-type/${route.params.typeid}`, {
            method: 'PATCH',
            body: {
                type: type.type,
                schema: JSON.parse(type.schema)
            }
        })

        loading.type = false;
        router.push(`/equipment/type/${route.params.typeid}`);
    } else {
        const result = await window.std('/api/equipment-type', {
            method: 'POST',
            body: {
                type: type.type,
                schema: JSON.parse(type.schema)
            }
        })

        loading.type = false;
        router.push(`/equipment/type/${result.id}`);
    }
}

onMounted(async () => {
    if (is_iam("Equipment:Manage") && route.params.typeid) {
        await fetch();
    }
})

defineExpose({
    save
})
</script>
