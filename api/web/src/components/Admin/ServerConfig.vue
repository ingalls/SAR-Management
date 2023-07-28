<template>
<div class="card">
    <div class="card-header">
        <h1 class='card-title'>Server Config</h1>
    </div>
    <div class="card-body">
        <TablerLoading v-if='loading'/>
        <template v-else>
            <div class='col-12 pb-3'>
                <TablerInput label='Organisation Name' v-model='keys.name.key' :disabled='auth.access !== "admin"'/>
            </div>
            <div class='col-12 pb-3'>
                <TablerInput label='Frontend URL' v-model='keys.frontend.key' :disabled='auth.access !== "admin"'/>
            </div>
            <div v-if='auth.access === "admin"' class='col-12 pb-3 d-flex'>
                <div class='ms-auto'>
                    <button @click='save' class='btn btn-primary'>Update</button>
                </div>
            </div>
        </template>
    </div>
</div>
</template>

<script>
import {
    TablerLoading,
    TablerInput,
} from '@tak-ps/vue-tabler';

export default {
    name: 'AdminServerConfig',
    props: {
        auth: {
            type: Object,
            required: true
        }
    },
    data: function() {
        const res = {
            loading: true,
            keys: {}
        };
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
        this.loading = true;
        await Promise.all(Object.keys(this.keys).map((key) => this.fetch(key)));
        this.loading = false;
    },
    methods: {
        fetch: async function(key) {
            this.keys[key] = await window.std(`/api/server/${key}`);
        },
        save: async function() {
            this.loading = true;
            for (const key in this.keys) {
                await window.std(`/api/server/${key}`, {
                    method: 'PATCH',
                    body: this.keys[key]
                });
            }
            this.loading = false;
        }
    },
    components: {
        TablerLoading,
        TablerInput
    }
}
</script>
