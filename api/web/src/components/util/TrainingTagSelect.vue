<template>
    <div class='mb-3'>
        <div class='row'>
            <div class='d-flex align-items-center mb-3'>
                <div
                    class='subheader'
                    v-text='label'
                />

                <div class='ms-auto'>
                    <TablerDropdown>
                        <IconSettings
                            class='cursor-pointer dropdown-toggle'
                            size='16'
                            stroke='1'
                        />
                        <template #dropdown>
                            <div class='m-1'>
                                <TablerInput
                                    v-model='filter'
                                    placeholder='Filter Tags'
                                />

                                <div
                                    v-for='tag in list.items'
                                    class='cursor-pointer hover-light mx-1 my-1 px-2 py-2'
                                    @click='push_tags(tag)'
                                >
                                    <span v-text='tag.name' />
                                </div>
                            </div>
                        </template>
                    </TablerDropdown>
                </div>
            </div>

            <template v-if='!tags.length'>
                <TablerNone
                    label='No Tags Assigned'
                    :create='false'
                    :compact='true'
                />
            </template>
            <template v-else>
                <div
                    v-for='(a, a_idx) in tags'
                    :key='a.id'
                    class='d-flex align-items-center my-1'
                >
                    <span v-text='a.name' />
                    <div class='ms-auto'>
                        <IconTrash
                            size='16'
                            stroke='1'
                            class='cursor-pointer'
                            @click='delete_tags(a_idx, a)'
                        />
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import {
    IconSettings,
    IconTrash
} from '@tabler/icons-vue'
import {
    TablerNone,
    TablerInput,
    TablerDropdown
} from '@tak-ps/vue-tabler'

const props = defineProps({
    modelValue: {
        type: Array,
        required: true
    },
    label: {
        type: String,
        default: 'Tags'
    },
    limit: {
        type: Number,
        default: 100
    }
})

const emit = defineEmits(['update:modelValue', 'push', 'delete'])

const filter = ref('')
const list = ref({
    items: []
})
const tags = ref([])

const push_tags = async (tag) => {
    tags.value.push(tag)
    emit('push', tag)
    await listTags()
}

const delete_tags = async (idx, tag) => {
    tags.value.splice(idx, 1)
    emit('delete', tag)
    await listTags()
}

const listTags = async () => {
    const url = window.stdurl('/api/training-tag')
    url.searchParams.append('filter', filter.value)
    url.searchParams.append('limit', props.limit + tags.value.length)

    const listResult = await window.std(url)

    const ids = tags.value.map((a) => a.id)

    list.value.items = listResult.items.filter((tag) => {
        return !ids.includes(tag.id)
    }).splice(0, props.limit)
}

watch(() => props.modelValue, () => {
    tags.value = props.modelValue
})

watch(filter, async () => {
    await listTags()
})

onMounted(async () => {
    await listTags()
})
</script>
