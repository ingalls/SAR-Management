<template>
<div class="card">
    <div class="card-header">
        <GripVerticalIcon v-if='dragHandle' class='drag-handle cursor-move'/>
        <h3 class="card-title"><a @click='$router.push("/training")' class='cursor-pointer' v-text='label'></a></h3>

        <div class='btn-list ms-auto'>
            <PlusIcon v-if='create && is_iam("Application:Manage")' @click='$router.push(`/application/new`)' class='cursor-pointer'/>
            <SettingsIcon v-if='create && is_iam("Application:Manage")' @click='$router.push(`/application/edit`)' class='cursor-pointer'/>
        </div>
    </div>

    <NoAccess v-if='!is_iam("Application:View")' title='Applications'/>
    <template v-else-if='loading'>
        <TablerLoading desc='Loading Applications'/>
    </template>
    <template v-else-if='!list.applications.length'>
        <TablerNone :create='false' :label='Applications'/>
    </template>
    <template v-else>
        <table class="table card-table table-hover table-vcenter">
            <TableHeader
                v-model:sort='paging.sort'
                v-model:order='paging.order'
                v-model:header='header'
                :export='false'
            />
            <tbody>
                <tr @click='$router.push(`/application/${application.id}`)' :key='application.id' v-for='application in list.applications' class='cursor-pointer'>
                    <template v-for='h in header'>
                        <template v-if='h.display'>
                            <td v-if='["updated", "created"].includes(h.name)'>
                                <TablerEpoch v-if='application[h.name]' :date='application[h.name]'/>
                                <span v-else>Never</span>
                            </td>
                            <td v-else>
                                <span v-text='training[h.name]'></span>
                            </td>
                        </template>
                    </template>
                </tr>
            </tbody>
        </table>
        <TableFooter v-if='footer' :limit='paging.limit' :total='list.total' @page='paging.page = $event'/>
    </template>
</div>
</template>

<script>
import NoAccess from '../util/NoAccess.vue';
import iam from '../../iam.js';
import TableHeader from '../util/TableHeader.vue';
import TableFooter from '../util/TableFooter.vue';
import {
    TablerNone,
    TablerEpoch,
    TablerLoading
} from '@tak-ps/vue-tabler'

import {
    GripVerticalIcon,
    PlusIcon,
    SettingsIcon
} from 'vue-tabler-icons';


export default {
    name: 'ApplicationCard',
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
                end: this.end,
                page: 0

            },
            list: {
                total: 0,
                applications: []
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
        await this.fetch();
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        listSchema: async function() {
            const schema = await window.std('/api/schema?method=GET&url=/application');
            this.header = ['name', 'created', 'phone', 'email'].map((h) => {
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
            const url = window.stdurl('/api/application');
            url.searchParams.append('limit', this.paging.limit);
            url.searchParams.append('page', this.paging.page);
            url.searchParams.append('filter', this.paging.filter);
            url.searchParams.append('sort', this.paging.sort);
            url.searchParams.append('order', this.paging.order);

            if (this.paging.start) url.searchParams.append('start', this.paging.start);
            if (this.paging.end) url.searchParams.append('end', this.paging.end);
            this.list = await window.std(url);
            this.loading = false;
        }
    },
    components: {
        PlusIcon,
        SettingsIcon,
        TableHeader,
        TableFooter,
        TablerLoading,
        TablerEpoch,
        TablerNone,
        NoAccess,
        GripVerticalIcon,
    }
}
</script>
