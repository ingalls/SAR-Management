<template>
    <TablerDropdown>
        <template #default>
            <TablerInput
                v-model='filter'
                label='Name'
                :disabled='disabled'
            />
        </template>
        <template #dropdown>
            <div class='m-1'>
                <div
                    v-for='user in list.items'
                    :key='user.id'
                    @click='select(user)'
                >
                    <div class='d-flex align-items-center my-1 cursor-pointer'>
                        <Avatar :user='user' />
                    </div>
                </div>
            </div>
        </template>
    </TablerDropdown>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import Avatar from './Avatar.vue'
import {
    TablerDropdown,
    TablerInput
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
    url: {
        type: String,
        default: '/api/user'
    },
    limit: {
        type: Number,
        default: 10
    }
})

const emit = defineEmits(['selected'])

const filter = ref('')
const list = ref({
    users: []
})

const select = (user) => {
    filter.value = user.fname + ' ' + user.lname
    emit('selected', user)
}

const listUsers = async () => {
    const url = window.stdurl(props.url)
    if (filter.value) url.searchParams.append('filter', filter.value)
    url.searchParams.append('limit', props.limit)
    const listResult = await window.std(url)
    if (listResult.assigned) listResult.items = listResult.assigned
    list.value = listResult
}

watch(filter, async () => {
    await listUsers()
})

onMounted(async () => {
    filter.value = props.modelValue
    await listUsers()
})
</script>
