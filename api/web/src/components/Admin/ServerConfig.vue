<template>
<div class="card">
    <div class="card-header">
        <h1 class='card-title'>Server Config</h1>
    </div>
    <div class="card-body">
        <div class='col-12'>
            <TablerInput label='Organisation Name' v-model='keys.name.key'/>
        </div>
    </div>
</div>
</template>

<script>
import {
    TablerInput
} from '@tak-ps/vue-tabler';

export default {
    name: 'AdminServerConfig',
    data: function() {
        const res = { keys: {} };
        for (const key of ['name', 'frontend']) {
            res.keys[key] = {
                key: '',
                value: '',
                public: false
            }
        }

        return res;
    },
    mounted: async function() {
        await Promise.all(Object.keys(this.keys).map((key) =>  this.fetch));
    },
    methods: {
        fetch: async function(key) {
            this.keys[key] = await window.stdurl(`/api/server/${key}`);
        }
    },
    components: {
        TablerInput
    }
}
</script>
