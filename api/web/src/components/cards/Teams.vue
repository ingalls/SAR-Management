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

                            <div
                                v-if='select'
                                v-text='`${selected.length} Selected`'
                            />
                        </div>
                    </div>

                    <div class='ms-auto'>
                        <div
                            v-if='!select'
                            class='btn-list'
                        >
                            <button
                                data-bs-toggle='dropdown'
                                type='button'
                                class='btn dropdown-toggle dropdown-toggle-split'
                                aria-expanded='false'
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
        <template v-if='loading.teams'>
            <TablerLoading desc='Loading Teams' />
        </template>
        <template v-else-if='teams.total == 0'>
            <TablerNone
                label='Teams'
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
                                    <span
                                        v-if='selected.includes(team.id)'
                                        class='badge bg-blue mx-2'
                                        style='height: 20px;'
                                    >Selected</span>
                                    <span
                                        v-if='team.fieldable'
                                        class='ms-auto badge bg-green text-white'
                                        style='height: 20px;'
                                    >Fieldable</span>
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
    TablerNone,
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
    filter: ''
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
    await listTeams()
})

onMounted(async () => {
    await listTeams()
})
</script>
