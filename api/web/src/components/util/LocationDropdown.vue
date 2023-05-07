<template>
<div class="dropdown">
    <div type="button" id="dropdownLocation" data-bs-toggle="dropdown" aria-expanded="false">
        <TablerInput :disabled='disabled' placeholder='Location Name' v-model='filter'/>
    </div>
    <ul class="dropdown-menu" aria-labelledby="dropdownLocation">
        <div class='m-1'>
            <div @click='select(loc)' :key='loc.id' v-for='loc in list.locations'>
                <div class="d-flex align-items-center my-1 cursor-pointer">
                    <span v-text='loc.location'/>
                </div>
            </div>
        </div>
    </ul>
</div>
</template>

<script>
import {
    TablerInput
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
        limit: {
            type: Number,
            default: 10
        },
    },
    data: function() {
        return {
            filter: '',
            list: {
                locations: []
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
        TablerInput
    }
}
</script>
