<template>
    <div class='card'>
        <div class='card-header'>
            <div class='col'>
                <div class='d-flex'>
                    <h3 class='card-title'>
                        Teams
                    </h3>

                    <div class='ms-auto'>
                        <div
                            v-if='select'
                            v-text='`${selected.length} Selected`'
                        />
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

<script>
import {
    TablerNone,
    TablerLoading
} from '@tak-ps/vue-tabler';
import TableFooter from '../util/TableFooter.vue';

export default {
    name: 'CardTeams',
    components: {
        TablerNone,
        TablerLoading,
        TableFooter
    },
    props: {
        select: {
            type: Boolean,
            default: false
        }
    },
    data: function() {
        return {
            selected: [],
            loading: {
                teams: true
            },
            paging: {
                limit: 10,
                page: 0
            },
            teams: {
                total: 0,
                items: []
            }
        }
    },
    watch: {
        'paging.page': async function() {
            await this.listTeams();
        },
    },
    mounted: async function() {
        await this.listTeams();
    },
    methods: {
        click: function(team) {
            if (this.select) {
                if (this.selected.includes(team.id)) {
                    this.selected.splice(this.selected.indexOf(team.id), 1);
                } else {
                    this.selected.push(team.id);
                }

                this.$emit('selected', this.selected);
            } else {
                this.$router.push(`/team/${team.id}`);
            }
        },
        listTeams: async function() {
            this.loading.teams = true;
            const url = window.stdurl('/api/team');
            url.searchParams.append('limit', this.paging.limit);
            url.searchParams.append('page', this.paging.page);
            this.teams = await window.std(url);

            this.loading.teams = false;
        }
    }
}
</script>
