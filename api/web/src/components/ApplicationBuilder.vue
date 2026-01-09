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
                        <TablerLoading
                            v-if='loading'
                            desc='Loading Schema'
                        />
                        <TablerSchemaBuilder
                            v-else
                            v-model='schema'
                            title='Application Builder'
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import {
    TablerLoading,
    TablerBreadCrumb,
    TablerSchemaBuilder
} from '@tak-ps/vue-tabler';

defineProps({
    iam: {
        type: Object,
        required: true
    },
    auth: {
        type: Object,
        required: true
    }
})

const loading = ref(true);
const schema = ref({});

watch(schema, async () => {
    await saveSchema();
}, { deep: true });

onMounted(async () => {
    await fetch();
});

async function fetch() {
    loading.value = true;
    schema.value = JSON.parse((await window.std('/api/server/application')).value);
    loading.value = false;
}

async function saveSchema() {
    loading.value = true;
    await window.std('/api/server', {
        method: 'PUT',
        body: {
            key: 'application',
            value: JSON.stringify(schema.value),
            public: true
        }
    });
    loading.value = false;
}
</script>
