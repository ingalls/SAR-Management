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
                                        <span
                                            v-if='equipment.container'
                                            class='badge bg-blue text-white'
                                            style='height: 20px;'
                                        >Container</span>
                                        <span
                                            v-if='equipment.archived'
                                            class='badge bg-red text-white'
                                            style='height: 20px;'
                                        >Archived</span>

                                        <IconSettings
                                            v-if='is_iam("Equipment:Manage") && !equipment.archived'
                                            class='cursor-pointer'
                                            :stroke='1'
                                            :size='32'
                                            @click='$router.push(`/equipment/${$route.params.equipid}/edit`)'
                                        />
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
                                                        v-if='parent.id'
                                                        class='datagrid-item'
                                                    >
                                                        <div class='datagrid-title'>
                                                            Parent Container
                                                        </div>
                                                        <div class='datagrid-content'>
                                                            <a
                                                                class='cursor-pointer'
                                                                @click='$router.push(`/equipment/${parent.id}`)'
                                                                v-text='parent.name'
                                                            />
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
                                                                v-if='equipment.value'
                                                                v-text='equipment.value'
                                                            />
                                                            <span v-else>Unknown</span>
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
                                                                :key='a.uid'
                                                                :user='a'
                                                                class='my-1'
                                                                :link='true'
                                                            />
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
                        <div
                            v-if='equipment.container'
                            class='col-lg-12'
                        >
                            <CardEquipment
                                :create='is_iam("Equipment:Manage")'
                                label='Contained Equipment'
                                :parent='equipment.id'
                            />
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import NoAccess from './util/NoAccess.vue'
import iam from '../iam.js'
import {
    TablerLoading,
    TablerBreadCrumb
} from '@tak-ps/vue-tabler'
import {
    IconSettings
} from '@tabler/icons-vue'
import CardEquipment from './cards/Equipment.vue'
import EquipmentMeta from './util/EquipmentMeta.vue'
import EquipmentProfile from './Equipment/Profile.vue'
import Avatar from './util/Avatar.vue'

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

const route = useRoute()

const loading = reactive({
    equipment: true
})
const type = ref({})
const parent = ref({})
const equipment = ref({})

const is_iam = (permission) => iam(props.iam, props.auth, permission)

const fetch = async () => {
    loading.equipment = true
    equipment.value = await window.std(`/api/equipment/${route.params.equipid}`)

    if (equipment.value.type_id) {
        type.value = await window.std(`/api/equipment-type/${equipment.value.type_id}`)
    }
    if (equipment.value.parent) {
        parent.value = await window.std(`/api/equipment/${equipment.value.parent}`)
    }

    loading.equipment = false
}

onMounted(async () => {
    if (is_iam("Equipment:View")) await fetch()
})
</script>
