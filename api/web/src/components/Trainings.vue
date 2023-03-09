<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a @click='$router.push("/")' class='cursor-pointer'>Home</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="#">Trainings</a></li>
                        </ol>

                        <div class='ms-auto'>
                            <a v-if='is_iam("Training:Manage")' @click='$router.push("/training/new")' class="cursor-pointer btn btn-primary">
                                New Training
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div class="col-lg-12">
                    <NoAccess v-if='!is_iam("Training:View")' title='Trainings'/>
                    <TablerLoading v-else-if='loading.list'/>
                    <div v-else class="card">
                        <div class="card-body">
                            <div class="d-flex">
                                <div class="input-icon w-50">
                                    <input v-model='paging.filter' type="text" class="form-control" placeholder="Search…">
                                    <span class="input-icon-addon">
                                        <SearchIcon width='24'/>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <table class="table card-table table-vcenter">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Location</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr :key='training.id' v-for='training in list.training'>
                                    <td>
                                        <div class='d-flex'>
                                            <a @click='$router.push(`/training/${training.id}`)' class='cursor-pointer' v-text='training.title'></a>
                                            <div class='ms-auto'>
                                                <span v-if='training.required' class="mx-2 badge bg-red">Required</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td v-text='training.location'></td>
                                    <td><EpochRange :start='training.start_ts' :end='training.end_ts'/></td>
                                </tr>
                            </tbody>
                        </table>
                        <template v-if='!list.total'>
                            <None label='Trainings' :create='false'/>
                        </template>
                        <TableFooter :limit='paging.limit' :total='list.total' @page='paging.page = $event'/>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <PageFooter/>
</div>
</template>

<script>
import iam from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import None from './util/None.vue';
import EpochRange from './util/EpochRange.vue';
import PageFooter from './PageFooter.vue';
import TableFooter from './util/TableFooter.vue';
import {
    TablerLoading
} from '@tak-ps/vue-tabler'
import {
    SearchIcon
} from 'vue-tabler-icons';

export default {
    name: 'Trainings',
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
            paging: {
                filter: '',
                limit: 100,
                page: 0
            },
            loading: {
                list: true
            },
            list: {
                total: 0,
                training: []
            }
        }
    },
    watch: {
       'paging.page': async function() {
           await this.listTrainings();
       },
       'paging.filter': async function() {
           await this.listTrainings();
       },
    },
    mounted: async function() {
        if (this.is_iam("Training:View")) await this.listTrainings();
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        listTrainings: async function() {
            this.loading.list = true;
            const url = window.stdurl('/api/training');
            url.searchParams.append('limit', this.paging.limit);
            url.searchParams.append('page', this.paging.page);
            url.searchParams.append('filter', this.paging.filter);
            url.searchParams.append('order', 'desc');
            this.list = await window.std(url)
            this.loading.list = false;
        }
    },
    components: {
        None,
        TableFooter,
        EpochRange,
        SearchIcon,
        PageFooter,
        NoAccess,
        TablerLoading
    }
}
</script>
