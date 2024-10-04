<template>
<div class="card">
    <div class="card-header">
        <IconGripVertical v-if='dragHandle' class='drag-handle cursor-move' size='24' stroke='1'/>
        <h3 class="card-title"><a @click='goto' class='cursor-pointer' v-text='label'></a></h3>

        <div class='btn-list ms-auto'>
            <IconPlus v-if='create && is_iam("Mission:Manage")' @click='$router.push(`/mission/new`)' class='cursor-pointer' size='32' stroke='1'/>
            <IconRefresh v-if='is_iam("Mission:View")' @click='fetch' class='cursor-pointer' :size='32' :stroke='1'/>
        </div>
    </div>

    <NoAccess v-if='!is_iam("Mission:View")' title='Missions'/>
    <TablerLoading v-else-if='loading' desc='Loading Missions'/>
    <TablerNone v-else-if='!list.items.length' :create='false' :label='Missions'/>
    <template v-else>
        <table class="table card-table table-hover table-vcenter">
            <TableHeader
                v-model:sort='paging.sort'
                v-model:order='paging.order'
                v-model:header='header'
                :export='false'
            />
            <tbody>
                <tr @click='$router.push(`/mission/${mission.id}`)' :key='mission.id' v-for='mission in list.items' class='cursor-pointer'>
                    <template v-for='h in header'>
                        <template v-if='h.display'>
                            <td v-if='["updated", "created"].includes(h.name)'>
                                <TablerEpoch v-if='mission[h.name]' :date='mission[h.name]'/>
                                <span v-else>Never</span>
                            </td>
                            <td v-else-if='h.name === "dates"'>
                                <TablerEpochRange :start='mission.start_ts' :end='mission.end_ts'/>
                            </td>
                            <td v-else-if='h.name === "title"'>
                                <div class='d-flex align-items-center'>
                                    <span class='me-3'>
                                        <IconUserCheck
                                            v-if='mission.users.includes(auth.id)'
                                            v-tooltip='"Attended"'
                                            size='32'
                                            stroke='1'
                                            color='green'
                                        />
                                        <IconUserOff
                                            v-else
                                            v-tooltip='"Did not attend"'
                                            size='32'
                                            stroke='1'
                                        />
                                    </span>
                                    <span v-text='mission.title'/>
                                    <div class='ms-auto btn-list h-25'>
                                        <template v-for='team in mission.teams'>
                                            <TeamBadge :team='team' class='ms-auto'/>
                                        </template>
                                        <span v-if='mission.required' class="ms-auto badge bg-red text-white" style="height: 20px;">Required</span>
                                    </div>
                                </div>
                            </td>
                            <td v-else>
                                <span v-text='mission[h.name]'></span>
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
import TeamBadge from '../util/TeamBadge.vue'
import NoAccess from '../util/NoAccess.vue';
import iam from '../../iam.js';
import TableHeader from '../util/TableHeader.vue';
import TableFooter from '../util/TableFooter.vue';
import {
    TablerNone,
    TablerEpoch,
    TablerEpochRange,
    TablerLoading
} from '@tak-ps/vue-tabler'

import {
    IconGripVertical,
    IconPlus,
    IconRefresh,
    IconUserCheck,
    IconUserOff
} from '@tabler/icons-vue';

export default {
    name: 'MissionCard',
    props: {
        label: {
            type: String,
            default: 'Recent Missions'
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
                sort: 'start_ts',
                order: this.order,
                limit: this.limit,
                start: this.start,
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
        await this.fetch();
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        goto: function() {
            if (this.assigned) this.$router.push(`/mission?assigned=${this.assigned}`);
            else this.$router.push('/mission');
        },
        listSchema: async function() {
            const schema = await window.std('/api/schema?method=GET&url=/mission');
            this.header = ['title', 'dates'].map((h) => {
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
            const url = window.stdurl('/api/mission');
            url.searchParams.append('limit', this.paging.limit);
            url.searchParams.append('page', this.paging.page);
            url.searchParams.append('filter', this.paging.filter);
            url.searchParams.append('sort', this.paging.sort);
            url.searchParams.append('order', this.paging.order);

            if (this.paging.start) url.searchParams.append('start', this.paging.start);
            if (this.paging.end) url.searchParams.append('end', this.paging.end);
            if (this.assigned) url.searchParams.append('assigned', this.assigned);
            this.list = await window.std(url);
            this.loading = false;
        }
    },
    components: {
        TableHeader,
        TableFooter,
        TablerLoading,
        TablerEpoch,
        TablerEpochRange,
        TeamBadge,
        TablerNone,
        NoAccess,
        IconGripVertical,
        IconRefresh,
        IconPlus,
        IconUserCheck,
        IconUserOff
    }
}
</script>
