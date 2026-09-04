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
                            v-if='!is_iam("Equipment:Manage")'
                            title='Equipment Editing'
                        />
                        <template v-else>
                            <Alert
                                v-if='equipment.archived'
                                label='Cannot Edit Archived Equipment'
                            />
                            <div
                                v-else
                                class='card'
                            >
                                <TablerLoading v-if='loading.equipment' />
                                <template v-else>
                                    <div class='card-header'>
                                        <div class='card-title'>
                                            Equipment Editor
                                        </div>
                                    </div>

                                    <div class='row row-0'>
                                        <div
                                            class='col-12'
                                            :class='{
                                                "col-md-9": $route.params.equipid
                                            }'
                                        >
                                            <div class='card-body'>
                                                <div class='row row-cards'>
                                                    <div class='col-md-8 pb-2'>
                                                        <TablerInput
                                                            v-model='equipment.name'
                                                            label='Equipment Name'
                                                            :required='true'
                                                            :error='errors.name'
                                                        />
                                                    </div>
                                                    <div class='col-md-4 pb-2'>
                                                        <label class='form-label'>Equipment Type</label>
                                                        <select
                                                            v-model='equipment.type_id'
                                                            class='form-select'
                                                        >
                                                            <option
                                                                :value='null'
                                                                disabled
                                                            >
                                                                Select Equipment Type
                                                            </option>
                                                            <option
                                                                v-for='t in equipmentTypes'
                                                                :key='t.id'
                                                                :value='t.id'
                                                                v-text='t.type'
                                                            />
                                                        </select>
                                                    </div>
                                                    <div class='col-md-12 pb-2'>
                                                        <TablerInput
                                                            v-model='equipment.description'
                                                            :rows='5'
                                                            label='Equipment Description'
                                                        />
                                                    </div>
                                                    <div class='col-md-6 pb-2'>
                                                        <TablerInput
                                                            v-model='equipment.quantity'
                                                            type='number'
                                                            label='Quantity'
                                                            :required='true'
                                                            :error='errors.quantity'
                                                        />
                                                    </div>
                                                    <div class='col-md-6 pb-2'>
                                                        <TablerInput
                                                            v-model='equipment.value'
                                                            type='number'
                                                            label='Per Item Value (whole $)'
                                                            description='Rounded to the nearest dollar'
                                                            :error='errors.value'
                                                        />
                                                    </div>
                                                    <div class='col-md-6 pb-2'>
                                                        <label class='form-label'>Equipment Hierarchy</label>
                                                        <div
                                                            class='row border rounded px-2 py-2'
                                                            style='margin-left: 0px; margin-right: 0px;'
                                                        >
                                                            <TablerToggle
                                                                v-model='equipment.container'
                                                                label='Equipment Container?'
                                                            />

                                                            <label class='form-label'>Parent Container</label>
                                                            <select
                                                                v-model='equipment.parent'
                                                                class='form-select'
                                                            >
                                                                <option :value='null'>
                                                                    None
                                                                </option>
                                                                <option
                                                                    v-for='c in parentOptions'
                                                                    :key='c.id'
                                                                    :value='c.id'
                                                                    v-text='c.name'
                                                                />
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div class='col-md-6 pb-2'>
                                                        <label class='form-label'>Assigned Members</label>
                                                        <div
                                                            class='row border rounded px-2 py-2'
                                                            style='margin-left: 0px; margin-right: 0px;'
                                                        >
                                                            <UserSelect
                                                                v-model='assigned'
                                                                label=''
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            v-if='$route.params.equipid'
                                            class='col-12 col-md-3'
                                        >
                                            <EquipmentProfile
                                                bgstyle='cover'
                                                :equipmentid='equipment.id'
                                                :cache='cache'
                                            />

                                            <div class='card-body d-flex justify-content-center'>
                                                <a
                                                    class='cursor-pointer btn btn-secondary'
                                                    @click='upload = true'
                                                >Update Photo</a>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        v-if='type.schema && type.schema.properties'
                                        class='col-md-12'
                                    >
                                        <EquipmentMeta
                                            v-model='equipment.meta'
                                            :schema='type.schema'
                                        />
                                    </div>

                                    <div class='card-body col-md-12'>
                                        <div class='d-flex'>
                                            <button
                                                v-if='$route.params.equipid'
                                                class='btn btn-danger'
                                                :disabled='loading.save'
                                                @click='archiveModal = true'
                                            >
                                                Archive Equipment
                                            </button>

                                            <div class='ms-auto'>
                                                <button
                                                    class='btn btn-primary'
                                                    :disabled='loading.save'
                                                    @click='save'
                                                >
                                                    <TablerLoading
                                                        v-if='loading.save'
                                                        :inline='true'
                                                    />
                                                    <span
                                                        v-else
                                                        v-text='$route.params.equipid ? "Update Equipment" : "Create Equipment"'
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>

        <TablerModal v-if='archiveModal'>
            <button
                type='button'
                class='btn-close'
                aria-label='Close'
                @click='archiveModal = false'
            />
            <div class='modal-status bg-red' />
            <div class='modal-header text-center py-4'>
                Archive Equipment
            </div>
            <div class='modal-body text-center py-4'>
                <div>
                    Archive <span
                        class='fw-bold'
                        v-text='equipment.name'
                    />?
                </div>
                <div class='text-secondary mt-2'>
                    Archived equipment is hidden from the equipment list and can no longer be edited or assigned.
                    A manager can restore it later from the equipment page.
                </div>
            </div>
            <div class='modal-footer'>
                <button
                    class='btn'
                    :disabled='loading.archive'
                    @click='archiveModal = false'
                >
                    Cancel
                </button>
                <button
                    class='btn btn-danger ms-auto'
                    :disabled='loading.archive'
                    @click='archive'
                >
                    <TablerLoading
                        v-if='loading.archive'
                        :inline='true'
                    />
                    <span v-else>Archive</span>
                </button>
            </div>
        </TablerModal>

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
            @done='upload = null; cache = +new Date()'
        />
    </div>
</template>

<script setup>
import {
    TablerBreadCrumb,
    TablerLoading,
    TablerToggle,
    TablerInput,
    TablerModal,
    TablerError,
} from '@tak-ps/vue-tabler'
import UserSelect from './util/UserSelect.vue';
import NoAccess from './util/NoAccess.vue';
import Alert from './util/Alert.vue';
import EquipmentMeta from './util/EquipmentMeta.vue';
import EquipmentProfile from './Equipment/Profile.vue';
import Upload from './util/Upload.vue';
import iamHelper from '../iam.js';
import { reactive, ref, computed, watch, onMounted } from 'vue';
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

const err = ref(null);
const upload = ref(false);
const archiveModal = ref(false);
const cache = ref(+new Date());
const headers = reactive({
    Authorization: `Bearer ${localStorage.token}`
});
const loading = reactive({
    equipment: true,
    save: false,
    archive: false
});
const type = reactive({
    schema: {}
});
const errors = reactive({
    name: '',
    quantity: '',
    value: ''
});
const assigned = ref([]);
const equipmentTypes = ref([]);
const containers = ref([]);
const equipment = reactive({
    name: '',
    description: '',
    container: false,
    value: '',
    quantity: 1,
    parent: null,
    type_id: null,
    meta: {}
});

// Set once the form is populated so later type changes are known to be user
// edits (which reset metadata) rather than the initial load
let ready = false;

function is_iam(permission) { return iamHelper(props.iam, props.auth, permission); }

// Containers that may be chosen as a parent: everything except this item and
// anything already stored inside it (which would create a cycle)
const parentOptions = computed(() => {
    const self = equipment.id;
    if (!self) return containers.value;

    const excluded = new Set([self]);
    let grew = true;
    while (grew) {
        grew = false;
        for (const c of containers.value) {
            if (!excluded.has(c.id) && excluded.has(c.parent)) {
                excluded.add(c.id);
                grew = true;
            }
        }
    }

    return containers.value.filter((c) => !excluded.has(c.id));
});

watch(() => equipment.type_id, async () => {
    // During the initial load onMounted fetches the type itself
    if (!ready) return;

    // Metadata belongs to the type schema; a new type starts fresh
    equipment.meta = {};
    await fetchType();
});

async function fetchType() {
    for (const key of Object.keys(type)) delete type[key];
    type.schema = {};

    if (equipment.type_id) {
        Object.assign(type, await window.std(`/api/equipment-type/${equipment.type_id}`));
        if (!type.schema) type.schema = {};
    }
}

async function fetchTypes() {
    const res = await window.std('/api/equipment-type?limit=100');
    equipmentTypes.value = res.items;

    if (!route.params.equipid && !equipment.type_id) {
        const generic = equipmentTypes.value.find((t) => t.type === 'Generic');
        if (generic) equipment.type_id = generic.id;
    }
}

async function fetchContainers() {
    const res = await window.std('/api/equipment?container=true&limit=100&sort=name&order=asc');
    containers.value = res.items;
}

function uploadurl() {
    return window.stdurl(`api/equipment/${route.params.equipid}/profile`);
}

async function fetch() {
    Object.assign(equipment, await window.std(`/api/equipment/${route.params.equipid}`));
    assigned.value = (await window.std(`/api/equipment/${equipment.id}/assigned`)).items;
}

function validate() {
    errors.name = equipment.name.trim() ? '' : 'Equipment name is required';

    const quantity = Number(equipment.quantity);
    errors.quantity = (Number.isInteger(quantity) && quantity >= 0)
        ? '' : 'Quantity must be a whole number of 0 or more';

    if (equipment.value === '' || equipment.value === null || equipment.value === undefined) {
        errors.value = '';
    } else {
        const value = Number(equipment.value);
        errors.value = (Number.isFinite(value) && value >= 0) ? '' : 'Value must be a number of 0 or more';
    }

    return !errors.name && !errors.quantity && !errors.value;
}

// Only send the fields the API accepts; the fetched object also carries
// read-only columns like id, created, status and assigned
function body() {
    const hasValue = !(equipment.value === '' || equipment.value === null || equipment.value === undefined);

    return {
        name: equipment.name.trim(),
        description: equipment.description,
        type_id: equipment.type_id || undefined,
        container: !!equipment.container,
        parent: equipment.parent || null,
        quantity: parseInt(equipment.quantity),
        value: hasValue ? Math.round(Number(equipment.value)) : null,
        meta: equipment.meta,
        assigned: assigned.value.map((a) => a.uid || a.id)
    };
}

async function archive() {
    loading.archive = true;

    try {
        await window.std(`/api/equipment/${route.params.equipid}`, {
            method: 'PATCH',
            body: { archived: true }
        });

        archiveModal.value = false;
        router.push(`/equipment/${route.params.equipid}`);
    } finally {
        loading.archive = false;
    }
}

async function save() {
    if (!validate()) return;

    loading.save = true;

    try {
        if (route.params.equipid) {
            await window.std(`/api/equipment/${route.params.equipid}`, {
                method: 'PATCH',
                body: body()
            });

            router.push(`/equipment/${route.params.equipid}`);
        } else {
            const equip = await window.std('/api/equipment', {
                method: 'POST',
                body: body()
            });

            router.push(`/equipment/${equip.id}`);
        }
    } finally {
        loading.save = false;
    }
}

onMounted(async () => {
    if (!is_iam("Equipment:Manage")) return;

    try {
        await Promise.all([fetchTypes(), fetchContainers()]);

        if (route.params.equipid) {
            await fetch();
        } else {
            const url = new URL(window.location);
            if (url.searchParams.has('parent')) {
                const parentEquip = await window.std(`/api/equipment/${url.searchParams.get('parent')}`);
                equipment.parent = parentEquip.id;
            }
        }

        await fetchType();
    } finally {
        ready = true;
        loading.equipment = false;
    }
});
</script>
