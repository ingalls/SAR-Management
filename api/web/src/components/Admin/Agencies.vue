<template>
    <div>
        <div class='card'>
            <div class='card-header'>
                <h3 class='card-title'>
                    Agencies
                </h3>
                <div class='card-actions'>
                    <button
                        class='btn btn-primary'
                        @click='showNewAgency = true'
                    >
                        <IconPlus class='me-2' />
                        Add Agency
                    </button>
                </div>
            </div>
            <div class='card-body'>
                <div class='mb-3'>
                    <TablerInput
                        v-model='filter'
                        placeholder='Filter agencies...'
                        icon='search'
                    />
                </div>
                <TablerLoading v-if='loading' />
                <TablerNone
                    v-else-if='!agencies.items.length'
                    label='No Agencies Found'
                    :create='false'
                />
                <div
                    v-else
                    class='table-responsive'
                >
                    <table class='table table-vcenter card-table'>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Created</th>
                                <th>Updated</th>
                                <th>Status</th>
                                <th class='w-1'></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for='agency in agencies.items'
                                :key='agency.id'
                            >
                                <td>
                                    <div class='d-flex align-items-center'>
                                        <div
                                            v-if='agency.logo'
                                            class='me-2'
                                        >
                                            <img
                                                :src='agency.logo'
                                                alt='Logo'
                                                style='width: 32px; height: 32px; object-fit: contain;'
                                            >
                                        </div>
                                        <div v-text='agency.name' />
                                    </div>
                                </td>
                                <td>
                                    <TablerEpoch :date='agency.created' />
                                </td>
                                <td>
                                    <TablerEpoch :date='agency.updated' />
                                </td>
                                <td>
                                    <span
                                        class='badge'
                                        :class='agency.archived ? "bg-secondary" : "bg-success"'
                                    >
                                        {{ agency.archived ? 'Archived' : 'Active' }}
                                    </span>
                                </td>
                                <td>
                                    <div class='btn-list'>
                                        <TablerIconButton
                                            title='Edit'
                                            @click='editAgency(agency)'
                                        >
                                            <IconPencil />
                                        </TablerIconButton>
                                        <TablerIconButton
                                            v-if='!agency.archived'
                                            title='Archive'
                                            @click='archiveAgency(agency)'
                                        >
                                            <IconArchive />
                                        </TablerIconButton>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <TableFooter
                    v-if='!loading && agencies.total > limit'
                    :total='agencies.total'
                    :limit='limit'
                    @page='page = $event'
                />
            </div>
        </div>

        <div
            v-if='showNewAgency || editingAgency'
            class='modal modal-blur fade show'
            style='display: block;'
            @click.self='closeModal'
        >
            <div class='modal-dialog modal-dialog-centered'>
                <div class='modal-content'>
                    <div class='modal-header'>
                        <h5 class='modal-title'>
                            {{ editingAgency ? 'Edit Agency' : 'New Agency' }}
                        </h5>
                        <button
                            type='button'
                            class='btn-close'
                            @click='closeModal'
                        />
                    </div>
                    <div class='modal-body'>
                        <TablerInput
                            v-model='agencyForm.name'
                            label='Agency Name'
                            placeholder='Enter agency name'
                            required
                        />
                        <div class='mt-3'>
                            <TablerInput
                                v-model='agencyForm.logo'
                                label='Logo URL'
                                placeholder='https://example.com/logo.png'
                            />
                        </div>
                        <div
                            v-if='agencyForm.logo'
                            class='mt-2'
                        >
                            <img
                                :src='agencyForm.logo'
                                alt='Logo preview'
                                style='max-width: 200px; max-height: 100px; object-fit: contain;'
                            >
                        </div>
                    </div>
                    <div class='modal-footer'>
                        <button
                            type='button'
                            class='btn btn-secondary'
                            @click='closeModal'
                        >
                            Cancel
                        </button>
                        <button
                            type='button'
                            class='btn btn-primary'
                            :disabled='saving'
                            @click='saveAgency'
                        >
                            <span
                                v-if='saving'
                                class='spinner-border spinner-border-sm me-2'
                            />
                            {{ saving ? 'Saving...' : 'Save' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import {
    IconPlus,
    IconPencil,
    IconArchive
} from '@tabler/icons-vue';
import {
    TablerInput,
    TablerIconButton,
    TablerLoading,
    TablerNone,
    TablerEpoch
} from '@tak-ps/vue-tabler';
import TableFooter from '../util/TableFooter.vue';

const loading = ref(true);
const saving = ref(false);
const limit = 25;
const page = ref(0);
const filter = ref('');
const showNewAgency = ref(false);
const editingAgency = ref(null);

const agencies = reactive({
    total: 0,
    items: []
});

const agencyForm = reactive({
    name: '',
    logo: ''
});

const fetchAgencies = async () => {
    loading.value = true;
    try {
        const url = window.stdurl('/api/agency');
        url.searchParams.append('limit', String(limit));
        url.searchParams.append('page', String(page.value));
        url.searchParams.append('filter', filter.value);
        url.searchParams.append('archived', 'false');

        const result = await window.std(url);
        agencies.total = result.total;
        agencies.items = result.items;
    } catch (err) {
        console.error('Failed to fetch agencies:', err);
    }
    loading.value = false;
};

const editAgency = (agency) => {
    editingAgency.value = agency;
    agencyForm.name = agency.name;
    agencyForm.logo = agency.logo || '';
};

const closeModal = () => {
    showNewAgency.value = false;
    editingAgency.value = null;
    agencyForm.name = '';
    agencyForm.logo = '';
};

const saveAgency = async () => {
    if (!agencyForm.name.trim()) {
        alert('Agency name is required');
        return;
    }

    saving.value = true;
    try {
        if (editingAgency.value) {
            await window.std(`/api/agency/${editingAgency.value.id}`, {
                method: 'PATCH',
                body: {
                    name: agencyForm.name,
                    logo: agencyForm.logo
                }
            });
        } else {
            await window.std('/api/agency', {
                method: 'POST',
                body: {
                    name: agencyForm.name,
                    logo: agencyForm.logo
                }
            });
        }
        closeModal();
        await fetchAgencies();
    } catch (err) {
        console.error('Failed to save agency:', err);
        alert('Failed to save agency: ' + err.message);
    }
    saving.value = false;
};

const archiveAgency = async (agency) => {
    if (!confirm(`Are you sure you want to archive "${agency.name}"? This will hide it from active lists.`)) {
        return;
    }

    try {
        await window.std(`/api/agency/${agency.id}`, {
            method: 'DELETE'
        });
        await fetchAgencies();
    } catch (err) {
        console.error('Failed to archive agency:', err);
        alert('Failed to archive agency: ' + err.message);
    }
};

watch(filter, () => {
    page.value = 0;
    fetchAgencies();
});

watch(page, () => {
    fetchAgencies();
});

onMounted(() => {
    fetchAgencies();
});
</script>
