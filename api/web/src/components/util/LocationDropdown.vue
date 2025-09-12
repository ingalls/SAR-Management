<template>
    <TablerDropdown>
        <template #default>
            <TablerInput
                v-model='filter'
                :required='required'
                :disabled='disabled'
                :error='error'
                label='Location Name'
                placeholder='Location Name'
            />
        </template>
        <template #dropdown>
            <TablerLoading v-if='loading' />
            <TablerNone
                v-if='list.total === 0'
                :compact='true'
                :create='false'
            />
            <div v-else>
                <div class='m-1'>
                    <div
                        v-for='loc in list.items'
                        :key='loc.id'
                        @click='select(loc)'
                    >
                        <div class='d-flex align-items-center my-1 cursor-pointer'>
                            <span v-text='loc.location' />
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </TablerDropdown>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import {
    TablerNone,
    TablerInput,
    TablerLoading,
    TablerDropdown
} from '@tak-ps/vue-tabler'

const props = defineProps({
    modelValue: {
        type: String,
        required: true
    },
    disabled: {
        type: Boolean,
        default: false
    },
    required: {
        type: Boolean,
        default: false
    },
    error: {
        type: String,
        default: ''
    },
    limit: {
        type: Number,
        default: 10
    }
})

const emit = defineEmits(['update:modelValue', 'locGeom'])

const filter = ref('')
const loading = ref(false)
const list = ref({
    items: [],
    total: 0
})

const select = (loc) => {
    filter.value = loc.location
    emit('locGeom', loc.location_geom)
}

const listLocs = async () => {
    loading.value = true
    try {
        const url = window.stdurl('/api/location')
        url.searchParams.append('filter', filter.value)
        url.searchParams.append('limit', props.limit)
        list.value = await window.std(url)
    } finally {
        loading.value = false
    }
}

watch(() => props.modelValue, () => {
    filter.value = props.modelValue || ''
})

watch(filter, async () => {
    emit('update:modelValue', filter.value)
    await listLocs()
})

onMounted(async () => {
    filter.value = props.modelValue || ''
    await listLocs()
})
</script>
