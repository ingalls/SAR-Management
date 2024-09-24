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
                                        <IconTrash v-if='list.total' @click='clearNotifications' class='cursor-pointer' :size='32' :stroke='1'/>
                                        <IconSettings @click='$router.push("/notification/settings")' class='cursor-pointer' :size='32' :stroke='1'/>
                                    </div>
                                </div>
                            </div>
                            <div class="card-body">
                                <template v-if='!list.total'>
                                    <TablerNone label='Notifications' :create='false'/>
                                </template>
                                <template v-else>
                                    <div :key='notify.id' v-for='notify in list.items'  class='col py-2 d-flex align-items-center hover-light rounded'>
                                        <IconCircleDot class='mx-2' :size='32' :stroke='1'/>
                                        <span v-if='!notify.url' v-text='notify.text'/>
                                        <a v-else :href='notify.url' v-text='notify.text'/>
                                        <div class='ms-auto btn-list mx-2'>
                                            <IconTrash @click='clearNotifications(notify)' class='cursor-pointer' :size='32' :stroke='1'/>
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
    IconSettings,
    IconCircleDot,
    IconTrash
} from '@tabler/icons-vue';

export default {
    name: 'Notifications',
    data: function() {
        return {
            loading: {
                list: true
            },
            list: {
                total: 0,
                items: []
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

            this.$emit('notifications', this.list.total > 0);
            this.loading.list = false;
        },
        clearNotifications: async function(notify=null) {
            this.loading.list = true;

            if (notify && notify.id) {
                await window.std(`/api/notification/${notify.id}`, {
                    method: 'DELETE'
                });
            } else {
                await window.std('/api/notification', {
                    method: 'DELETE'
                });
            }
            await this.listNotifications();
            this.loading.list = false;
        }
    },
    components: {
        TablerNone,
        IconTrash,
        IconSettings,
        IconCircleDot,
        TablerLoading,
        TablerBreadCrumb
    }
}
</script>
