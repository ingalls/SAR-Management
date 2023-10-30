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
                    <div class="card">
                        <TablerLoading v-if='loading.list'/>
                        <template v-else>
                            <div class="card-header">
                                <div class='col d-flex'>
                                    <h1 class='card-title'>Email Notification Settings</h1>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class='row g-2'>
                                    <template v-for='setting in list.settings'>
                                        <TablerToggle :label='setting.name' v-model='setting.value'/>
                                    </template>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import {
    TablerBreadCrumb,
    TablerToggle,
    TablerLoading
} from '@tak-ps/vue-tabler';

export default {
    name: 'NotificationsSettings',
    data: function() {
        return {
            loading: {
                list: true
            },
            list: {
                settings: []
            }
        }
    },
    mounted: async function() {
        await this.fetch();
    },
    methods: {
        fetch: async function() {
            this.loading.list = true;
            this.list = await window.std('/api/notification/settings');
            this.loading.list = false;
        },
    },
    components: {
        TablerLoading,
        TablerToggle,
        TablerBreadCrumb
    }
}
</script>
