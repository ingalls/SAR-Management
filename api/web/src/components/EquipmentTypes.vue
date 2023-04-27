<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <TablerBreadCrumb/>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div class="col-lg-12">
                    <NoAccess v-if='!is_iam("Equipment:View")' title='Equipment Types'/>
                    <div v-else class="card">
                        <div class="card-body">
                            <div class="d-flex">
                                <div class="input-icon w-50">
                                    <input v-model='query.filter' type="text" class="form-control" placeholder="Search…">
                                    <span class="input-icon-addon">
                                        <SearchIcon width='24'/>
                                    </span>
                                </div>
                                <div v-if='is_iam("Equipment:Admin")' class='ms-auto'>
                                    <PlusIcon @click='$router.push("/equipment/type/new")' class='cursor-pointer'/>
                                </div>
                            </div>
                        </div>
                        <table class="table card-table table-vcenter">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Created</th>
                                    <th>Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr :key='type.id' v-for='type in list.types'>
                                    <td>
                                        <a @click='$router.push(`/equipment/type/${type.id}`)' class='cursor-pointer' v-text='type.type'></a>
                                    </td>
                                    <td><Epoch :date='type.created'/></td>
                                    <td><Epoch :date='type.updated'/></td>
                                </tr>
                            </tbody>
                        </table>
                        <template v-if='!list.total'>
                            <None label='Equipment Types' :create='false'/>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import NoAccess from './util/NoAccess.vue';
import Epoch from './util/Epoch.vue';
import {
    TablerBreadCrumb 
} from '@tak-ps/vue-tabler';
import iam from '../iam.js';
import None from './util/None.vue';
import {
    PlusIcon,
    SearchIcon
} from 'vue-tabler-icons'

export default {
    name: 'EquipmentTypes',
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
            query: {
                filter: ''
            },
            list: {
                total: 0,
                types: []
            }
        }
    },
    mounted: async function() {
        if (this.is_iam("Equipment:View")) await this.listTypes();
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        listTypes: async function() {
            const url = window.stdurl('/api/equipment-type');
            if (this.query.filter) url.searchParams.append('filter', this.query.filter);
            this.list = await window.std(url)
        }
    },
    components: {
        None,
        Epoch,
        BreadCrumb,
        PlusIcon,
        NoAccess,
        SearchIcon
    }
}
</script>
