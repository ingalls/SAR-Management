<template>
<div class='mb-3'>
    <div class='row'>
        <div class="d-flex align-items-center mb-3">
            <div class="subheader" v-text='label'></div>

            <div class='ms-auto'>
                <div class="dropdown">
                    <div class="dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                        <SettingsIcon
                            class='cursor-pointer dropdown-toggle'
                            height=16
                            width=16
                        />
                    </div>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                        <div class='m-1'>
                            <TablerInput placeholder='Filter Teams' v-model='filter'/>

                            <div @click='push_teams(team)' :key='team.id' v-for='team in list.teams'>
                                <div class="d-flex align-items-center my-1 cursor-pointer">
                                    <TeamBadge :team='team'/>
                                </div>
                            </div>
                        </div>
                    </ul>
                </div>
            </div>
        </div>

        <template v-if='!teams.length'>
            <None label='Teams Assigned' :create='false' :compact='true'/>
        </template>
        <template v-else>
            <div :key='a.id' v-for='(a, a_idx) in teams' class="d-flex align-items-center my-1">
                <TeamBadge :team='a'/>
                <div class='ms-auto'>
                    <TrashIcon @click='delete_teams(a_idx, a)' height='16' class='cursor-pointer'/>
                </div>
            </div>
        </template>
    </div>
</div>
</template>

<script>
import None from './None.vue';
import TeamBadge from './TeamBadge.vue';
import {
    SettingsIcon,
    TrashIcon
} from 'vue-tabler-icons';
import {
    TablerInput
} from '@tak-ps/vue-tabler'

export default {
    name: 'TeamSelect',
    props: {
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
    },
    data: function() {
        return {
            filter: '',
            list: {
                teams: []
            },
            teams: []
        }
    },
    watch: {
        modelValue: function() {
            this.teams = this.modelValue;
        },
        filter: async function() {
            await this.listTeams();
        },
        teams: function() {
            this.$emit('update:modelValue', this.teams);
        }
    },
    mounted: async function() {
        this.teams = this.modelValue;
        await this.listTeams();
    },
    methods: {
        push_teams: async function(team) {
            this.teams.push(team);
            this.$emit('push', team);
        },
        delete_teams: async function(idx, team) {
            this.teams.splice(idx, 1);
            this.$emit('delete', team);
            await this.listTeams();
        },
        listTeams: async function() {
            const url = window.stdurl('/api/team');
            url.searchParams.append('filter', this.filter);
            url.searchParams.append('limit', this.limit + this.teams.length);
            const list = await window.std(url);

            const ids = this.teams.map((a) => a.uid);
            this.list.teams = list.teams.filter((team) => {
                return !ids.includes(team.id);
            }).splice(0, this.limit);
        }
    },
    components: {
        None,
        TeamBadge,
        SettingsIcon,
        TrashIcon,
        TablerInput
    }
}
</script>
