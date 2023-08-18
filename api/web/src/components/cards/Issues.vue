<template>
<div class="card">
    <div class="card-header row">
        <div class="d-flex">
            <h3 class="card-title"><a @click='$router.push("/issue")' class='cursor-pointer' v-text='label'></a></h3>

            <div class='btn-list ms-auto'>
                <PlusIcon v-if='!is_iam("Issue:Manage")' @click='$router.push(`/issue/${$route.params.issueid}/edit`)'/>
            </div>
        </div>
    </div>

    <NoAccess v-if='!is_iam("Issue:View")' title='Issues'/>
    <template v-else-if='loading'>
        <TablerLoading desc='Loading Issues'/>
    </template>
    <template v-else-if='!list.issues.length'>
        <None :create='false' label='Assigned Issues'/>
    </template>
    <template v-else>
        <div class='table-responsive'>
            <table class="table card-table table-hover table-vcenter datatable">
                <TableHeader
                    v-model:sort='paging.sort'
                    v-model:order='paging.order'
                    v-model:header='header'
                    :export='true'
                    @export='exportUsers("csv")'
                />
                <tbody>
                    <tr @click='$router.push(`/issue/${issue.id}`)' :key='issue.id' v-for='(issue, issue_it) in list.issues' class='cursor-pointer'>
                        <template v-for='h in header'>
                            <template v-if='h.display'>
                                <td v-if='["updated", "created"].includes(h.name)'>
                                    <Epoch v-if='issue[h.name]' :date='issue[h.name]'/>
                                    <span v-else>Never</span>
                                </td>
                                <td v-else>
                                    <span v-text='issue[h.name]'></span>
                                </td>
                            </template>
                        </template>
                    </tr>
                </tbody>
            </table>
        </div>
    </template>
    <TableFooter :limit='paging.limit' :total='list.total' @page='paging.page = $event'/>
</div>
</template>

<script>
import Epoch from '../util/Epoch.vue';
import NoAccess from '../util/NoAccess.vue';
import iam from '../../iam.js';
import TableHeader from '../util/TableHeader.vue';
import TableFooter from '../util/TableFooter.vue';
import None from '../util/None.vue';
import {
    TablerLoading
} from '@tak-ps/vue-tabler'
import {
    PlusIcon
} from 'vue-tabler-icons';

export default {
    name: 'IssueCard',
    props: {
        label: {
            type: String,
            default: 'Recent Issues'
        },
        iam: {
            type: Object,
            required: true
        },
        auth: {
            type: Object,
            required: true
        },
        limit: {
            type: Number,
            default: 10
        },
        assigned: {
            type: Number,
            default: null
        }
    },
    data: function() {
        return {
            loading: true,
            header: [],
            paging: {
                filter: '',
                sort: 'Name',
                order: 'asc',
                limit: 10,
                page: 0
            },
            list: {
                total: 0,
                issues: []
            }
        }
    },
    watch: {
        paging: {
            deep: true,
            handler: async function() {
                await this.fetch();
            }
        }
    },
    mounted: async function() {
        await this.listSchema();
        await this.fetch();
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        listSchema: async function() {
            const schema = await window.std('/api/schema?method=GET&url=/issue');
            this.header = ['title'].map((h) => {
                return { name: h, display: true };
            });

            this.header.push(...schema.query.properties.sort.enum.map((h) => {
                return {
                    name: h,
                    display: false
                }
            }).filter((h) => {
                for (const hknown of this.header) {
                    if (hknown.name === h.name) return false;
                }
                return true;
            }));
        },
        fetch: async function() {
            this.loading = true;
            const url = window.stdurl('/api/issue');
            url.searchParams.append('limit', this.limit);
            if (this.assigned) url.searchParams.append('assigned', this.assigned);
            this.list = await window.std(url);
            this.loading = false;
        }
    },
    components: {
        None,
        Epoch,
        PlusIcon,
        NoAccess,
        TableHeader,
        TableFooter,
        TablerLoading,
    }
}
</script>
