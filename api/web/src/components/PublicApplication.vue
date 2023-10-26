<template>
<div class="page page-center">
    <div class="container container-normal py-4">
        <div class="row align-items-center g-4">
            <div class="col-lg">
                <div class="container">
                    <div class="card card-md">
                        <div class="card-body">
                            <div class='text-center' style='margin-bottom: 24px;'>
                                <img src='/logo.png' height='150'/>
                            </div>
                            <h2 class="h2 text-center mb-4">Apply for the Team</h2>

                            <TablerLoading v-if='loading.schema' desc='Loading Application'/>
                            <TablerLoading v-else-if='loading.submit' desc='Submitting Application'/>
                            <template v-else>
                                <TablerSchema :schema='schema' v-model='data'/>
                                <div class='row d-flex mx-2 my-4'>
                                    <button @click='submit' class='btn btn-primary'>Submit Application</button>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import {
    TablerSchema,
    TablerLoading
} from '@tak-ps/vue-tabler'

export default {
    name: 'PublicApplication',
    data: function() {
        return {
            loading: {
                schema: true,
                submit: false
            },
            schema: {},
            data: {}
        }
    },
    mounted: async function() {
        await this.getSchema();
    },
    methods: {
        getSchema: async function() {
            this.loading.schema = true;
            this.schema = JSON.parse((await window.std('/api/server/application')).value);
            this.loading.schema = false;
        },
        submit: async function() {
            this.loading.submit = true;
            await window.std('/api/application', {
                method: 'POST',
                body: this.data
            });
            this.loading.submit = false;
        }
    },
    components: {
        TablerSchema,
        TablerLoading
    }
}
</script>
