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
                                                    />
                                                </div>
                                                <div class='col-md-6 pb-2'>
                                                    <TablerInput
                                                        v-model='equipment.value'
                                                        label='Per Item Value ($)'
                                                    />
                                                </div>
                                                <div class='col-md-6 pb-2'>
                                                    <label class='form-label'>Equipment Heiarchy</label>
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
                                                            <option
                                                                :value='null'
                                                            >
                                                                None
                                                            </option>
                                                            <option
                                                                v-for='c in containers'
                                                                :key='c.id'
                                                                :value='c.id'
                                                                v-text='c.name'
                                                            />
                                                        </select>
                                                    </div>
                                                </div>
                                                <div class='col-md-6 pb-2'>
                                                    <label class='form-label'>Assigned Equipment</label>
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
                                    v-if='type.schema.properties'
                                    class='col-md-12'
                                >
                                    <EquipmentMeta
                                        v-model='equipment.meta'
                                        :schema='type.schema'
                                    />
                                </div>

                                <div class='card-body col-md-12'>
                                    <div class='d-flex'>
                                        <a
                                            v-if='$route.params.equipid'
                                            class='cursor-pointer btn btn-danger'
                                            @click='archive'
                                        >
                                            Archive Equipment
                                        </a>

                                        <div class='ms-auto'>
                                            <a
                                                class='cursor-pointer btn btn-primary'
                                                @click='save'
                                            >
                                                <span v-text='$route.params.equipid ? "Update Equipment" : "Create Equipment"' />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </div>

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
} from '@tak-ps/vue-tabler'
import UserSelect from './util/UserSelect.vue';
import NoAccess from './util/NoAccess.vue';
import Alert from './util/Alert.vue';
import EquipmentMeta from './util/EquipmentMeta.vue';
import EquipmentProfile from './Equipment/Profile.vue';
import Upload from './util/Upload.vue';
import iamHelper from '../iam.js';
import { reactive, ref, watch, onMounted } from 'vue';
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

const upload = ref(false);
const cache = ref(+new Date());
const headers = reactive({
    Authorization: `Bearer ${localStorage.token}`
});
const loading = reactive({
    equipment: true,
});
const type = reactive({
    schema: {}
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
    type: null,
    meta: {}
});

function is_iam(permission) { return iamHelper(props.iam, props.auth, permission); }

watch(() => equipment.type_id, async () => {
    Object.assign(type, await window.std(`/api/equipment-type/${equipment.type_id}`));
});

async function fetchTypes() {
    const res = await window.std('/api/equipment-type?limit=100');
    equipmentTypes.value = res.items;

    if (!route.params.equipid && !equipment.type_id) {
        const generic = equipmentTypes.value.find((t) => t.type === 'Generic');
        if (generic) equipment.type_id = generic.id;
    }
}

async function fetchContainers() {
    const res = await window.std('/api/equipment?container=true&limit=100');
    containers.value = res.items;
}

function uploadurl() {
    return window.stdurl(`api/equipment/${route.params.equipid}/profile`);
}

async function fetch() {
    loading.equipment = true;
    Object.assign(equipment, await window.std(`/api/equipment/${route.params.equipid}`));

    if (equipment.type_id) {
        Object.assign(type, await window.std(`/api/equipment-type/${equipment.type_id}`));
    }

    assigned.value = (await window.std(`/api/equipment/${equipment.id}/assigned`)).items;

    loading.equipment = false;
}

async function archive() {
    loading.equipment = true;

    await window.std(`/api/equipment/${route.params.equipid}`, {
        method: 'PATCH',
        body: {
            archived: true
        }
    });

    loading.equipment = false;
    router.push(`/equipment/${route.params.equipid}`);
}

async function save() {
    loading.equipment = true;

    if (route.params.equipid) {
        await window.std(`/api/equipment/${route.params.equipid}`, {
            method: 'PATCH',
            body: {
                ...equipment,
                parent: equipment.parent || null,
                value: equipment.value ? Number(equipment.value) : null,
                quantity: equipment.quantity ? parseInt(equipment.quantity) : null,
                assigned: assigned.value.map((a) => { return a.uid || a.id })
            }
        });

        loading.equipment = false;
        router.push(`/equipment/${route.params.equipid}`);
    } else {
        const equip = await window.std('/api/equipment', {
            method: 'POST',
            body: {
                ...equipment,
                parent: equipment.parent || null,
                value: equipment.value ? Number(equipment.value) : null,
                quantity: equipment.quantity ? parseInt(equipment.quantity) : null,
                assigned: assigned.value.map((a) => { return a.uid || a.id })
            }
        });

        loading.equipment = false;
        router.push(`/equipment/${equip.id}`);
    }
}

onMounted(async () => {
    await fetchTypes();
    await fetchContainers();

    if (is_iam("Equipment:Manage") && route.params.equipid) {
        await fetch();
    } else if (!route.params.equipid) {
        const url = new URL(window.location);
        if (url.searchParams.has('parent')) {
            const parentEquip = await window.std(`/api/equipment/${url.searchParams.get('parent')}`);
            equipment.parent = parentEquip.id;
        }

        loading.equipment = false;
    }
});
</script>
