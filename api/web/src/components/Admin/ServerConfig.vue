<template>
    <div class='card'>
        <div class='card-header'>
            <h1 class='card-title'>
                Server Config
            </h1>
        </div>
        <div class='card-body'>
            <TablerLoading v-if='loading' />
            <template v-else>
                <div class='col-12 pb-3'>
                    <TablerInput
                        v-model='keys.name.value'
                        label='Organisation Name (Public)'
                        :disabled='auth.access !== "admin"'
                    />
                </div>
                <div class='col-12 pb-3'>
                    <TablerInput
                        v-model='keys.frontend.value'
                        label='Frontend URL (Public)'
                        :disabled='auth.access !== "admin"'
                    />
                </div>
                <div class='col-12 pb-3'>
                    <TablerTimeZone
                        v-model='keys.timezone.value'
                        label='Default Timezone'
                        :disabled='auth.access !== "admin"'
                    />
                </div>
                <div
                    v-if='auth.access === "admin"'
                    class='col-12 pb-3 d-flex'
                >
                    <div class='ms-auto'>
                        <button
                            class='btn btn-primary'
                            @click='save'
                        >
                            Update
                        </button>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import {
    TablerLoading,
    TablerTimeZone,
    TablerInput,
} from '@tak-ps/vue-tabler';

const props = defineProps({
    auth: {
        type: Object,
        required: true
    }
});

const loading = ref(true);
const keys = reactive({});

for (const key of ['name', 'frontend', 'timezone']) {
    keys[key] = {
        key: '',
        value: '',
        public: false
    }
}

const fetch = async (key) => {
    try {
        keys[key] = await window.std(`/api/server/${key}`);
    } catch (err) {
        if (err.message === 'server not found') {
            keys[key] = {
                key: '',
                value: '',
                public: false
            }
        } else {
            throw err;
        }
    }
};

const save = async () => {
    loading.value = true;
    for (const key in keys) {
        await window.std(`/api/server`, {
            method: 'PUT',
            body: {
                key,
                public: keys[key].public,
                value: keys[key].value,
            }
        });
    }
    loading.value = false;
};

onMounted(async () => {
    loading.value = true;
    await Promise.all(Object.keys(keys).map((key) => fetch(key)));
    loading.value = false;
});
</script>
