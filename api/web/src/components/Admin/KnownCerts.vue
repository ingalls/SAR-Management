<template>
    <div class='card'>
        <div class='card-header d-flex align-items-center'>
            <h3 class='card-title'>
                Known Certificates
            </h3>

            <div class='ms-auto btn-list'>
                <TablerIconButton
                    title='Add Certificate'
                    @click='push()'
                >
                    <IconPlus
                        size='32'
                        :stroke='1'
                    />
                </TablerIconButton>
            </div>
        </div>

        <div
            v-if='error'
            class='card-body pb-0'
        >
            <Alert
                :label='error'
                compact
            />
        </div>

        <TablerLoading v-if='loading' />
        <TablerNone
            v-else-if='!list.items.length'
            :create='false'
            label='No Known Certificates'
        />
        <table
            v-else
            class='table card-table table-vcenter'
        >
            <thead>
                <tr>
                    <th>Name</th>
                    <th class='text-right'>
                        Updated
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for='(cert, certit) in list.items'
                    :key='cert.id || certit'
                >
                    <td
                        v-if='cert._edit'
                        colspan='2'
                    >
                        <div class='d-flex align-items-center'>
                            <TablerInput
                                v-model='cert.name'
                                placeholder='Certificate Name'
                                @keyup.enter='saveCert(cert, certit)'
                            />
                            <div class='ms-auto btn-list'>
                                <TablerIconButton
                                    title='Save Certificate'
                                    @click='saveCert(cert, certit)'
                                >
                                    <IconCheck
                                        size='32'
                                        :stroke='1'
                                    />
                                </TablerIconButton>
                                <TablerIconButton
                                    title='Delete Certificate'
                                    @click='deleteCert(cert, certit)'
                                >
                                    <IconTrash
                                        size='32'
                                        :stroke='1'
                                    />
                                </TablerIconButton>
                            </div>
                        </div>
                    </td>
                    <template v-else>
                        <td>
                            <span v-text='cert.name' />
                        </td>
                        <td>
                            <div class='d-flex align-items-center'>
                                <TablerEpoch :date='cert.updated' />
                                <div class='ms-auto btn-list'>
                                    <TablerIconButton
                                        title='Edit Certificate'
                                        @click='cert._edit = true; error = ""'
                                    >
                                        <IconPencil
                                            size='32'
                                            :stroke='1'
                                        />
                                    </TablerIconButton>
                                </div>
                            </div>
                        </td>
                    </template>
                </tr>
            </tbody>
        </table>

        <TableFooter
            v-if='!loading'
            :limit='limit'
            :total='list.total'
            @page='page = $event'
        />
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import {
    IconPlus,
    IconPencil,
    IconCheck,
    IconTrash
} from '@tabler/icons-vue';
import {
    TablerIconButton,
    TablerEpoch,
    TablerLoading,
    TablerInput,
    TablerNone
} from '@tak-ps/vue-tabler';
import Alert from '../util/Alert.vue';
import TableFooter from '../util/TableFooter.vue';

const loading = ref(true);
const error = ref('');
const limit = 10;
const page = ref(0);
const list = reactive({
    total: 0,
    items: []
});

const fetch = async () => {
    loading.value = true;
    error.value = '';

    try {
        const url = window.stdurl('/api/certs');
        url.searchParams.append('limit', String(limit));
        url.searchParams.append('page', String(page.value));

        const result = await window.std(url);
        list.total = result.total;
        list.items = result.items;
    } catch (err) {
        error.value = err.message;
    }

    loading.value = false;
};

const saveCert = async (cert, certit) => {
    error.value = '';

    try {
        if (cert.id) {
            const newcert = await window.std(`/api/certs/${cert.id}`, {
                method: 'PATCH',
                body: { name: cert.name }
            });
            list.items.splice(certit, 1, newcert);
        } else {
            await window.std('/api/certs', {
                method: 'POST',
                body: { name: cert.name }
            });
            page.value = 0;
            await fetch();
        }
    } catch (err) {
        error.value = err.message;
    }
};

const deleteCert = async (cert) => {
    error.value = '';

    try {
        if (cert.id) {
            await window.std(`/api/certs/${cert.id}`, {
                method: 'DELETE',
            });
        }

        if (list.items.length === 1 && page.value > 0) {
            page.value = page.value - 1;
        } else {
            await fetch();
        }
    } catch (err) {
        error.value = err.message;
    }
};

const push = () => {
    error.value = '';

    list.items.splice(0, 0, {
        _edit: true,
        name: '',
        updated: +new Date(),
        created: +new Date()
    });
};

onMounted(async () => {
    await fetch();
});

watch(page, async () => {
    await fetch();
});
</script>