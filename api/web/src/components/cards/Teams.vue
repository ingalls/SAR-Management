<template>
    <div class='card'>
        <div class='card-header'>
            <div class='col'>
                <div class='d-flex'>
                    <h3 class='card-title'>
                        Teams
                    </h3>

                    <div class='ms-auto'>
                        <div class='d-flex align-items-center'>
                            <TablerInput
                                v-model='paging.filter'
                                icon='search'
                                placeholder='Search…'
                            />

                            <TablerDropdown>
                                <button class='btn px-2 py-1 ms-2'>
                                    <IconFilter
                                        :size='32'
                                        stroke='1'
                                    />
                                </button>

                                <template #dropdown>
                                    <div
                                        @click.stop=''
                                    >
                                        <div class='px-3 pt-3 pb-1 fw-bold'>
                                            Filter Options
                                        </div>
                                        <div class='px-3 pb-3 row g-2'>
                                            <div class='col-12'>
                                                <TablerToggle
                                                    v-model='paging.fieldable'
                                                    label='Fieldable Only'
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </TablerDropdown>

                            <div
                                v-if='select'
                                class='ms-2'
                                v-text='`${selected.length} Selected`'
                            />

                            <div
                                v-if='!select'
                                class='btn-list ms-2'
                            >
                                <button
                                    data-bs-toggle='dropdown'
                                    type='button'
                                    class='btn dropdown-toggle'
                                    aria-expanded='false'
                                    v-text='"New Team"'
                                />
                                <div
                                    class='dropdown-menu dropdown-menu-end'
                                    style=''
                                >
                                    <a
                                        class='dropdown-item cursor-pointer'
                                        @click='$router.push("/team/new")'
                                    >New Team</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <template v-if='loading.teams'>
            <TablerLoading desc='Loading Teams' />
        </template>
        <template v-else-if='teams.total == 0'>
            <TablerNone
                label='No Teams'
                @create='$router.push("/team/new")'
            />
        </template>
        <template v-else>
            <div class='table-responsive'>
                <table class='table card-table table-vcenter table-hover text-nowrap datatable'>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Members</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for='team in teams.items'
                            :key='team.id'
                        >
                            <td>
                                <div class='d-flex'>
                                    <a
                                        class='cursor-pointer'
                                        @click='click(team)'
                                        v-text='team.name'
                                    />
                                    <TablerBadge
                                        v-if='selected.includes(team.id)'
                                        class='mx-2'
                                        background-color='#206bc4'
                                        text-color='#ffffff'
                                    >Selected</TablerBadge>
                                    <TablerBadge
                                        v-if='team.fieldable'
                                        class='ms-auto'
                                        background-color='#2fb344'
                                        text-color='#ffffff'
                                    >Fieldable</TablerBadge>
                                </div>
                            </td>
                            <td v-text='team.users.length || "None"' />
                        </tr>
                    </tbody>
                </table>
            </div>
        </template>

        <TableFooter
            :limit='paging.limit'
            :total='teams.total'
            @page='paging.page = $event'
        />
    </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import {
    IconFilter,
} from '@tabler/icons-vue';
import {
    TablerBadge,
    TablerNone,
    TablerInput,
    TablerToggle,
    TablerDropdown,
    TablerLoading
} from '@tak-ps/vue-tabler'
import TableFooter from '../util/TableFooter.vue'

const props = defineProps({
    select: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['selected'])

const selected = ref([])
const loading = reactive({
    teams: true
})
const paging = reactive({
    limit: 10,
    page: 0,
    filter: '',
    fieldable: false
})
const teams = reactive({
    total: 0,
    items: []
})

const click = (team) => {
    if (props.select) {
        if (selected.value.includes(team.id)) {
            selected.value.splice(selected.value.indexOf(team.id), 1)
        } else {
            selected.value.push(team.id)
        }
        emit('selected', selected.value)
    } else {
        // Note: $router access in Composition API requires useRouter from vue-router
        // For now keeping the direct access pattern from template
        window.location.href = `/team/${team.id}`
    }
}

const listTeams = async () => {
    loading.teams = true
    const url = window.stdurl('/api/team')
    url.searchParams.append('limit', paging.limit)
    url.searchParams.append('page', paging.page)

    if (paging.fieldable) url.searchParams.append('fieldable', 'true');

    url.searchParams.append('filter', paging.filter) 
    const result = await window.std(url)
    
    teams.total = result.total
    teams.items = result.items

    loading.teams = false
}

watch(() => paging.page, async () => {
    await listTeams()
})

watch(() => paging.filter, async () => {
    paging.page = 0;
watch(() => paging.fieldable, async () => {
    paging.page = 0;
    await listTeams()
})

    await listTeams()
})

onMounted(async () => {
    await listTeams()
})
</script>
