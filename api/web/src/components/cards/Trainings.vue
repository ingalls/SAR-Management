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
        <None :create='false' :label='training' :compact='true'/>
    </template>
    <template v-else>
        <table class="table card-table table-vcenter">
            <thead>
                <tr>
                    <th>Name</th>
                    <th colspan="2">Labels</th>
                </tr>
            </thead>
            <tbody>
                <tr :key='training.id' v-for='training in list.training'>
                    <td><a @click='$router.push(`/training/${training.id}`)' v-text='training.title' class='cursor-pointer'></a></td>
                </tr>
            </tbody>
        </table>
    </template>
</div>
</template>

<script>
import None from '../util/None.vue';
import {
    TablerLoading
} from '@tak-ps/vue-tabler'

export default {
    name: 'IssueCard',
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
            this.list = await window.std(url);
            this.loading = false;
        }
    },
    components: {
        TablerLoading,
        None
    }
}
</script>
