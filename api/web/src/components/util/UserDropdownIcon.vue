<template>
    <div class='dropdown'>
        <div
            id='dropdownMenuButton1'
            type='button'
            :class='{
                "btn px-2": button
            }'
            data-bs-toggle='dropdown'
            aria-expanded='false'
        >
            <IconPlus
                :size='24'
                stroke='1'
            />
        </div>
        <ul
            class='dropdown-menu'
            aria-labelledby='dropdownMenuButton1'
        >
            <div class='m-1'>
                <TablerInput
                    v-model='filter'
                    placeholder='Filter Users'
                />

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
        </ul>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import Avatar from './Avatar.vue'
import {
    TablerInput
} from '@tak-ps/vue-tabler'
import {
    IconPlus
} from '@tabler/icons-vue'

const props = defineProps({
    button: {
        type: Boolean,
        description: 'Style as a standalone icon if false or a button if true',
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    },
    limit: {
        type: Number,
        default: 10
    }
})

const emit = defineEmits(['selected'])

const filter = ref('')
const list = ref({
    items: []
})

const select = (user) => {
    filter.value = ''
    emit('selected', user)
}

const listUsers = async () => {
    const url = window.stdurl('/api/user')
    url.searchParams.append('filter', filter.value)
    url.searchParams.append('limit', props.limit)
    list.value = await window.std(url)
}

watch(filter, async () => {
    await listUsers()
})

onMounted(async () => {
    await listUsers()
})
</script>
