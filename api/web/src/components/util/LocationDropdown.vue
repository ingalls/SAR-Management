<template>
    <TablerDropdown
        class='location-dropdown'
        position='bottom-start'
        :width='320'
    >
        <template #default>
            <TablerInput
                v-model='filter'
                :required='required'
                :disabled='disabled'
                :error='error'
                label='Location Name'
                placeholder='Trailhead, peak, address or other place name'
            />
        </template>
        <template #dropdown>
            <TablerLoading
                v-if='loading && !suggestions.length'
                :inline='true'
            />
            <TablerNone
                v-else-if='!suggestions.length'
                label='No Previous Locations'
                :compact='true'
                :create='false'
            />
            <div
                v-else
                @click.stop=''
            >
                <div class='subheader px-2 pt-2'>
                    Previous Locations
                </div>
                <div
                    v-for='loc in suggestions'
                    :key='loc.location'
                    class='dropdown-item d-flex align-items-center cursor-pointer'
                    @click.stop='select(loc)'
                >
                    <IconMapPin
                        :size='16'
                        stroke='1.5'
                        class='me-2 flex-shrink-0'
                        :class='loc.location_geom ? "text-red" : "opacity-25"'
                    />
                    <span
                        class='text-truncate'
                        v-text='loc.location'
                    />
                </div>
            </div>
        </template>
    </TablerDropdown>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { IconMapPin } from '@tabler/icons-vue'
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

// One entry per name, preferring the entry that has a map position
const suggestions = computed(() => {
    const names = new Map()

    for (const loc of list.value.items) {
        const existing = names.get(loc.location)
        if (!existing || (!existing.location_geom && loc.location_geom)) names.set(loc.location, loc)
    }

    return Array.from(names.values())
})

const select = (loc) => {
    filter.value = loc.location
    if (loc.location_geom) emit('locGeom', loc.location_geom)
}

let request = 0

const listLocs = async () => {
    const current = ++request
    loading.value = true
    try {
        const url = window.stdurl('/api/location')
        url.searchParams.append('filter', filter.value)
        url.searchParams.append('limit', props.limit)
        const res = await window.std(url)
        if (current === request) list.value = res
    } finally {
        if (current === request) loading.value = false
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

<style>
.location-dropdown.tabler-dropdown {
    display: flex !important;
    width: 100%;
}

.location-dropdown.tabler-dropdown > div {
    flex: 1 1 auto;
}
</style>
