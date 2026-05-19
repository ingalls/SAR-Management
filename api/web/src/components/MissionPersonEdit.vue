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
                            <div class='card-header'>
                                <h3 class='card-title'>
                                    {{ isNew ? 'Create Person' : 'Edit Person' }}
                                </h3>
                            </div>
                            <div class='card-body'>
                                <div class='row row-cards'>
                                    <div class='col-md-6'>
                                        <div class='mb-3'>
                                            <label class='form-label'>Name</label>
                                            <input
                                                v-model='person.name'
                                                type='text'
                                                class='form-control'
                                                placeholder='Full Name'
                                            >
                                        </div>
                                    </div>
                                    <div class='col-md-6'>
                                        <div class='mb-3'>
                                            <label class='form-label'>Role</label>
                                            <select
                                                v-model='person.role'
                                                class='form-select'
                                            >
                                                <option value='Subject'>
                                                    Subject
                                                </option>
                                                <option value='Reporting Party'>
                                                    Reporting Party
                                                </option>
                                                <option value='Witness'>
                                                    Witness
                                                </option>
                                                <option value='Other'>
                                                    Other
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class='col-md-6'>
                                        <div class='mb-3'>
                                            <label class='form-label'>Phone</label>
                                            <input
                                                v-model='person.phone'
                                                type='text'
                                                class='form-control'
                                                placeholder='Phone Number'
                                            >
                                        </div>
                                    </div>
                                    <div class='col-md-6'>
                                        <div class='mb-3'>
                                            <label class='form-label'>Email</label>
                                            <input
                                                v-model='person.email'
                                                type='text'
                                                class='form-control'
                                                placeholder='Email Address'
                                            >
                                        </div>
                                    </div>
                                    <div class='col-md-12'>
                                        <div class='mb-3'>
                                            <label class='form-label'>Address</label>
                                            <input
                                                v-model='person.address'
                                                type='text'
                                                class='form-control'
                                                placeholder='Full Address'
                                            >
                                        </div>
                                    </div>
                                    <div class='col-md-12'>
                                        <div class='mb-3'>
                                            <label class='form-label'>Notes</label>
                                            <textarea
                                                v-model='person.notes'
                                                class='form-control'
                                                rows='5'
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class='card-footer text-end'>
                                <button
                                    class='btn btn-primary'
                                    @click='save'
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { TablerBreadCrumb } from '@tak-ps/vue-tabler';
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

defineProps({
    iam: { type: Object, required: true },
    auth: { type: Object, required: true }
});

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const person = ref({
    name: '',
    role: 'Subject',
    address: '',
    phone: '',
    email: '',
    notes: ''
});

const isNew = computed(() => !route.params.personid);

async function fetch() {
    loading.value = true;
    person.value = await window.std(`/api/mission/${route.params.missionid}/person/${route.params.personid}`);
    loading.value = false;
}

async function save() {
    loading.value = true;
    let url = `/api/mission/${route.params.missionid}/person`;
    let method = 'POST';

    if (!isNew.value) {
        url += `/${route.params.personid}`;
        method = 'PATCH';
    }

    try {
        const res = await window.std(url, {
            method: method,
            body: person.value
        });
        router.push(`/mission/${route.params.missionid}/person/${res.id}`);
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    if (!isNew.value) {
        fetch();
    } else {
        loading.value = false;
    }
});
</script>
