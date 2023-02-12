<template>
<div class="card">
    <div class='card-header'>
        <div class="col">
            <div class="d-flex">
                <h3 class='card-title'>Teams</h3>

                <div class='ms-auto'>
                    <div class="btn-list">
                        <button data-bs-toggle="dropdown" type="button" class="btn dropdown-toggle dropdown-toggle-split" aria-expanded="false"></button>
                        <div class="dropdown-menu dropdown-menu-end" style="">
                            <a @click='$router.push("/team/new")' class="dropdown-item cursor-pointer">New Team</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <template v-if='loading.teams'>
        <TablerLoading desc='Loading Teams'/>
    </template>
    <template v-else-if='teams.total == 0'>
        <None label='Teams' @create='$router.push("/team/new")'/>
    </template>
    <template v-else>
        <div class="table-responsive">
            <table class="table card-table table-vcenter text-nowrap datatable">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Members</th>
                    </tr>
                </thead>
                <tbody>
                    <tr :key='team.id' v-for='team in teams.teams'>
                        <td><a @click='$router.push(`/team/${team.id}`)' class='cursor-pointer' v-text='team.name'></a></td>
                        <td v-text='team.members  || "None"'></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </template>

    <TableFooter :limit='paging.limit' :total='teams.total' @page='paging.page = $event'/>
</div>
</template>

<script>
import {
    TablerLoading
} from '@tak-ps/vue-tabler';
import None from '../util/None.vue';
import TableFooter from '../util/TableFooter.vue';

export default {
    name: 'CardTeams',
    data: function() {
        return {
            loading: {
                teams: true
            },
            paging: {
                limit: 10,
                page: 0
            },
            teams: {
                total: 0,
                teams: []
            }
        }
    },
    watch: {
        'paging.page': async function() {
            await this.listUsers();
        }
    },
    mounted: async function() {
        await this.listTeams();
    },
    methods: {
        listTeams: async function() {
            this.loading.teams = true;
            const url = window.stdurl('/api/team');
            url.searchParams.append('limit', this.paging.limit);
            url.searchParams.append('page', this.paging.page);
            this.teams = await window.std(url);

            this.loading.teams = false;
        }
    },
    components: {
        None,
        TablerLoading,
        TableFooter
    }
}
</script>
