<template>
    <div class='mb-3'>
        <div class='row'>
            <div class='d-flex align-items-center mb-3'>
                <div
                    class='subheader'
                    v-text='label'
                />

                <div class='ms-auto'>
                    <TablerDropdown>
                        <IconSettings
                            class='cursor-pointer dropdown-toggle'
                            size='16'
                            stroke='1'
                        />
                        <template #dropdown>
                            <div class='m-1'>
                                <TablerInput
                                    v-model='filter'
                                    placeholder='Filter Teams'
                                />

                                <div
                                    v-for='tag in list.items'
                                    @click='push_tags(team)'
                                >
                                    <span v-text='tag'/>
                                </div>
                            </div>
                        </template>
                    </TablerDropdown>
                </div>
            </div>

            <template v-if='!tags.length'>
                <TablerNone
                    label='Teams Assigned'
                    :create='false'
                    :compact='true'
                />
            </template>
            <template v-else>
                <div
                    v-for='(a, a_idx) in tags'
                    :key='a.id'
                    class='d-flex align-items-center my-1'
                >
                    <TeamBadge :team='a' />
                    <div class='ms-auto'>
                        <IconTrash
                            size='16'
                            stroke='1'
                            class='cursor-pointer'
                            @click='delete_tags(a_idx, a)'
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
    IconSettings,
    IconTrash
} from '@tabler/icons-vue';
import {
    TablerNone,
    TablerInput,
    TablerDropdown
} from '@tak-ps/vue-tabler'

export default {
    name: 'MissionTagSelect',
    components: {
        TablerNone,
        TablerDropdown,
        TeamBadge,
        IconSettings,
        IconTrash,
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
    },
    data: function() {
        return {
            filter: '',
            list: {
                items: []
            },
            tags: []
        }
    },
    watch: {
        modelValue: function() {
            this.tags = this.modelValue;
        },
        filter: async function() {
            await this.listTags();
        },
        tags: function() {
            this.$emit('update:modelValue', this.tags);
        }
    },
    mounted: async function() {
        this.tags = this.modelValue;
        await this.listTags();
    },
    methods: {
        push_tags: async function(team) {
            this.tags.push(team);
            this.$emit('push', team);
            await this.listTags();
        },
        delete_tags: async function(idx, team) {
            this.tags.splice(idx, 1);
            this.$emit('delete', team);
            await this.listTags();
        },
        listTags: async function() {
            const url = window.stdurl('/api/mission-tag');
            url.searchParams.append('filter', this.filter);
            url.searchParams.append('limit', this.limit + this.tags.length);

            const list = await window.std(url);

            const ids = this.tags.map((a) => a.id);

            this.list.items = list.items.filter((team) => {
                return !ids.includes(team.id);
            }).splice(0, this.limit);
        }
    }
}
</script>
