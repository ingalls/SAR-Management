<template>
<TablerDropdown>
    <template #default>
        <TablerInput
            :required='required'
            :disabled='disabled'
            :error='error'
            label='Location Name'
            placeholder='Location Name'
            v-model='filter'
        />
    </template>
    <template #dropdown>
        <TablerLoading v-if='loading'/>
        <TablerNone v-if='list.total === 0' :compact='true' :create='false'/>
        <div v-else>
            <div class='m-1'>
                <div @click='select(loc)' :key='loc.id' v-for='loc in list.items'>
                    <div class="d-flex align-items-center my-1 cursor-pointer">
                        <span v-text='loc.location'/>
                    </div>
                </div>
            </div>
        </div>
    </template>
</TablerDropdown>
</template>

<script>
import {
    TablerNone,
    TablerInput,
    TablerLoading,
    TablerDropdown
} from '@tak-ps/vue-tabler'

export default {
    name: 'LocationDropdown',
    props: {
        modelValue: {
            type: String,
            required: true
        },
        disabled: {
            type: Boolean,
            default: false
        },
        required: {
            type: Boolean,
            default: false
        },
        error: {
            type: String,
            default: ''
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
            }
        }
    },
    watch: {
        modelValue: function() {
            this.filter = this.modelValue || '';
        },
        filter: async function() {
            this.$emit("update:modelValue", this.filter)
            await this.listLocs();
        }
    },
    mounted: async function() {
        this.filter = this.modelValue || '';
        await this.listLocs();
    },
    methods: {
        select: function(loc) {
            this.filter = loc.location;
            this.$emit("locGeom", loc.location_geom)
        },
        listLocs: async function() {
            const url = window.stdurl('/api/location');
            url.searchParams.append('filter', this.filter);
            url.searchParams.append('limit', this.limit);
            this.list = await window.std(url);
        }
    },
    components: {
        TablerNone,
        TablerInput,
        TablerLoading,
        TablerDropdown
    }
}
</script>
