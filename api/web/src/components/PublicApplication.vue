<template>
    <div class='page page-center'>
        <div class='container container-normal py-4'>
            <div class='row align-items-center g-4'>
                <div class='col-lg'>
                    <div class='container'>
                        <div class='card card-md'>
                            <div class='card-body'>
                                <div
                                    class='text-center'
                                    style='margin-bottom: 24px;'
                                >
                                    <img
                                        src='/logo.png'
                                        height='150'
                                    >
                                </div>
                                <h2 class='h2 text-center mb-4'>
                                    Apply for the Team
                                </h2>

                                <TablerLoading
                                    v-if='loading.schema'
                                    desc='Loading Application'
                                />
                                <TablerLoading
                                    v-else-if='loading.submit'
                                    desc='Submitting Application'
                                />
                                <template v-else-if='success'>
                                    <div class='d-flex justify-content-center mb-4'>
                                        <CheckIcon
                                            class='text-green'
                                            width='70'
                                            height='70'
                                        />
                                    </div>

                                    <div class='d-flex justify-content-center py-3'>
                                        <div>We've Recieved your application</div>
                                    </div>
                                    <div class='d-flex justify-content-center py-3'>
                                        <div>Give us a couple days to review it and we'll get back to you!</div>
                                    </div>
                                </template>
                                <template v-else>
                                    <TablerSchema
                                        v-model='data'
                                        :schema='schema'
                                    />
                                    <div class='row d-flex mx-2 my-4'>
                                        <button
                                            class='btn btn-primary'
                                            @click='submit'
                                        >
                                            Submit Application
                                        </button>
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
import {
    CheckIcon
} from 'vue-tabler-icons';

export default {
    name: 'PublicApplication',
    components: {
        CheckIcon,
        TablerSchema,
        TablerLoading
    },
    data: function() {
        return {
            success: false,
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
            try {
                await window.std('/api/application', {
                    method: 'POST',
                    body: this.data
                });
            } catch (err) {
                this.loading.submit = false;
                throw err;
            }
            this.loading.submit = false;
            this.success = true;
        }
    }
}
</script>
