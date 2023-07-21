<template>
<div class="card">
    <div class="card-header row">
        <div class="d-flex">
            <h3 class="card-title"><a @click='$router.push("/training")' class='cursor-pointer' v-text='label'></a></h3>
        </div>
    </div>
    <template v-if='loading'>
        <TablerLoading desc='Loading Trainings'/>
    </template>
    <template v-else-if='!list.training.length'>
        <None :create='false' :label='training'/>
    </template>
    <template v-else>
        <table class="table card-table table-hover table-vcenter">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                <tr :key='training.id' v-for='training in list.training'>
                    <td>
                        <div class='d-flex'>
                            <a @click='$router.push(`/training/${training.id}`)' class='cursor-pointer' v-text='training.title'></a>
                            <div class='ms-auto btn-list h-25'>
                                <template v-for='team in training.teams'>
                                    <TeamBadge :team='team'/>
                                </template>
                                <span v-if='training.required' class="badge bg-red">Required</span>
                            </div>
                        </div>
                    </td>
                    <td><EpochRange :start='training.start_ts' :end='training.end_ts'/></td>
                </tr>
            </tbody>
        </table>
    </template>
</div>
</template>

<script>
import None from '../util/None.vue';
import EpochRange from '../util/EpochRange.vue';
import TeamBadge from '../util/TeamBadge.vue'
import {
    TablerLoading
} from '@tak-ps/vue-tabler'

export default {
    name: 'TrainingCard',
    props: {
        label: {
            type: String,
            default: 'Upcoming Training'
        },
        limit: {
            type: Number,
            default: 10
        }
    },
    data: function() {
        return {
            loading: true,
            list: {
                total: 0,
                training: []
            },
        }
    },
    mounted: async function() {
        await this.fetch();
    },
    methods: {
        fetch: async function() {
            this.loading = true;
            const url = window.stdurl('/api/training');
            url.searchParams.append('limit', this.limit);
            url.searchParams.append('start', +new Date());
            this.list = await window.std(url);
            this.loading = false;
        }
    },
    components: {
        TablerLoading,
        EpochRange,
        TeamBadge,
        None
    }
}
</script>
