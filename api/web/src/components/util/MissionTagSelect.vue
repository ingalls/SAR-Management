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
                                    placeholder='Filter Tags'
                                />

                                <div
                                    v-for='tag in list.items'
                                    class='cursor-pointer hover-light mx-1 my-1 px-2 py-2'
                                    @click='push_tags(tag)'
                                >
                                    <span v-text='tag.name' />
                                </div>
                            </div>
                        </template>
                    </TablerDropdown>
                </div>
            </div>

            <template v-if='!tags.length'>
                <TablerNone
                    label='Tags Assigned'
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
                    <span v-text='a.name' />
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
            default: 'Tags'
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
        push_tags: async function(tag) {
            this.tags.push(tag);
            this.$emit('push', tag);
            await this.listTags();
        },
        delete_tags: async function(idx, tag) {
            this.tags.splice(idx, 1);
            this.$emit('delete', tag);
            await this.listTags();
        },
        listTags: async function() {
            const url = window.stdurl('/api/mission-tag');
            url.searchParams.append('filter', this.filter);
            url.searchParams.append('limit', this.limit + this.tags.length);

            const list = await window.std(url);

            const ids = this.tags.map((a) => a.id);

            this.list.items = list.items.filter((tag) => {
                return !ids.includes(tag.id);
            }).splice(0, this.limit);
        }
    }
}
</script>
