<template>
    <div class='card'>
        <div class='card-header'>
            <h1 class='card-title'>
                Server Config
            </h1>
        </div>
        <div class='card-body'>
            <TablerLoading v-if='loading' />
            <template v-else>
                <div class='col-12 pb-3'>
                    <TablerInput
                        v-model='keys.name.value'
                        label='Organisation Name (Public)'
                        :disabled='auth.access !== "admin"'
                    />
                </div>
                <div class='col-12 pb-3'>
                    <TablerInput
                        v-model='keys.frontend.value'
                        label='Frontend URL (Public)'
                        :disabled='auth.access !== "admin"'
                    />
                </div>
                <div class='col-12 pb-3'>
                    <TimeZone
                        v-model='keys.timezone.value'
                        label='Default Timezone'
                        :disabled='auth.access !== "admin"'
                    />
                </div>
                <div
                    v-if='auth.access === "admin"'
                    class='col-12 pb-3 d-flex'
                >
                    <div class='ms-auto'>
                        <button
                            class='btn btn-primary'
                            @click='save'
                        >
                            Update
                        </button>
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
import TimeZone from '../util/TimeZone.vue';

export default {
    name: 'AdminServerConfig',
    components: {
        TimeZone,
        TablerLoading,
        TablerInput
    },
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
        for (const key of [
            'name',
            'frontend',
            'timezone'
        ]) {
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
            try {
                this.keys[key] = await window.std(`/api/server/${key}`);
            } catch (err) {
                if (err.message === 'server not found') {
                    this.keys[key] = {
                        key: '',
                        value: '',
                        public: false
                    }
                } else {
                    throw err;
                }
            }
        },
        save: async function() {
            this.loading = true;
            for (const key in this.keys) {
                await window.std(`/api/server`, {
                    method: 'PUT',
                    body: {
                        key,
                        public: this.keys[key].public,
                        value: this.keys[key].value,
                    }
                });
            }
            this.loading = false;
        }
    }
}
</script>
