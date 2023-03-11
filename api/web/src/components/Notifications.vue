<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <BreadCrumb/>
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
                                    <div class='ms-auto'>
                                        <TrashIcon click='clearNotifications' class='cursor-pointer'/>
                                    </div>
                                </div>
                            </div>
                            <div class="card-body">
                                <template v-if='!list.total'>
                                    <None label='Notifications' :create='false'/>
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
import None from './util/None.vue';
import BreadCrumb from './util/BreadCrumb.vue';
import {
    TablerLoading
} from '@tak-ps/vue-tabler';
import {
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
        clearNotifications: async function() {
            this.loading.list = true;
            this.list = await window.std('/api/notification', {
                method: 'DELETE'
            });
            this.loading.list = false;
        }
    },
    components: {
        None,
        TablerLoading,
        TrashIcon,
        BreadCrumb
    }
}
</script>
