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
                                            Email Notification Settings
                                        </h1>
                                        <div class='ms-auto'>
                                            <TablerToggle
                                                v-model='list.disabled'
                                                label='All Disabled'
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div class='card-body'>
                                    <div class='row g-2'>
                                        <template v-for='setting in list.settings'>
                                            <div class='col-12 border-bottom pb-2'>
                                                <TablerToggle
                                                    v-model='setting.value'
                                                    :disabled='list.disabled'
                                                    :label='setting.name'
                                                />
                                            </div>
                                        </template>

                                        <div class='d-flex pt-3 pb-1'>
                                            <div class='ms-auto'>
                                                <button
                                                    class='btn btn-primary'
                                                    @click='postNotify'
                                                >
                                                    Save Settings
                                                </button>
                                            </div>
                                        </div>
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

<script setup>
import { reactive, watch, onMounted } from 'vue';
import {
    TablerBreadCrumb,
    TablerToggle,
    TablerLoading
} from '@tak-ps/vue-tabler';

const loading = reactive({
    list: true
})

const list = reactive({
    disabled: false,
    settings: []
})

watch(() => list.disabled, () => {
    if (!list.disabled) return;
    list.settings.forEach((s) => s.value = false);
})

async function fetch() {
    loading.list = true;
    const result = await window.std('/api/notification/settings');
    list.disabled = result.disabled;
    list.settings = result.settings;
    loading.list = false;
}

async function postNotify() {
    loading.list = true;
    const body = JSON.parse(JSON.stringify(list));
    
    const result = await window.std('/api/notification/settings', {
        method: 'PATCH',
        body
    });
    list.disabled = result.disabled;
    list.settings = result.settings;
    loading.list = false;
}

onMounted(async () => {
    await fetch();
})

defineExpose({
    postNotify
})
</script>
