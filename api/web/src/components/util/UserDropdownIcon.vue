<template>
    <TablerDropdown>
        <TablerIconButton
            :title='title'
            :disabled='disabled'
            :class='{ "btn px-2": button }'
            :style='height ? { height: height + "px", width: height + "px", display: "flex", alignItems: "center", justifyContent: "center" } : {}'
        >
            <IconUserPlus
                :size='iconSize'
                :stroke='1'
            />
        </TablerIconButton>
        <template #dropdown>
            <div
                class='card'
                style='min-width: 300px;'
                @click.stop=''
            >
                <div class='card-header'>
                    <div class='card-title'>
                        Select User
                    </div>
                </div>
                <div class='card-body'>
                    <TablerInput
                        v-model='filter'
                        icon='search'
                        placeholder='Search Users…'
                    />
                    <div
                        v-for='user in list.items'
                        :key='user.id'
                        class='d-flex align-items-center my-1 p-2 cursor-pointer rounded hover-shadow'
                        @click='select(user)'
                    >
                        <Avatar :user='user' />
                    </div>
                    <div
                        v-if='!list.items.length'
                        class='text-muted text-center py-2'
                    >
                        No users found
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
    TablerIconButton,
    TablerInput
} from '@tak-ps/vue-tabler'
import {
    IconUserPlus
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
    iconSize: {
        type: Number,
        default: 24
    },
    height: {
        type: Number,
        default: null
    },
    title: {
        type: String,
        default: 'Select User'
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
