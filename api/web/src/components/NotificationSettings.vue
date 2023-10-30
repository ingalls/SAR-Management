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
                                    <div class='ms-auto'>
                                        <TablerToggle label='All Disabled' v-model='list.disabled'/>
                                    </div>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class='row g-2'>
                                    <template v-for='setting in list.settings'>
                                        <div class='col-12 border-bottom pb-2'>
                                            <TablerToggle :label='setting.name' v-model='setting.value'/>
                                        </div>
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
                disabled: false,
                settings: []
            }
        }
    },
    watch: {
        list: {
            deep: true,
            handler: async function() {
                const res = JSON.parse(JSON.stringify(this.list));
                if (res.disabled) res.settings = [];

                this.postNotify(res);
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
        postNotify: async function(body) {
            this.list = await window.std('/api/notification/settings', {
                method: 'PATCH',
                body
            });
        },
    },
    components: {
        TablerLoading,
        TablerToggle,
        TablerBreadCrumb
    }
}
</script>
