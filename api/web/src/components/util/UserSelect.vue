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
                                v-tooltip='"Add User"'
                                :size='16'
                                :stroke='1'
                            />
                        </template>
                        <template #dropdown>
                            <div class='card'>
                                <div class='card-body'>
                                    <TablerInput
                                        v-model='filter'
                                        icon='search'
                                        placeholder='Filter Users'
                                    />

                                    <TablerNone
                                        v-if='list.items.length === 0'
                                        label='No Users'
                                        :create='false'
                                    />
                                    <template v-else>
                                        <div
                                            v-for='user in list.items'
                                            :key='user.id'
                                            class='py-2 px-2 rounded cursor-pointer hover-light'
                                            @click='push_assigned(user)'
                                        >
                                            <Avatar :user='user' />
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </template>
                    </TablerDropdown>
                </div>
            </div>

            <template v-if='!assigned.length'>
                <TablerNone
                    label='No Users Assigned'
                    :create='false'
                    :compact='true'
                />
            </template>
            <template v-else>
                <div
                    v-for='(a, a_idx) in assigned'
                    :key='a.id'
                    class='d-flex align-items-center my-1'
                >
                    <Avatar :user='a' />

                    <div class='ms-auto'>
                        <IconTrash
                            :size='16'
                            stroke='1'
                            class='cursor-pointer'
                            @click='delete_assigned(a_idx, a)'
                        />
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import Avatar from './Avatar.vue'
import {
    IconPlus,
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
    disabled: {
        type: Boolean,
        default: false
    },
    label: {
        type: String,
        default: 'Users'
    },
    limit: {
        type: Number,
        default: 10
    }
})

const emit = defineEmits([
    'update:modelValue',
    'push',
    'delete'
])

const filter = ref('')
const list = ref({
    items: []
})
const assigned = ref([])

const push_assigned = async (user) => {
    assigned.value.push(user)
    emit('push', user)
}

const delete_assigned = async (idx, user) => {
    assigned.value.splice(idx, 1)
    emit('delete', user)
    await listUsers()
}

const listUsers = async () => {
    const url = window.stdurl('/api/user')
    url.searchParams.append('filter', filter.value)
    url.searchParams.append('limit', props.limit + assigned.value.length)
    const listResult = await window.std(url)

    const ids = assigned.value.map((a) => a.uid)
    list.value.items = listResult.items.filter((user) => {
        return !ids.includes(user.id)
    }).splice(0, props.limit)
}

watch(() => props.modelValue, () => {
    assigned.value = props.modelValue
})

watch(filter, async () => {
    await listUsers()
})

watch(assigned, () => {
    emit('update:modelValue', assigned.value)
}, { deep: true })

onMounted(async () => {
    assigned.value = props.modelValue
    await listUsers()
})
</script>
