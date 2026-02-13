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
                                    {{ person.name || 'Unnamed Person' }}
                                </h3>
                                <div class='ms-auto btn-list'>
                                    <TablerIconButton
                                        v-if='is_iam("Mission:Manage")'
                                        title='Edit Person'
                                        @click='$router.push(`/mission/${$route.params.missionid}/person/${$route.params.personid}/edit`)'
                                    >
                                        <IconPencil
                                            size='24'
                                            stroke='1'
                                        />
                                    </TablerIconButton>
                                    <TablerIconButton
                                        v-if='is_iam("Mission:Manage")'
                                        title='Delete Person'
                                        @click='deletePerson'
                                    >
                                        <IconTrash
                                            size='24'
                                            stroke='1'
                                        />
                                    </TablerIconButton>
                                </div>
                            </div>
                            <div class='card-body'>
                                <div class='datagrid'>
                                    <div class='datagrid-item'>
                                        <div class='datagrid-title'>
                                            Role
                                        </div>
                                        <div class='datagrid-content'>
                                            {{ person.role || 'N/A' }}
                                        </div>
                                    </div>
                                    <div class='datagrid-item'>
                                        <div class='datagrid-title'>
                                            Address
                                        </div>
                                        <div class='datagrid-content'>
                                            {{ person.address || 'N/A' }}
                                        </div>
                                    </div>
                                    <div class='datagrid-item'>
                                        <div class='datagrid-title'>
                                            Phone
                                        </div>
                                        <div class='datagrid-content'>
                                            {{ person.phone || 'N/A' }}
                                        </div>
                                    </div>
                                    <div class='datagrid-item'>
                                        <div class='datagrid-title'>
                                            Email
                                        </div>
                                        <div class='datagrid-content'>
                                            {{ person.email || 'N/A' }}
                                        </div>
                                    </div>
                                    <div class='datagrid-item col-12'>
                                        <div class='datagrid-title'>
                                            Notes
                                        </div>
                                        <div class='datagrid-content'>
                                            {{ person.notes || 'N/A' }}
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
import { TablerBreadCrumb, TablerIconButton } from '@tak-ps/vue-tabler';
import { IconPencil, IconTrash } from '@tabler/icons-vue';
import iam from '../iam.js';

export default {
    name: 'MissionPerson',
    components: {
        TablerBreadCrumb,
        TablerIconButton,
        IconPencil,
        IconTrash
    },
    props: {
        iam: { type: Object, required: true },
        auth: { type: Object, required: true }
    },
    data() {
        return {
            loading: true,
            person: {}
        };
    },
    mounted() {
        this.fetch();
    },
    methods: {
        is_iam(permission) { return iam(this.iam, this.auth, permission); },
        async fetch() {
            this.loading = true;
            this.person = await window.std(`/api/mission/${this.$route.params.missionid}/person/${this.$route.params.personid}`);
            this.loading = false;
        },
        async deletePerson() {
            if (!confirm('Are you sure you want to delete this person?')) return;
            await window.std(`/api/mission/${this.$route.params.missionid}/person/${this.$route.params.personid}`, {
                method: 'DELETE'
            });
            this.$router.push(`/mission/${this.$route.params.missionid}`);
        }
    }
}
</script>
