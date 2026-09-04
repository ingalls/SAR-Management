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
                        title='Rolodex'
                    />
                    <TablerLoading v-else-if='loading.rolodex' />
                    <template v-else>
                        <div class='col-lg-12'>
                            <div class='card'>
                                <div class='card-header'>
                                    <h3
                                        v-if='isNew'
                                        class='card-title'
                                    >
                                        New Rolodex Item
                                    </h3>
                                    <h3
                                        v-else
                                        class='card-title'
                                        v-text='rolodex.name'
                                    />
                                </div>
                                <div class='card-body'>
                                    <div class='row row-cards'>
                                        <div
                                            class='col-12'
                                            :class='{ "col-md-9": !isNew }'
                                        >
                                            <div class='row row-cards'>
                                                <div class='col-md-4'>
                                                    <TablerEnum
                                                        v-model='rolodex.type'
                                                        label='Type'
                                                        description='Whether this entry describes a person, a place or a thing'
                                                        :options='["person", "place", "thing"]'
                                                    />
                                                </div>
                                                <div class='col-md-8'>
                                                    <TablerInput
                                                        v-model='rolodex.name'
                                                        :error='errors.name'
                                                        :required='true'
                                                        label='Name'
                                                        description='A Human Readable name for the Rolodex Item'
                                                    />
                                                </div>
                                                <div class='col-md-6'>
                                                    <TablerInput
                                                        v-model='rolodex.title'
                                                        label='Title / Role'
                                                        description='Job title, role, or short descriptor'
                                                    />
                                                </div>
                                                <div class='col-md-6'>
                                                    <TablerInput
                                                        v-model='rolodex.organization'
                                                        label='Organization'
                                                        description='Company, agency or group this item belongs to'
                                                    />
                                                </div>
                                                <div class='col-md-6'>
                                                    <TablerInput
                                                        v-model='rolodex.phone'
                                                        :error='errors.phone'
                                                        label='Phone Number'
                                                        description='An associated phone number if applicable'
                                                    />
                                                </div>
                                                <div class='col-md-6'>
                                                    <TablerInput
                                                        v-model='rolodex.email'
                                                        :error='errors.email'
                                                        label='Email'
                                                        description='An associated email if applicable'
                                                    />
                                                </div>
                                                <div class='col-md-6'>
                                                    <TablerInput
                                                        v-model='rolodex.website'
                                                        label='Website'
                                                        description='An associated website if applicable'
                                                    />
                                                </div>
                                                <div class='col-md-6'>
                                                    <TablerInput
                                                        v-model='rolodex.address'
                                                        :rows='Math.max(2, rolodex.address.split("\n").length)'
                                                        label='Address'
                                                        description='Mailing or physical address'
                                                    />
                                                </div>
                                                <div class='col-md-12'>
                                                    <TablerInput
                                                        v-model='rolodex.remarks'
                                                        :rows='Math.max(3, rolodex.remarks.split("\n").length)'
                                                        label='Remarks'
                                                        description='Free form notes about this item'
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            v-if='!isNew'
                                            class='col-12 col-md-3'
                                        >
                                            <RolodexProfile
                                                :rolodex='rolodex'
                                                :cache='cache'
                                                :height='260'
                                            />

                                            <div class='d-flex justify-content-center btn-list mt-2'>
                                                <a
                                                    class='cursor-pointer btn btn-secondary'
                                                    @click='upload = true'
                                                >Update Photo</a>
                                                <a
                                                    v-if='rolodex.photo'
                                                    class='cursor-pointer btn btn-outline-danger'
                                                    @click='removePhoto'
                                                >Remove</a>
                                            </div>
                                        </div>
                                        <div
                                            v-else
                                            class='col-12'
                                        >
                                            <div class='alert alert-info mb-0'>
                                                A photo can be attached once the item has been created.
                                            </div>
                                        </div>

                                        <div class='col-md-6'>
                                            <AgencySelect
                                                v-model='rolodex.agencies'
                                                label='Shared With Agencies'
                                                :user-id='auth.id'
                                            />
                                            <div class='text-secondary small'>
                                                Members of the selected agencies can see this item. Leave empty to share it with everyone in the organization.
                                            </div>
                                        </div>
                                        <div class='col-md-6'>
                                            <div class='subheader mb-2'>
                                                Tags
                                            </div>
                                            <div class='d-flex flex-wrap gap-1 mb-2'>
                                                <span
                                                    v-for='(tag, t_idx) in rolodex.tags'
                                                    :key='tag'
                                                    class='badge bg-secondary-lt d-inline-flex align-items-center'
                                                >
                                                    <span v-text='tag' />
                                                    <IconX
                                                        :size='14'
                                                        :stroke='1'
                                                        class='ms-1 cursor-pointer'
                                                        @click='rolodex.tags.splice(t_idx, 1)'
                                                    />
                                                </span>
                                                <span
                                                    v-if='!rolodex.tags.length'
                                                    class='text-secondary small'
                                                >No tags yet</span>
                                            </div>
                                            <div class='input-group'>
                                                <input
                                                    v-model='tagInput'
                                                    type='text'
                                                    class='form-control'
                                                    placeholder='Add a tag and press Enter'
                                                    list='rolodex-tag-suggestions'
                                                    @keydown.enter.prevent='addTag'
                                                >
                                                <button
                                                    class='btn'
                                                    type='button'
                                                    @click='addTag'
                                                >
                                                    Add
                                                </button>
                                                <datalist id='rolodex-tag-suggestions'>
                                                    <option
                                                        v-for='tag in tagSuggestions'
                                                        :key='tag.tag'
                                                        :value='tag.tag'
                                                    />
                                                </datalist>
                                            </div>
                                        </div>

                                        <div class='col-md-12'>
                                            <div class='d-flex align-items-center mb-2'>
                                                <div class='subheader mb-0'>
                                                    Location
                                                </div>
                                                <a
                                                    v-if='rolodex.location_geom'
                                                    class='ms-auto cursor-pointer small'
                                                    @click='rolodex.location_geom = null'
                                                >Clear Location</a>
                                            </div>
                                            <div class='text-secondary small mb-2'>
                                                Search or click the map to pin a location for this item
                                            </div>
                                            <Location
                                                v-model='rolodex.location_geom'
                                                :disabled='false'
                                            />
                                        </div>

                                        <div
                                            v-if='!isNew'
                                            class='col-md-12'
                                        >
                                            <TablerToggle
                                                v-model='rolodex.archived'
                                                label='Archived'
                                                description='Archived items are hidden from the default rolodex listing'
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div class='card-footer'>
                                    <div class='d-flex'>
                                        <TablerDelete
                                            v-if='!isNew && is_iam("Rolodex:Admin")'
                                            label='Delete Item'
                                            @delete='deleteRolodex'
                                        />
                                        <div class='ms-auto btn-list'>
                                            <a
                                                class='cursor-pointer btn btn-secondary'
                                                @click='$router.push(isNew ? "/rolodex" : `/rolodex/${route.params.rolodexid}`)'
                                            >Cancel</a>
                                            <a
                                                v-if='!isNew'
                                                class='cursor-pointer btn btn-primary'
                                                @click='update'
                                            >Update Item</a>
                                            <a
                                                v-else
                                                class='cursor-pointer btn btn-primary'
                                                @click='create'
                                            >Create Item</a>
                                        </div>
                                    </div>
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

        <Upload
            v-if='upload'
            :url='uploadurl()'
            :headers='headers'
            @err='upload = null; err = $event'
            @close='upload = null'
            @done='photoUploaded'
        />
    </div>
</template>

<script setup>
import iamHelper from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import Upload from './util/Upload.vue';
import AgencySelect from './util/AgencySelect.vue';
import Location from './Mission/Location.vue';
import RolodexProfile from './Rolodex/Profile.vue';
import {
    IconX
} from '@tabler/icons-vue';
import {
    TablerBreadCrumb,
    TablerDelete,
    TablerEnum,
    TablerError,
    TablerInput,
    TablerLoading,
    TablerToggle
} from '@tak-ps/vue-tabler';
import { computed, reactive, ref, onMounted, watch } from 'vue';
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

const isNew = computed(() => route.name === 'rolodex-new');

const err = ref(null);
const upload = ref(false);
const cache = ref(+new Date());
const tagInput = ref('');
const tagSuggestions = ref([]);
const headers = reactive({
    Authorization: `Bearer ${localStorage.token}`
});
const loading = reactive({
    rolodex: true
});
const errors = reactive({
    name: '',
    email: '',
    phone: ''
});
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

function uploadurl() {
    return window.stdurl(`api/rolodex/${route.params.rolodexid}/profile`);
}

function addTag() {
    const tag = tagInput.value.trim();
    if (tag && !rolodex.tags.includes(tag)) rolodex.tags.push(tag);
    tagInput.value = '';
}

function validate() {
    errors.name = rolodex.name.trim() ? '' : 'Cannot be empty';
    errors.email = (!rolodex.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rolodex.email.trim()))
        ? '' : 'Must be a valid email address';
    errors.phone = (!rolodex.phone || /^[+()\d\s.-]{7,}$/.test(rolodex.phone.trim()))
        ? '' : 'Must be a valid phone number';

    return !errors.name && !errors.email && !errors.phone;
}

function body() {
    addTag();

    return {
        type: rolodex.type,
        name: rolodex.name.trim(),
        title: rolodex.title,
        organization: rolodex.organization,
        remarks: rolodex.remarks,
        phone: rolodex.phone ? rolodex.phone.trim() : '',
        email: rolodex.email ? rolodex.email.trim() : '',
        website: rolodex.website.trim(),
        address: rolodex.address,
        location_geom: rolodex.location_geom || null,
        tags: rolodex.tags,
        agencies: rolodex.agencies.map((agency) => agency.id)
    };
}

async function create() {
    if (!validate()) return;

    loading.rolodex = true;
    try {
        const created = await window.std('/api/rolodex', {
            method: 'POST',
            body: body()
        });

        router.push(`/rolodex/${created.id}`);
    } catch (e) {
        err.value = e;
        loading.rolodex = false;
    }
}

async function update() {
    if (!validate()) return;

    loading.rolodex = true;
    try {
        await window.std(`/api/rolodex/${route.params.rolodexid}`, {
            method: 'PATCH',
            body: {
                ...body(),
                archived: rolodex.archived
            }
        });

        router.push(`/rolodex/${route.params.rolodexid}`);
    } catch (e) {
        err.value = e;
        loading.rolodex = false;
    }
}

async function deleteRolodex() {
    loading.rolodex = true;
    try {
        await window.std(`/api/rolodex/${route.params.rolodexid}`, {
            method: 'DELETE',
        });

        router.push('/rolodex');
    } catch (e) {
        err.value = e;
        loading.rolodex = false;
    }
}

async function photoUploaded() {
    upload.value = null;
    rolodex.photo = true;
    cache.value = +new Date();
}

async function removePhoto() {
    try {
        await window.std(`/api/rolodex/${route.params.rolodexid}/profile`, {
            method: 'DELETE'
        });
        rolodex.photo = false;
        cache.value = +new Date();
    } catch (e) {
        err.value = e;
    }
}

async function listTags() {
    try {
        const res = await window.std('/api/rolodex/tags?limit=100');
        tagSuggestions.value = res.items;
    } catch (e) {
        console.error(e);
    }
}

async function fetch() {
    loading.rolodex = true;
    try {
        const item = await window.std(`/api/rolodex/${route.params.rolodexid}`);
        Object.assign(rolodex, item, {
            phone: item.phone || '',
            email: item.email || '',
        });
        cache.value = +new Date();
    } catch (e) {
        err.value = e;
    }
    loading.rolodex = false;
}

watch(() => route.params.rolodexid, async () => {
    if (route.params.rolodexid) await fetch();
});

onMounted(async () => {
    await listTags();

    if (route.params.rolodexid && is_iam('Rolodex:Manage')) {
        await fetch();
    } else {
        loading.rolodex = false;
    }
});
</script>
