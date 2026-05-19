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
                        v-if='!is_iam("Rolodex:Manage")'
                        title='New Rolodex'
                    />
                    <TablerLoading v-if='loading.rolodex' />
                    <template v-else>
                        <div class='col-lg-12'>
                            <div class='card'>
                                <div class='card-header'>
                                    <h3
                                        v-if='$route.name === "rolodex-new"'
                                        class='card-title'
                                    >
                                        New Rolodex Item
                                    </h3>
                                    <h3
                                        v-else
                                        class='card-title'
                                        v-text='rolodex.name'
                                    />

                                    <div class='ms-auto btn-list'>
                                        <TablerIconButton
                                            v-if='$route.params.rolodexid && is_iam("Rolodex:Manage")'
                                            :icon='IconPencil'
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
                                <div
                                    v-if='$route.name === "rolodex-edit" || $route.name === "rolodex-new"'
                                    class='card-body'
                                >
                                    <div class='row row-cards'>
                                        <div class='col-md-12'>
                                            <TablerInput
                                                v-model='rolodex.name'
                                                :error='errors.name'
                                                :required='true'
                                                label='Name'
                                                description='A Human Readable name for the Rolodex Item'
                                            />
                                        </div>
                                        <div class='col-md-12'>
                                            <TablerInput
                                                v-model='rolodex.remarks'
                                                :rows='Math.max(2, rolodex.remarks.split("\n").length)'
                                                :required='false'
                                                label='Remarks'
                                                description='A Human Readable remarks for the rolodex'
                                            />
                                        </div>
                                        <div class='col-md-12'>
                                            <TablerInput
                                                v-model='rolodex.phone'
                                                :required='false'
                                                label='Phone Number'
                                                description='An associated phone number if applicable'
                                            />
                                        </div>
                                        <div class='col-md-12'>
                                            <TablerInput
                                                v-model='rolodex.email'
                                                :required='false'
                                                label='Email'
                                                description='An associated email if applicable'
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div
                                    v-else
                                    class='card-body'
                                >
                                    <div class='datagrid'>
                                        <div class='datagrid-item'>
                                            <div class='datagrid-title'>
                                                Remarks
                                            </div>
                                            <div
                                                class='datagrid-content'
                                                v-text='rolodex.remarks'
                                            />
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
                                    </div>
                                </div>

                                <div
                                    v-if='$route.name === "rolodex-edit" || $route.name === "rolodex-new"'
                                    class='col-12 py-1 pb-4 px-4'
                                >
                                    <div class='d-flex'>
                                        <a
                                            v-if='$route.params.rolodexid && is_iam("Rolodex:Admin")'
                                            class='cursor-pointer btn btn-danger'
                                            @click='deleteRolodex'
                                        >
                                            Delete Item
                                        </a>
                                        <div class='ms-auto'>
                                            <a
                                                v-if='$route.params.rolodexid'
                                                class='cursor-pointer btn btn-primary'
                                                @click='update'
                                            >
                                                Update Item
                                            </a>
                                            <a
                                                v-else
                                                class='cursor-pointer btn btn-primary'
                                                @click='create'
                                            >
                                                Create Item
                                            </a>
                                        </div>
                                    </div>
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
import iamHelper from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import {
    IconPencil
} from '@tabler/icons-vue';
import {
    TablerBreadCrumb,
    TablerIconButton,
    TablerInput,
    TablerLoading
} from '@tak-ps/vue-tabler';
import { reactive, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

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

const loading = reactive({
    rolodex: true
});
const errors = reactive({
    name: '',
});
const rolodex = reactive({
    name: '',
    remarks: '',
    body: '',
    phone: '',
    email: ''
});

function is_iam(permission) { return iamHelper(props.iam, props.auth, permission); }

async function deleteRolodex() {
    loading.rolodex = true;
    await window.std(`/api/rolodex/${route.params.rolodexid}`, {
        method: 'DELETE',
    });

    loading.rolodex = false;
    router.push('/rolodex');
}

function validate() {
    for (const field of ['name']) {
        if (!rolodex[field]) errors[field] = 'Cannot be empty';
        else errors[field] = '';
    }

    for (const e in errors) {
        if (errors[e]) return;
    }

    return true;
}

async function create() {
    if (!validate()) return;

    loading.rolodex = true;
    const created = await window.std('/api/rolodex', {
        method: 'POST',
        body: {
            ...rolodex,
        }
    });

    loading.rolodex = false;
    router.push(`/rolodex/${created.id}`);
}

async function update() {
    if (!validate()) return;

    loading.rolodex = true;
    await window.std(`/api/rolodex/${route.params.rolodexid}`, {
        method: 'PATCH',
        body: {
            name: rolodex.name,
            remarks: rolodex.remarks,
            phone: rolodex.phone,
            email: rolodex.email,
        }
    });

    loading.rolodex = false;
    router.push(`/rolodex/${route.params.rolodexid}`);
}

async function fetch() {
    loading.rolodex = true;
    Object.assign(rolodex, await window.std(`/api/rolodex/${route.params.rolodexid}`));
    loading.rolodex = false;
}

watch(route, async () => {
    if (route.params.rolodexid) {
        await fetch();
    }
});

onMounted(async () => {
    if (route.params.rolodexid && is_iam('Rolodex:Manage')) {
        await fetch();
    } else {
        loading.rolodex = false;
    }
});
</script>
