<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a @click='$router.push("/")' class='cursor-pointer'>Home</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="#">Notifications</a></li>
                        </ol>
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
                        <div class="card-body">
                            <template v-if='!list.total'>
                                <None label='Notifications' :create='false'/>
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
import None from './util/None.vue';

export default {
    name: 'Notifications',
    data: function() {
        return {
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
            this.list = await window.std('/api/notification');
        }
    },
    components: {
        None,
    }
}
</script>
