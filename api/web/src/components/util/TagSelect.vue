<template>
    <div class='mb-3'>
        <div class='row'>
            <div class='d-flex align-items-center mb-2'>
                <div
                    class='subheader'
                    v-text='label'
                />

                <div class='ms-auto'>
                    <TablerDropdown>
                        <IconSettings
                            class='cursor-pointer dropdown-toggle'
                            :size='16'
                            stroke='1'
                        />
                        <template #dropdown>
                            <div
                                class='m-1'
                                style='min-width: 240px;'
                                @click.stop=''
                            >
                                <TablerInput
                                    v-model='filter'
                                    placeholder='Filter Tags'
                                />

                                <TablerNone
                                    v-if='!list.items.length'
                                    label='No More Tags'
                                    :create='false'
                                    :compact='true'
                                />
                                <div
                                    v-for='tag in list.items'
                                    :key='tag.id'
                                    class='cursor-pointer hover-light rounded mx-1 my-1 px-2 py-2 d-flex align-items-center'
                                    @click.stop='push_tags(tag)'
                                >
                                    <TagBadge :tag='tag' />
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
                <div class='d-flex flex-wrap gap-2'>
                    <div
                        v-for='(a, a_idx) in tags'
                        :key='a.id'
                        class='d-inline-flex align-items-center'
                    >
                        <TagBadge :tag='a' />
                        <IconX
                            :size='16'
                            stroke='1'
                            class='cursor-pointer ms-1 text-muted'
                            title='Remove Tag'
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
    IconX
} from '@tabler/icons-vue'
import {
    TablerNone,
    TablerInput,
    TablerDropdown
} from '@tak-ps/vue-tabler'
import TagBadge from './TagBadge.vue';

/**
 * Shared tag picker for Missions & Trainings - assigned tags render as the
 * same badges shown on the view pages
 */
const props = defineProps({
    modelValue: {
        type: Array,
        required: true
    },
    // API root ie: /api/mission-tag
    api: {
        type: String,
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
    const url = window.stdurl(props.api)
    url.searchParams.append('filter', filter.value)
    url.searchParams.append('limit', props.limit + tags.value.length)
    url.searchParams.append('sort', 'name')
    url.searchParams.append('order', 'asc')

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

watch(tags, () => {
    emit('update:modelValue', tags.value)
}, { deep: true })

onMounted(async () => {
    tags.value = props.modelValue
    await listTags()
})
</script>
