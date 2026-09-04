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
                        v-if='!is_iam("Equipment:View")'
                        title='Equipment'
                    />
                    <TablerLoading v-else-if='loading.equipment' />
                    <template v-else>
                        <div class='col-lg-12'>
                            <div class='card'>
                                <div class='card-header'>
                                    <h3
                                        class='card-title'
                                        v-text='equipment.name'
                                    />
                                    <div class='ms-auto btn-list align-items-center'>
                                        <TablerBadge
                                            v-if='equipment.container'
                                            background-color='#206bc4'
                                            text-color='#ffffff'
                                        >
                                            Container
                                        </TablerBadge>
                                        <TablerBadge
                                            v-if='equipment.archived'
                                            background-color='#d63939'
                                            text-color='#ffffff'
                                        >
                                            Archived
                                        </TablerBadge>

                                        <button
                                            v-if='is_iam("Equipment:Manage") && equipment.archived'
                                            class='btn btn-secondary'
                                            :disabled='loading.restore'
                                            @click='restore'
                                        >
                                            <TablerLoading
                                                v-if='loading.restore'
                                                :inline='true'
                                            />
                                            <template v-else>
                                                <IconArchiveOff
                                                    :stroke='1'
                                                    :size='20'
                                                    class='me-1'
                                                />
                                                Restore
                                            </template>
                                        </button>

                                        <TablerIconButton
                                            v-if='is_iam("Equipment:Manage") && !equipment.archived'
                                            title='Edit Equipment'
                                            @click='$router.push(`/equipment/${$route.params.equipid}/edit`)'
                                        >
                                            <IconPencil
                                                :stroke='1'
                                                :size='32'
                                            />
                                        </TablerIconButton>
                                    </div>
                                </div>
                                <div class='row row-0'>
                                    <div class='col-12 col-md-9'>
                                        <div class='card-body'>
                                            <div
                                                class='col-md-12 pb-4'
                                                v-text='equipment.description'
                                            />
                                            <div class='col-md-8'>
                                                <div class='datagrid'>
                                                    <div
                                                        v-if='ancestors.length'
                                                        class='datagrid-item'
                                                    >
                                                        <div class='datagrid-title'>
                                                            Location
                                                        </div>
                                                        <div class='datagrid-content'>
                                                            <template
                                                                v-for='(a, i) in ancestors'
                                                                :key='a.id'
                                                            >
                                                                <span
                                                                    v-if='i > 0'
                                                                    class='mx-1 text-secondary'
                                                                >/</span>
                                                                <a
                                                                    class='cursor-pointer'
                                                                    @click='$router.push(`/equipment/${a.id}`)'
                                                                    v-text='a.name'
                                                                />
                                                            </template>
                                                        </div>
                                                    </div>
                                                    <div class='datagrid-item'>
                                                        <div class='datagrid-title'>
                                                            Equipment Type
                                                        </div>
                                                        <div class='datagrid-content'>
                                                            <a
                                                                v-if='type.id'
                                                                class='cursor-pointer'
                                                                @click='$router.push(`/equipment/type/${type.id}`)'
                                                                v-text='type.type'
                                                            />
                                                            <span v-else>None</span>
                                                        </div>
                                                    </div>
                                                    <div class='datagrid-item'>
                                                        <div class='datagrid-title'>
                                                            Quantity
                                                        </div>
                                                        <div class='datagrid-content'>
                                                            <span v-text='equipment.quantity' />
                                                        </div>
                                                    </div>
                                                    <div class='datagrid-item'>
                                                        <div class='datagrid-title'>
                                                            Item Value
                                                        </div>
                                                        <div class='datagrid-content'>
                                                            <span
                                                                v-if='typeof equipment.value === "number"'
                                                                v-text='formatValue(equipment.value)'
                                                            />
                                                            <span v-else>Unknown</span>
                                                        </div>
                                                    </div>
                                                    <div
                                                        v-if='typeof equipment.value === "number" && equipment.quantity > 1'
                                                        class='datagrid-item'
                                                    >
                                                        <div class='datagrid-title'>
                                                            Total Value
                                                        </div>
                                                        <div class='datagrid-content'>
                                                            <span v-text='formatValue(equipment.value * equipment.quantity)' />
                                                        </div>
                                                    </div>
                                                    <div
                                                        v-if='equipment.assigned.length'
                                                        class='datagrid-item'
                                                    >
                                                        <div class='datagrid-title'>
                                                            Assigned
                                                        </div>
                                                        <div class='datagrid-content'>
                                                            <Avatar
                                                                v-for='a in equipment.assigned'
                                                                :key='a.id'
                                                                :user='a'
                                                                class='my-1'
                                                                :link='true'
                                                            />
                                                        </div>
                                                    </div>
                                                    <div class='datagrid-item'>
                                                        <div class='datagrid-title'>
                                                            Last Updated
                                                        </div>
                                                        <div class='datagrid-content'>
                                                            <TablerEpoch :date='equipment.updated' />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class='col-12 col-md-3'>
                                        <EquipmentProfile :equipmentid='equipment.id' />
                                    </div>
                                </div>
                                <div
                                    v-if='type.schema && type.schema.properties'
                                    class='col-md-12'
                                >
                                    <EquipmentMeta
                                        v-model='equipment.meta'
                                        :disabled='true'
                                        :schema='type.schema'
                                    />
                                </div>
                            </div>
                        </div>
                        <EquipmentIncidentsCard
                            :equipment-id='equipment.id'
                            :iam='iam'
                            :auth='auth'
                        />
                        <div
                            v-if='equipment.container'
                            class='col-lg-12'
                        >
                            <CardEquipment
                                :create='is_iam("Equipment:Manage") && !equipment.archived'
                                label='Contained Equipment'
                                :parent='equipment.id'
                                :user-filter='true'
                            />
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import NoAccess from './util/NoAccess.vue';
import iamHelper from '../iam.js';
import {
    TablerBadge,
    TablerEpoch,
    TablerLoading,
    TablerBreadCrumb,
    TablerIconButton
} from '@tak-ps/vue-tabler';
import {
    IconPencil,
    IconArchiveOff
} from '@tabler/icons-vue';
import CardEquipment from './cards/Equipment.vue';
import EquipmentIncidentsCard from './util/EquipmentIncidentsCard.vue';
import EquipmentMeta from './util/EquipmentMeta.vue';
import EquipmentProfile from './Equipment/Profile.vue';
import Avatar from './util/Avatar.vue';

const route = useRoute();

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
    equipment: true,
    restore: false
})

const type = reactive({})
const equipment = reactive({})

// Chain of containers from the root down to the immediate parent
const ancestors = ref([])

function is_iam(permission) {
    return iamHelper(props.iam, props.auth, permission)
}

function formatValue(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(value);
}

async function fetchAncestors(parentId) {
    const chain = [];
    const seen = new Set();
    let current = parentId;

    // Bounded walk so a malformed hierarchy can't loop forever
    while (current && !seen.has(current) && chain.length < 25) {
        seen.add(current);
        const ancestor = await window.std(`/api/equipment/${current}`);
        chain.unshift({ id: ancestor.id, name: ancestor.name });
        current = ancestor.parent;
    }

    return chain;
}

async function fetch() {
    loading.equipment = true;

    try {
        const equipResult = await window.std(`/api/equipment/${route.params.equipid}`);
        Object.assign(equipment, equipResult);

        const [typeResult, chain] = await Promise.all([
            equipment.type_id ? window.std(`/api/equipment-type/${equipment.type_id}`) : null,
            equipment.parent ? fetchAncestors(equipment.parent) : []
        ]);

        for (const key of Object.keys(type)) delete type[key];
        if (typeResult) Object.assign(type, typeResult);
        ancestors.value = chain;
    } finally {
        loading.equipment = false;
    }
}

async function restore() {
    loading.restore = true;

    try {
        const updated = await window.std(`/api/equipment/${route.params.equipid}`, {
            method: 'PATCH',
            body: { archived: false }
        });
        Object.assign(equipment, updated);
    } finally {
        loading.restore = false;
    }
}

onMounted(async () => {
    if (is_iam("Equipment:View")) await fetch();
})
</script>
