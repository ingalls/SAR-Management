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
                            <a @click='$router.push("/training/new")' class="cursor-pointer btn btn-primary">
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
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex">
                                <div class="input-icon w-50">
                                    <input v-model='query.filter' type="text" class="form-control" placeholder="Search…">
                                    <span class="input-icon-addon">
                                        <SearchIcon width='24'/>
                                    </span>
                                </div>

                                <div class='ms-auto'>
                                    <div class="btn-list">
                                        <button data-bs-toggle="dropdown" type="button" class="btn dropdown-toggle dropdown-toggle-split" aria-expanded="false"></button>
                                        <div class="dropdown-menu dropdown-menu-end" style="">
                                            <a @click='getExport' class="dropdown-item" href="#">Export CSV</a>
                                        </div>
                                    </div>
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
                                    <td><a @click='$router.push(`/training/${training.id}`)' class='cursor-pointer' v-text='training.title'></a></td>
                                    <td v-text='training.location'></td>
                                    <td><EpochRange :start='training.start_ts' :end='training.end_ts'/></td>
                                </tr>
                            </tbody>
                        </table>
                        <template v-if='!list.total'>
                            <None label='Trainings' :create='false'/>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <PageFooter/>
</div>
</template>

<script>
import None from './util/None.vue';
import EpochRange from './util/EpochRange.vue';
import PageFooter from './PageFooter.vue';
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
            query: {
                filter: ''
            },
            list: {
                total: 0,
                training: []
            }
        }
    },
    watch: {
        'query.filter': async function() {
            await this.listTrainings();
        }
    },
    mounted: async function() {
        await this.listTrainings();
    },
    methods: {
        listTrainings: async function() {
            const url = window.stdurl('/api/training');
            if (this.query.filter) url.searchParams.append('filter', this.query.filter);
            this.list = await window.std(url)
        }
    },
    components: {
        None,
        EpochRange,
        SearchIcon,
        PageFooter,
    }
}
</script>
