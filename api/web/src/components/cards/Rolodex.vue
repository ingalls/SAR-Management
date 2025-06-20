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
                    @click='$router.push("/rolodex")'
                    v-text='label'
                />
            </h3>

            <div class='btn-list ms-auto'>
                <IconPlus
                    v-if='create && is_iam("Rolodex:Manage")'
                    v-tooltip='"Create Rolodex"'
                    class='cursor-pointer'
                    size='32'
                    stroke='1'
                    @click='$router.push(`/rolodex/new`)'
                />
            </div>
        </div>

        <NoAccess v-if='!is_iam("Rolodex:View")' />
        <template v-else>
            <div class='px-2 py-2 row g-2'>
                <div class='col-12'>
                    <TablerInput
                        v-model='paging.filter'
                        placeholder='Filter Rolodex'
                        icon='search'
                    />
                </div>
            </div>

            <TablerLoading
                v-if='loading'
                desc='Loading Rolodex'
            />
            <TablerNone
                v-else-if='!list.items.length'
                :create='false'
                :label='Rolodex'
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
                        v-for='rolodex in list.items'
                        :key='rolodex.id'
                        class='cursor-pointer'
                        @click='$router.push(`/rolodex/${rolodex.id}`)'
                    >
                        <template v-for='h in header'>
                            <template v-if='h.display'>
                                <td v-if='["archived"].includes(h.name)'>
                                    <span
                                        v-if='rolodex.archived'
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
                                        v-if='rolodex[h.name]'
                                        :date='rolodex[h.name]'
                                    />
                                    <span v-else>Never</span>
                                </td>
                                <td v-else>
                                    <span v-text='rolodex[h.name]' />
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
    name: 'RolodexCard',
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
            default: 'Rolodex'
        },
        iam: {
            type: Object,
            required: true
        },
        order: {
            type: String,
            default: 'desc'
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
        if (this.is_iam("Rolodex:View")) {
            await this.fetch();
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        listSchema: async function() {
            const schema = await window.std('/api/schema?method=GET&url=/rolodex');
            this.header = ['archived', 'name', 'created'].map((h) => {
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
            const url = window.stdurl('/api/rolodex');
            url.searchParams.append('limit', this.paging.limit);
            url.searchParams.append('page', this.paging.page);
            url.searchParams.append('filter', this.paging.filter);
            url.searchParams.append('sort', this.paging.sort);
            url.searchParams.append('order', this.paging.order);
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
