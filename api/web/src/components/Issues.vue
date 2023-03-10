<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a @click='$router.push("/")' class='cursor-pointer'>Home</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="#">Issues</a></li>
                        </ol>

                        <div class='ms-auto'>
                            <a v-if='is_iam("Issue:Manage")' @click='$router.push("/issue/new")' class="cursor-pointer btn btn-primary">
                                New Issue
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
                        <NoAccess v-if='!is_iam("Issue:View")' title='Issues'/>
                        <template v-else>
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
                                            <TablerSelect
                                                default='Open'
                                                :values='["Open", "Closed"]'
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <table class="table card-table table-vcenter">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr :key='issue.id' v-for='issue in list.issues'>
                                        <td><a @click='$router.push(`/issue/${issue.id}`)' class='cursor-pointer' v-text='issue.title'></a></td>
                                        <td v-text='issue.status'></td>
                                    </tr>
                                </tbody>
                            </table>
                            <template v-if='!list.total'>
                                <None label='Issues' :create='false'/>
                            </template>
                        </template>
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
import None from './util/None.vue';
import { TablerSelect } from '@tak-ps/vue-tabler';
import {
    SearchIcon
} from 'vue-tabler-icons';

export default {
    name: 'Issues',
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
            list: {
                total: 0,
                issues: []
            },
            query: {
                filter: ''
            }
        }
    },
    watch: {
        'query.filter': async function() {
            await this.listIssues();
        }
    },
    mounted: async function() {
        if (this.is_iam("Issue:View")) await this.listIssues();
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        listIssues: async function() {
            const url = window.stdurl('/api/issue');
            if (this.query.filter) url.searchParams.append('filter', this.query.filter);
            this.list = await window.std(url)
        }
    },
    components: {
        None,
        NoAccess,
        TablerSelect,
        SearchIcon
    }
}
</script>
