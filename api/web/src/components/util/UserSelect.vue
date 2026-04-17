<template>
    <!-- Icon/Single Mode -->
    <TablerDropdown v-if='mode === `icon`'>
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
                style='min-width: 300px;'
                @click.stop=''
            >
                <div class='px-3 pt-3 pb-1 fw-bold'>
                    Select User
                </div>
                <div class='px-3 pb-3'>
                    <TablerInput
                        v-model='filter'
                        icon='search'
                        placeholder='Search Users…'
                    />
                    <div
                        v-for='user in list.items'
                        :key='user.id'
                        class='d-flex align-items-center my-1 p-2 cursor-pointer rounded hover-shadow'
                        @click='selectSingle(user)'
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

    <!-- Card/Roster Mode -->
    <div
        v-else-if='mode === `card`'
        class='card'
    >
        <div class='card-header'>
            <h3
                class='card-title'
                v-text='label'
            />
            <div class='card-actions btn-actions'>
                <div v-if='!disabled'>
                    <TablerDropdown>
                        <template #default>
                            <TablerIconButton
                                class='btn-primary'
                                style='width: 24px; height: 24px; min-height: 24px; min-width: 24px; padding: 0;'
                            >
                                <IconPlus
                                    v-tooltip='"Add User"'
                                    class='cursor-pointer dropdown-toggle'
                                    size='24'
                                    stroke='1'
                                />
                            </TablerIconButton>
                        </template>
                        <template #dropdown>
                            <div class='p-3'>
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
                        </template>
                    </TablerDropdown>
                </div>
            </div>
        </div>
        <div class='card-body'>
            <TablerLoading v-if='loading' />
            <TablerNone
                v-else-if='!assigned.length'
                label='No Users Assigned'
                :create='false'
            />
            <template v-else>
                <Draggable
                    v-model='assigned'
                    item-key='id'
                >
                    <template #item='{element}'>
                        <div class='d-flex align-items-center my-2 hover'>
                            <Avatar
                                :link='true'
                                :user='element'
                            />

                            <div
                                v-if='!disabled'
                                class='ms-auto'
                            >
                                <div class='btn-list'>
                                    <div
                                        v-if='!element.confirmed'
                                        class='btn btn--sm'
                                        @click='confirm_assigned(element)'
                                    >
                                        <IconCheck
                                            :size='16'
                                            stroke='1'
                                        /> Confirm
                                    </div>

                                    <template v-if='disabled'>
                                        <span
                                            class='pt-1'
                                            v-text='element.role'
                                        />
                                    </template>
                                    <template v-else>
                                        <TablerSelect
                                            v-model='element.role'
                                            :options='roles'
                                            class='pt-2 mx-3'
                                            @update:model-value='saveRole(element)'
                                        />
                                    </template>

                                    <TablerDelete
                                        v-tooltip='"Remove User"'
                                        displaytype='icon'
                                        :size='24'
                                        class='cursor-pointer my-2'
                                        @delete='delete_assigned(element)'
                                    />
                                </div>
                            </div>
                        </div>
                    </template>
                </Draggable>
            </template>
        </div>
    </div>

    <!-- List Mode (default) -->
    <div
        v-else
        class='mb-3'
    >
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
                            <div class='p-3'>
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
                            @click='delete_assigned_by_index(a_idx, a)'
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
    IconTrash,
    IconCheck,
    IconUserPlus
} from '@tabler/icons-vue'
import {
    TablerNone,
    TablerInput,
    TablerLoading,
    TablerDropdown,
    TablerSelect,
    TablerDelete,
    TablerIconButton
} from '@tak-ps/vue-tabler'
import Draggable from 'vuedraggable'

const props = defineProps({
    modelValue: {
        type: Array,
        default: () => []
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
    },
    mode: {
        type: String,
        default: 'list',
        validator: (v) => ['list', 'card', 'icon'].includes(v)
    },
    // Card mode props
    loading: {
        type: Boolean,
        default: false
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    // Icon mode props
    button: {
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
    }
})

const emit = defineEmits([
    'update:modelValue',
    'push',
    'delete',
    'patch',
    'selected'
])

const filter = ref('')
const list = ref({
    items: []
})
const assigned = ref([])
const roles = ref([])

// Icon/single mode
const selectSingle = (user) => {
    filter.value = ''
    emit('selected', user)
}

// List/card mode: add user
const push_assigned = async (user) => {
    if (props.mode === 'card' && props.confirmed) user.confirmed = true
    if (props.mode === 'card') user.role = 'Present'
    assigned.value.push(user)
    emit('push', user)
    filter.value = ''
}

// List mode: delete by index
const delete_assigned_by_index = async (idx, user) => {
    assigned.value.splice(idx, 1)
    emit('delete', user)
    await listUsers()
}

// Card mode: delete by reference
const delete_assigned = async (user) => {
    assigned.value.splice(assigned.value.indexOf(user), 1)
    emit('delete', user)
    await listUsers()
}

// Card mode: confirm
const confirm_assigned = (user) => {
    user.confirmed = true
    emit('patch', user)
}

// Card mode: save role
const saveRole = (role) => {
    emit('patch', role)
}

// Card mode: load roles
const listRoles = async () => {
    const url = window.stdurl('/api/mission-role')
    const result = await window.std(url)
    roles.value = result.items.map((role) => role.name)
}

const listUsers = async () => {
    const url = window.stdurl('/api/user')
    url.searchParams.append('filter', filter.value)

    if (props.mode === 'icon') {
        url.searchParams.append('limit', props.limit)
    } else {
        url.searchParams.append('limit', props.limit + assigned.value.length)
    }

    const result = await window.std(url)

    if (props.mode === 'icon') {
        list.value = result
    } else {
        const ids = assigned.value.map((a) => a.uid)
        list.value.items = result.items.filter((user) => {
            return !ids.includes(user.id)
        }).splice(0, props.limit)
    }
}

watch(() => props.modelValue, () => {
    if (props.mode !== 'icon') {
        assigned.value = props.modelValue
    }
})

watch(filter, async () => {
    await listUsers()
})

watch(assigned, () => {
    if (props.mode !== 'icon') {
        emit('update:modelValue', assigned.value)
    }
}, { deep: true })

onMounted(async () => {
    if (props.mode !== 'icon') {
        assigned.value = props.modelValue
    }
    await listUsers()
    if (props.mode === 'card') {
        await listRoles()
    }
})
</script>
