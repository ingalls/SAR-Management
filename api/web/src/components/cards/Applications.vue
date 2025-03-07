<template>
    <div class='card'>
        <div class='card-header'>
            <IconGripVertical
                v-if='dragHandle'
                class='drag-handle cursor-move'
                size='32'
            />
            <h3 class='card-title'>
                <a
                    class='cursor-pointer'
                    @click='$router.push("/application")'
                    v-text='label'
                />
            </h3>

            <div class='btn-list ms-auto'>
                <IconPlus
                    v-if='create && is_iam("Application:Manage")'
                    v-tooltip='"Create Application"'
                    class='cursor-pointer'
                    size='32'
                    stroke='1'
                    @click='$router.push(`/application/new`)'
                />
                <IconSettings
                    v-if='create && is_iam("Application:Manage")'
                    v-tooltip='"Edit Application Form"'
                    class='cursor-pointer'
                    size='32'
                    stroke='1'
                    @click='$router.push(`/application/edit`)'
                />
            </div>
        </div>

        <NoAccess v-if='!is_iam("Application:View")' />
        <template v-else>
            <div class='px-2 py-2 row g-2'>
                <div class='col-12 col-md-8'>
                    <TablerInput
                        v-model='paging.filter'
                        placeholder='Filter Applications'
                        icon='search'
                    />
                </div>
                <div class='col-12 col-md-4'>
                    <TablerEnum
                        v-model='paging.status'
                        :options='["all", "archived", "active"]'
                    />
                </div>
            </div>

            <TablerLoading
                v-if='loading'
                desc='Loading Applications'
            />
            <TablerNone
                v-else-if='!list.items.length'
                :create='false'
                :label='Applications'
            />
            <table
                v-else
                class='table card-table table-hover table-vcenter'
            >
                <TableHeader
                    v-model:sort='paging.sort'
                    v-model:order='paging.order'
                    v-model:header='header'
                    :export='false'
                />
                <tbody>
                    <tr
                        v-for='application in list.items'
                        :key='application.id'
                        class='cursor-pointer'
                        @click='$router.push(`/application/${application.id}`)'
                    >
                        <template v-for='h in header'>
                            <template v-if='h.display'>
                                <td v-if='["archived"].includes(h.name)'>
                                    <span
                                        v-if='application.archived'
                                        class='badge bg-red text-white'
                                        style='height: 20px;'
                                    >Archived</span>
                                    <span
                                        v-else
                                        class='badge bg-green text-white'
                                        style='height: 20px;'
                                    >Active</span>
                                </td>
                                <td v-else-if='["updated", "created"].includes(h.name)'>
                                    <TablerEpoch
                                        v-if='application[h.name]'
                                        :date='application[h.name]'
                                    />
                                    <span v-else>Never</span>
                                </td>
                                <td v-else>
                                    <span v-text='application[h.name]' />
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
        </template>
    </div>
</template>

<script>
import phoneFormat from 'phone';
import NoAccess from '../util/NoAccess.vue';
import iam from '../../iam.js';
import TableHeader from '../util/TableHeader.vue';
import TableFooter from '../util/TableFooter.vue';
import {
    TablerNone,
    TablerEnum,
    TablerInput,
    TablerEpoch,
    TablerLoading
} from '@tak-ps/vue-tabler'

import {
    IconGripVertical,
    IconPlus,
    IconSettings
} from '@tabler/icons-vue';


export default {
    name: 'ApplicationCard',
    components: {
        IconPlus,
        IconSettings,
        IconGripVertical,
        TableHeader,
        TableFooter,
        TablerEnum,
        TablerInput,
        TablerLoading,
        TablerEpoch,
        TablerNone,
        NoAccess,
    },
    props: {
        label: {
            type: String,
            default: 'Team Applications'
        },
        iam: {
            type: Object,
            required: true
        },
        start: {
            type: Number
        },
        order: {
            type: String,
            default: 'desc'
        },
        end: {
            type: Number
        },
        dragHandle: {
            type: Boolean,
            default: false
        },
        limit: {
            type: Number,
            default: 10
        },
        footer: {
            type: Boolean,
            default: true
        },
        auth: {
            type: Object,
            required: true
        },
        create: {
            type: Boolean,
            default: true
        },
        limit: {
            type: Number,
            default: 10
        },
        assigned: {
            type: Number
        }
    },
    data: function() {
        return {
            loading: true,
            header: [],
            paging: {
                filter: '',
                sort: 'created',
                order: this.order,
                limit: this.limit,
                start: this.start,
                status: 'all',
                end: this.end,
                page: 0

            },
            list: {
                total: 0,
                items: []
            },
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
        if (this.is_iam("Application:View")) {
            await this.fetch();
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        listSchema: async function() {
            const schema = await window.std('/api/schema?method=GET&url=/application');
            this.header = ['archived', 'name', 'created', 'phone', 'email', 'group'].map((h) => {
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
        format: function(number) {
            const p = phoneFormat(number);

            if (!p.isValid) return number;

            if (p.countryCode === '+1') {
                return `${p.phoneNumber.slice(0, 2)} (${p.phoneNumber.slice(2, 5)}) ${p.phoneNumber.slice(5, 8)}-${p.phoneNumber.slice(8, 12)}`;
            } else {
                return p;
            }
        },
        fetch: async function() {
            this.loading = true;
            const url = window.stdurl('/api/application');
            url.searchParams.append('limit', this.paging.limit);
            url.searchParams.append('page', this.paging.page);
            url.searchParams.append('filter', this.paging.filter);
            url.searchParams.append('sort', this.paging.sort);
            url.searchParams.append('order', this.paging.order);
            if (this.paging.status !== 'all') {
                url.searchParams.append('status', this.paging.status);
            }

            if (this.paging.start) url.searchParams.append('start', this.paging.start);
            if (this.paging.end) url.searchParams.append('end', this.paging.end);
            const list = await window.std(url);

            list.items.map((i) => {
                i.phone = this.format(i.phone);
            })

            this.list = list;

            this.loading = false;
        }
    }
}
</script>
