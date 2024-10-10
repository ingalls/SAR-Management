<template>
    <div class='card'>
        <div class='card-header'>
            <IconGripVertical
                v-if='dragHandle'
                class='drag-handle cursor-move'
                :size='24'
                :stroke='1'
            />
            <h3 class='card-title'>
                <a
                    class='cursor-pointer'
                    @click='$router.push("/issue")'
                    v-text='label'
                />
            </h3>

            <div class='btn-list ms-auto'>
                <IconPlus
                    v-if='create && is_iam("Issue:Manage")'
                    v-tooltip='"New Issue"'
                    class='cursor-pointer'
                    :size='32'
                    :stroke='1'
                    @click='$router.push(`/issue/new`)'
                />
            </div>
        </div>

        <div
            v-if='search'
            class='px-2 pb-2'
        >
            <div class='row g-2'>
                <div class='col-8'>
                    <TablerInput
                        v-model='paging.filter'
                        label='Issue Search'
                    />
                </div>
                <div class='col-4'>
                    <TablerEnum
                        v-model='paging.status'
                        label='Issue Status'
                        :options='["open", "closed"]'
                    />
                </div>
            </div>
        </div>

        <NoAccess v-if='!is_iam("Issue:View")' />
        <template v-else-if='loading'>
            <TablerLoading desc='Loading Issues' />
        </template>
        <template v-else-if='!list.items.length'>
            <TablerNone
                :create='false'
                label='Issues'
            />
        </template>
        <template v-else>
            <div class='table-responsive'>
                <table class='table card-table table-hover table-vcenter datatable'>
                    <TableHeader
                        v-model:sort='paging.sort'
                        v-model:order='paging.order'
                        v-model:header='header'
                        :export='true'
                        @export='exportIssues("csv")'
                    />
                    <tbody>
                        <tr
                            v-for='(issue, issue_it) in list.items'
                            :key='issue.id'
                            class='cursor-pointer'
                            @click='$router.push(`/issue/${issue.id}`)'
                        >
                            <template v-for='h in header'>
                                <template v-if='h.display'>
                                    <td v-if='["updated", "created"].includes(h.name)'>
                                        <TablerEpoch
                                            v-if='issue[h.name]'
                                            :date='issue[h.name]'
                                        />
                                        <span v-else>Never</span>
                                    </td>
                                    <td v-if='["status"].includes(h.name)'>
                                        <span
                                            v-if='issue.status === "closed"'
                                            class='badge bg-red text-white'
                                            style='height: 20px;'
                                        >Closed</span>
                                        <span
                                            v-else-if='issue.status === "open"'
                                            class='badge bg-green text-white'
                                            style='height: 20px;'
                                        >Open</span>
                                    </td>
                                    <td v-else>
                                        <span v-text='issue[h.name]' />
                                    </td>
                                </template>
                            </template>
                        </tr>
                    </tbody>
                </table>
                <TableFooter
                    v-if='footer'
                    :limit='paging.limit'
                    :total='list.total'
                    @page='paging.page = $event'
                />
            </div>
        </template>
    </div>
</template>

<script>
import NoAccess from '../util/NoAccess.vue';
import iam from '../../iam.js';
import TableHeader from '../util/TableHeader.vue';
import TableFooter from '../util/TableFooter.vue';
import {
    TablerEnum,
    TablerNone,
    TablerEpoch,
    TablerInput,
    TablerLoading
} from '@tak-ps/vue-tabler'
import {
    IconGripVertical,
    IconPlus
} from '@tabler/icons-vue';

export default {
    name: 'IssueCard',
    components: {
        IconPlus,
        IconGripVertical,
        TablerEnum,
        TablerNone,
        TablerEpoch,
        TablerInput,
        TablerLoading,
        NoAccess,
        TableHeader,
        TableFooter,
    },
    props: {
        label: {
            type: String,
            default: 'Recent Issues'
        },
        search: {
            type: Boolean,
            default: false
        },
        dragHandle: {
            type: Boolean,
            default: false,
        },
        create: {
            type: Boolean,
            default: true,
        },
        limit: {
            type: Number,
            default: 10,
        },
        footer: {
            type: Boolean,
            default: true,
        },
        iam: {
            type: Object,
            required: true
        },
        auth: {
            type: Object,
            required: true
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
                sort: 'id',
                order: 'desc',
                limit: this.limit,
                status: 'open',
                page: 0
            },
            list: {
                total: 0,
                items: []
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
        if (this.is_iam("Issue:View")) {
            await this.fetch();
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        listSchema: async function() {
            const schema = await window.std('/api/schema?method=GET&url=/issue');
            this.header = ['title', 'status'].map((h) => {
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
            url.searchParams.append('limit', this.paging.limit);
            url.searchParams.append('page', this.paging.page);
            url.searchParams.append('order', this.paging.order);
            url.searchParams.append('sort', this.paging.sort);
            url.searchParams.append('filter', this.paging.filter);
            url.searchParams.append('status', this.paging.status);
            if (this.assigned) url.searchParams.append('assigned', this.assigned);
            this.list = await window.std(url);
            this.loading = false;
        },
        exportIssues: async function(format) {
            const url = window.stdurl('/api/issue');
            url.searchParams.append('filter', this.paging.filter);
            url.searchParams.append('format', format);
            url.searchParams.append('status', this.paging.status);
            url.searchParams.append('order', this.paging.order);
            url.searchParams.append('sort', this.paging.sort);

            if (format === 'csv') {
                const fields = [];
                this.header.filter((h) => {
                    return h.display;
                }).forEach((h) => {
                    if (h.name === 'name') {
                        fields.push('fname', 'lname');
                    } else {
                        fields.push(h.name);
                    }
                });

                for (const field of fields) {
                    url.searchParams.append('fields', field)
                }
            }

            const res = await window.std(url);
            const blob = await res.blob()

            const durl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = durl;
            a.download = `sar-issues.${format}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        },
    }
}
</script>
