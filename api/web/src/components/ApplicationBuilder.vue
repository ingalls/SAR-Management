<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <TablerBreadCrumb/>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div class="col-lg-12">
                    <TablerLoading v-if='loading' desc='Loading Schema'/>
                    <Builder v-else title='Application Builder' v-model='schema'/>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import Builder from './util/Builder.vue';
import {
    TablerInput,
    TablerLoading,
    TablerBreadCrumb,
} from '@tak-ps/vue-tabler';

export default {
    name: 'ApplicationBuilder',
    props: {
        iam: {
            type: Object,
            required: true
        },
        auth: {
            type: Object,
            required: true
        }
    },
    data: function() {
        return {
            loading: true,
            schema: {}
        }
    },
    mounted: async function() {
        await this.fetch();
    },
    watch: {
        schema: {
            deep: true,
            handler: async function() {
                await this.saveSchema();
            }
        }
    },
    methods: {
        fetch: async function() {
            this.loading = true;
            this.schema = JSON.parse((await window.std('/api/server/application')).value);
            this.loading = false;
        },
        saveSchema: async function() {
            this.loading = true;
            await window.std('/api/server', {
                method: 'PUT',
                body: {
                    key: 'application',
                    value: JSON.stringify(this.schema),
                    public: true
                }
            });
            this.loading = false;
        }
    },
    components: {
        Builder,
        TablerInput,
        TablerLoading,
        TablerBreadCrumb,
    }
}
</script>
