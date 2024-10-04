<template>
    <div class='mb-3'>
        <div class='row'>
            <div class='d-flex align-items-center mb-3'>
                <div
                    class='subheader'
                    v-text='label'
                />

                <div class='ms-auto'>
                    <div class='dropdown'>
                        <div
                            id='dropdownMenuButton1'
                            class='dropdown-toggle'
                            type='button'
                            data-bs-toggle='dropdown'
                            aria-expanded='false'
                        >
                            <SettingsIcon
                                class='cursor-pointer dropdown-toggle'
                                height='16'
                                width='16'
                            />
                        </div>
                        <ul
                            class='dropdown-menu'
                            aria-labelledby='dropdownMenuButton1'
                        >
                            <div class='m-1'>
                                <TablerInput
                                    v-model='filter'
                                    placeholder='Filter Teams'
                                />

                                <div
                                    v-for='team in list.items'
                                    :key='team.id'
                                    @click='push_teams(team)'
                                >
                                    <div class='d-flex align-items-center my-1 cursor-pointer'>
                                        <TeamBadge :team='team' />
                                    </div>
                                </div>
                            </div>
                        </ul>
                    </div>
                </div>
            </div>

            <template v-if='!teams.length'>
                <TablerNone
                    label='Teams Assigned'
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
                        <TrashIcon
                            height='16'
                            class='cursor-pointer'
                            @click='delete_teams(a_idx, a)'
                        />
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
import TeamBadge from './TeamBadge.vue';
import {
    SettingsIcon,
    TrashIcon
} from 'vue-tabler-icons';
import {
    TablerNone,
    TablerInput
} from '@tak-ps/vue-tabler'

export default {
    name: 'TeamSelect',
    components: {
        TablerNone,
        TeamBadge,
        SettingsIcon,
        TrashIcon,
        TablerInput
    },
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
        fieldable: {
            type: Boolean,
            default: undefined
        },
    },
    data: function() {
        return {
            filter: '',
            list: {
                items: []
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
            await this.listTeams();
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


            if (this.fieldable !== undefined) url.searchParams.append('fieldable', String(this.fieldable));
            const list = await window.std(url);

            const ids = this.teams.map((a) => a.id);

            this.list.items = list.items.filter((team) => {
                return !ids.includes(team.id);
            }).splice(0, this.limit);
        }
    }
}
</script>
