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
                        <NoAccess
                            v-if='!is_iam("Team:Manage")'
                            title='New Team'
                        />
                        <div
                            v-else
                            class='card'
                        >
                            <div class='card-body'>
                                <div class='row row-cards'>
                                    <div class='col-md-12'>
                                        <label class='form-label'>Team Name</label>
                                        <input
                                            v-model='team.name'
                                            type='text'
                                            :class='{
                                                "is-invalid": errors.name
                                            }'
                                            class='form-control'
                                            placeholder='Team Name'
                                        >
                                        <div
                                            v-if='errors.name'
                                            class='invalid-feedback'
                                            v-text='errors.name'
                                        />
                                    </div>
                                    <div class='col-md-12'>
                                        <TablerToggle
                                            v-model='team.fieldable'
                                            label='Fieldable Team'
                                        />
                                    </div>
                                    <div class='col-md-12'>
                                        <label class='form-label'>Charter</label>
                                        <textarea
                                            v-model='team.body'
                                            rows='5'
                                            type='text'
                                            :class='{
                                                "is-invalid": errors.body
                                            }'
                                            class='form-control'
                                            placeholder='Team Charter'
                                        />
                                        <div
                                            v-if='errors.body'
                                            class='invalid-feedback'
                                            v-text='errors.body'
                                        />
                                    </div>
                                    <div class='col-md-12'>
                                        <div class='d-flex'>
                                            <div class='ms-auto'>
                                                <a
                                                    class='cursor-pointer btn btn-primary'
                                                    @click='create'
                                                >Create Team</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import iam from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import {
    TablerBreadCrumb,
    TablerToggle,
} from '@tak-ps/vue-tabler';

export default {
    name: 'TeamNew',
    components: {
        NoAccess,
        TablerToggle,
        TablerBreadCrumb
    },
    props: {
        iam: {
            type: Object,
            required: true
        },
        auth: {
            type: Object,
            required: true
        }
    },
    data: function() {
        return {
            errors: {
                name: false,
                body: false
            },
            team: {
                name: '',
                fieldable: true,
                body: ''
            }
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        create: async function() {
            for (const field of ['name', 'body']) {
                if (!this.team[field]) this.errors[field] = 'Cannot be empty';
                else this.errors[field] = false;
            }

            for (const e in this.errors) {
                if (this.errors[e]) return;
            }

            const create = await window.std('/api/team', {
                method: 'POST',
                body: this.team
            });

            this.$router.push(`/team/${create.id}`);
        }
    }
}
</script>
