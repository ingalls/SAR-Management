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
                                v-tooltip='"Add Team"'
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
                                        placeholder='Filter Teams'
                                    />

                                    <TablerNone
                                        v-if='list.items.length === 0'
                                        label='No Users'
                                        :create='false'
                                    />
                                    <template v-else>
                                        <div
                                            v-for='team in list.items'
                                            :key='team.id'
                                            class='py-2 px-2 rounded cursor-pointer hover-light'
                                            @click='push_teams(team)'
                                        >
                                            <TeamBadge :team='team' />
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </template>
                    </TablerDropdown>
                </div>
            </div>

            <template v-if='!teams.length'>
                <TablerNone
                    label='No Teams Assigned'
                    :create='false'
                    :compact='true'
                />
            </template>
            <template v-else>
                <div
                    v-for='(a, a_idx) in teams'
                    :key='a.id'
                    class='d-flex align-items-center my-1'
                >
                    <TeamBadge :team='a' />
                    <div class='ms-auto'>
                        <TablerIconButton
                            title='Remove Team'
                            @click='delete_teams(a_idx, a)'
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
import TeamBadge from './TeamBadge.vue'
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
        default: 'Teams'
    },
    limit: {
        type: Number,
        default: 10
    },
    fieldable: {
        type: Boolean,
        default: undefined
    },
    disabled: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue', 'push', 'delete'])

const filter = ref('')
const list = ref({
    items: []
})
const teams = ref([])

const push_teams = async (team) => {
    teams.value.push(team)
    emit('push', team)
    await listTeams()
}

const delete_teams = async (idx, team) => {
    teams.value.splice(idx, 1)
    emit('delete', team)
    await listTeams()
}

const listTeams = async () => {
    const url = window.stdurl('/api/team')
    url.searchParams.append('filter', filter.value)
    url.searchParams.append('limit', props.limit + teams.value.length)

    if (props.fieldable !== undefined) url.searchParams.append('fieldable', String(props.fieldable))
    const listResult = await window.std(url)

    const ids = teams.value.map((a) => a.id)

    list.value.items = listResult.items.filter((team) => {
        return !ids.includes(team.id)
    }).splice(0, props.limit)
}

watch(() => props.modelValue, () => {
    teams.value = props.modelValue
})

watch(filter, async () => {
    await listTeams()
})

watch(teams, () => {
    emit('update:modelValue', teams.value)
}, { deep: true })

onMounted(async () => {
    teams.value = props.modelValue
    await listTeams()
})
</script>
