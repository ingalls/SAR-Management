<template>
<div class="card">
    <div class="card-header">
        <h3 class="card-title"><a @click='$router.push("/training")' class='cursor-pointer' v-text='label'></a></h3>

        <div class='btn-list ms-auto'>
            <PlusIcon v-if='create && is_iam("Training:Manage")' @click='$router.push(`/training/new`)' class='cursor-pointer'/>
        </div>
    </div>

    <NoAccess v-if='!is_iam("Training:View")' title='Trainings'/>
    <template v-else-if='loading'>
        <TablerLoading desc='Loading Trainings'/>
    </template>
    <template v-else-if='!list.training.length'>
        <TablerNone :create='false' :label='Trainings'/>
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
                <tr @click='$router.push(`/training/${training.id}`)' :key='training.id' v-for='training in list.training' class='cursor-pointer'>
                    <template v-for='h in header'>
                        <template v-if='h.display'>
                            <td v-if='["updated", "created"].includes(h.name)'>
                                <TablerEpoch v-if='training[h.name]' :date='training[h.name]'/>
                                <span v-else>Never</span>
                            </td>
                            <td v-else-if='h.name === "range"'>
                                <TablerEpochRange :start='training.start_ts' :end='training.end_ts'/>
                            </td>
                            <td v-else-if='h.name === "title"'>
                                <div class='d-flex'>
                                    <span v-text='training.title'/>
                                    <div class='ms-auto btn-list h-25'>
                                        <template v-for='team in training.teams'>
                                            <TeamBadge :team='team' class='ms-auto'/>
                                        </template>
                                        <span v-if='training.required' class="ms-auto badge bg-red text-white" style="height: 20px;">Required</span>
                                    </div>
                                </div>
                            </td>
                            <td v-else>
                                <span v-text='training[h.name]'></span>
                            </td>
                        </template>
                    </template>
                </tr>
            </tbody>
        </table>
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
    PlusIcon
} from 'vue-tabler-icons';


export default {
    name: 'TrainingCard',
    props: {
        label: {
            type: String,
            default: 'Upcoming Training'
        },
        iam: {
            type: Object,
            required: true
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
                sort: 'id',
                order: 'desc',
                limit: 10,
                page: 0

            },
            list: {
                total: 0,
                training: []
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
            const schema = await window.std('/api/schema?method=GET&url=/training');
            this.header = ['title', 'range'].map((h) => {
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
            const url = window.stdurl('/api/training');
            url.searchParams.append('limit', this.paging.limit);
            url.searchParams.append('page', this.paging.page);
            url.searchParams.append('filter', this.paging.filter);
            url.searchParams.append('sort', this.paging.sort);
            url.searchParams.append('order', this.paging.order);
            if (this.assigned) url.searchParams.append('assigned', this.assigned);
            this.list = await window.std(url);
            this.loading = false;
        }
    },
    components: {
        PlusIcon,
        TableHeader,
        TableFooter,
        TablerLoading,
        TablerEpoch,
        TablerEpochRange,
        TeamBadge,
        TablerNone,
        NoAccess,
    }
}
</script>
