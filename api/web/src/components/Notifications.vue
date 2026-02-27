<template>
    <div>
        <div class='page-wrapper'>
            <div class='page-header d-print-none'>
                <div class='container-xl'>
                    <div class='row g-2 align-items-center'>
                        <div class='col d-flex'>
                            <TablerBreadCrumb />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class='page-body'>
            <div class='container-xl'>
                <div class='row row-deck row-cards'>
                    <div class='col-lg-12'>
                        <div class='card'>
                            <TablerLoading v-if='loading.list' />
                            <template v-else>
                                <div class='card-header'>
                                    <div class='col d-flex'>
                                        <h1 class='card-title'>
                                            Notifications
                                        </h1>
                                        <div class='ms-auto btn-list'>
                                            <TablerIconButton
                                                v-if='list.total'
                                                title='Clear All'
                                                @click='clearNotifications'
                                            >
                                                <IconTrash
                                                    :size='32'
                                                    :stroke='1'
                                                />
                                            </TablerIconButton>
                                            <TablerIconButton
                                                title='Settings'
                                                @click='$router.push("/notification/settings")'
                                            >
                                                <IconSettings
                                                    :size='32'
                                                    :stroke='1'
                                                />
                                            </TablerIconButton>
                                        </div>
                                    </div>
                                </div>
                                <div class='card-body'>
                                    <template v-if='!list.total'>
                                        <TablerNone
                                            label='No Notifications'
                                            :create='false'
                                        />
                                    </template>
                                    <template v-else>
                                        <div
                                            v-for='notify in list.items'
                                            :key='notify.id'
                                            class='col py-2 d-flex align-items-center hover-light rounded'
                                        >
                                            <IconCircleDot
                                                class='mx-2'
                                                :size='32'
                                                :stroke='1'
                                            />
                                            <span
                                                v-if='!notify.url'
                                                v-text='notify.text'
                                            />
                                            <a
                                                v-else
                                                :href='notify.url'
                                                v-text='notify.text'
                                            />
                                            <div class='ms-auto btn-list mx-2'>
                                                <IconTrash
                                                    class='cursor-pointer'
                                                    :size='32'
                                                    :stroke='1'
                                                    @click='clearNotifications(notify)'
                                                />
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

<script setup>
import { reactive, onMounted } from 'vue';
import {
    TablerNone,
    TablerIconButton,
    TablerBreadCrumb,
    TablerLoading
} from '@tak-ps/vue-tabler';
import {
    IconSettings,
    IconCircleDot,
    IconTrash
} from '@tabler/icons-vue';

const emit = defineEmits(['notifications'])

const loading = reactive({
    list: true
})

const list = reactive({
    total: 0,
    items: []
})

async function listNotifications() {
    loading.list = true;
    const result = await window.std('/api/notification');
    list.total = result.total;
    list.items = result.items;

    emit('notifications', list.total > 0);
    loading.list = false;
}

async function clearNotifications(notify=null) {
    loading.list = true;

    if (notify && notify.id) {
        await window.std(`/api/notification/${notify.id}`, {
            method: 'DELETE'
        });
    } else {
        await window.std('/api/notification', {
            method: 'DELETE'
        });
    }
    await listNotifications();
    loading.list = false;
}

onMounted(async () => {
    await listNotifications();
})

defineExpose({
    clearNotifications
})
</script>
