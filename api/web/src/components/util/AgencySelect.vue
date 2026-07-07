<template>
    <div class='mb-3'>
        <div class='row'>
            <div class='d-flex align-items-center mb-3'>
                <div
                    class='subheader'
                    v-text='label'
                />

                <div
                    v-if='!disabled'
                    class='ms-auto'
                >
                    <TablerDropdown>
                        <template #default>
                            <IconPlus
                                v-tooltip='"Add Agency"'
                                :size='16'
                                :stroke='1'
                            />
                        </template>
                        <template #dropdown>
                            <div class='p-3' @click.stop=''>
                                <TablerInput
                                    v-model='filter'
                                    icon='search'
                                    placeholder='Filter Agencies'
                                />

                                <TablerNone
                                    v-if='list.items.length === 0'
                                    label='No Agencies'
                                    :create='false'
                                />
                                <template v-else>
                                    <div
                                        v-for='agency in list.items'
                                        :key='agency.id'
                                        class='py-2 px-2 rounded cursor-pointer hover-light'
                                        @click.stop='push_agencies(agency)'
                                    >
                                        <div class='d-flex align-items-center'>
                                            <img
                                                v-if='agency.logo'
                                                :src='agency.logo'
                                                :alt='agency.name'
                                                class='rounded me-2'
                                                style='width: 24px; height: 24px; object-fit: cover;'
                                            />
                                            <div v-text='agency.name' />
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </template>
                    </TablerDropdown>
                </div>
            </div>

            <template v-if='!agencies.length'>
                <TablerNone
                    label='No Agencies Assigned'
                    :create='false'
                    :compact='true'
                />
            </template>
            <template v-else>
                <div
                    v-for='(a, a_idx) in agencies'
                    :key='a.id'
                    class='d-flex align-items-center my-1'
                >
                    <img
                        v-if='a.logo'
                        :src='a.logo'
                        :alt='a.name'
                        class='rounded me-2'
                        style='width: 24px; height: 24px; object-fit: cover;'
                    />
                    <div v-text='a.name' />
                    <div class='ms-auto'>
                        <TablerIconButton
                            title='Remove Agency'
                            @click='delete_agencies(a_idx, a)'
                        >
                            <IconTrash
                                size='16'
                                stroke='1'
                            />
                        </TablerIconButton>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import {
    IconPlus,
    IconTrash
} from '@tabler/icons-vue'
import {
    TablerDropdown,
    TablerIconButton,
    TablerNone,
    TablerInput
} from '@tak-ps/vue-tabler'

const props = defineProps({
    modelValue: {
        type: Array,
        required: true
    },
    label: {
        type: String,
        default: 'Agencies'
    },
    limit: {
        type: Number,
        default: 10
    },
    disabled: {
        type: Boolean,
        default: false
    },
    userId: {
        type: Number,
        required: false
    }
})

const emit = defineEmits(['update:modelValue', 'push', 'delete'])

const filter = ref('')
const list = ref({
    items: []
})
const agencies = ref([])

const push_agencies = async (agency) => {
    agencies.value.push(agency)
    emit('push', agency)
    await listAgencies()
}

const delete_agencies = async (idx, agency) => {
    agencies.value.splice(idx, 1)
    emit('delete', agency)
    await listAgencies()
}

const listAgencies = async () => {
    const url = window.stdurl('/api/agency')
    url.searchParams.append('filter', filter.value)
    url.searchParams.append('limit', props.limit + agencies.value.length)
    const listResult = await window.std(url)

    const ids = agencies.value.map((a) => a.id)

    list.value.items = listResult.items.filter((agency) => {
        return !ids.includes(agency.id)
    }).splice(0, props.limit)
}

watch(() => props.modelValue, () => {
    agencies.value = props.modelValue
})

watch(filter, async () => {
    await listAgencies()
})

watch(agencies, () => {
    emit('update:modelValue', agencies.value)
}, { deep: true })

onMounted(async () => {
    agencies.value = props.modelValue
    
    // Autopopulate if user has only one agency and none are selected
    if (props.userId && agencies.value.length === 0) {
        try {
            const userAgencies = await window.std(`/api/user/${props.userId}/agency`)
            if (userAgencies.items && userAgencies.items.length === 1) {
                const singleAgency = userAgencies.items[0]
                // Fetch full agency details including logo
                const fullAgency = await window.std(`/api/agency/${singleAgency.agency_id}`)
                agencies.value.push(fullAgency)
                emit('update:modelValue', agencies.value)
            }
        } catch (err) {
            console.error('Failed to fetch user agencies:', err)
        }
    }
    
    await listAgencies()
})
</script>
