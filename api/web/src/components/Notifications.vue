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
                                    <h1 class='card-title'>Notifications</h1>
                                    <div class='ms-auto btn-list'>
                                        <TrashIcon @click='clearNotifications' class='cursor-pointer'/>
                                        <SettingsIcon @click='$router.push("/notification/settings")' class='cursor-pointer'/>
                                    </div>
                                </div>
                            </div>
                            <div class="card-body">
                                <template v-if='!list.total'>
                                    <TablerNone label='Notifications' :create='false'/>
                                </template>
                                <template v-else>
                                    <div :key='notify.id' v-for='notify in list.notifications'  class='col my-2 d-flex'>
                                        <CircleDotIcon class='mx-2' /><span v-text='notify.text'/>
                                        <div class='ms-auto'>
                                            <TrashIcon @click='clearNotifications(notify)' class='cursor-pointer'/>
                                        </div>
                                    </div>
                                </template>
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
    TablerNone,
    TablerBreadCrumb,
    TablerLoading
} from '@tak-ps/vue-tabler';
import {
    SettingsIcon,
    CircleDotIcon,
    TrashIcon
} from 'vue-tabler-icons';

export default {
    name: 'Notifications',
    data: function() {
        return {
            loading: {
                list: true
            },
            list: {
                total: 0,
                notifications: []
            }
        }
    },
    mounted: async function() {
        await this.listNotifications();
    },
    methods: {
        listNotifications: async function() {
            this.loading.list = true;
            this.list = await window.std('/api/notification');
            this.loading.list = false;
        },
        clearNotifications: async function(notify=null) {
            this.loading.list = true;
            if (notify) {
                this.list = await window.std(`/api/notification/${notify.id}`, {
                    method: 'DELETE'
                });
            } else {
                this.list = await window.std('/api/notification', {
                    method: 'DELETE'
                });
            }
            this.loading.list = false;
        }
    },
    components: {
        TablerNone,
        SettingsIcon,
        CircleDotIcon,
        TablerLoading,
        TrashIcon,
        TablerBreadCrumb
    }
}
</script>
