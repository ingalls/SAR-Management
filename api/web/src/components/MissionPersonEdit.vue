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

<script>
import { TablerBreadCrumb } from '@tak-ps/vue-tabler';
import iam from '../iam.js';

export default {
    name: 'MissionPersonEdit',
    components: {
        TablerBreadCrumb
    },
    props: {
        iam: { type: Object, required: true },
        auth: { type: Object, required: true }
    },
    data() {
        return {
            loading: true,
            person: {
                name: '',
                role: 'Subject',
                address: '',
                phone: '',
                email: '',
                notes: ''
            }
        };
    },
    computed: {
        isNew() {
            return !this.$route.params.personid;
        }
    },
    mounted() {
        if (!this.isNew) {
            this.fetch();
        } else {
            this.loading = false;
        }
    },
    methods: {
        is_iam(permission) { return iam(this.iam, this.auth, permission); },
        async fetch() {
            this.loading = true;
            this.person = await window.std(`/api/mission/${this.$route.params.missionid}/person/${this.$route.params.personid}`);
            this.loading = false;
        },
        async save() {
            this.loading = true;
            let url = `/api/mission/${this.$route.params.missionid}/person`;
            let method = 'POST';

            if (!this.isNew) {
                url += `/${this.$route.params.personid}`;
                method = 'PATCH';
            }

            try {
                const res = await window.std(url, {
                    method: method,
                    body: this.person
                });
                this.$router.push(`/mission/${this.$route.params.missionid}/person/${res.id}`);
            } catch (err) {
                console.error(err);
                // Handle error (alert or toast)
            } finally {
                this.loading = false;
            }
        }
    }
}
</script>
