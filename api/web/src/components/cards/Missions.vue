<template>
<div class="card">
    <div class="card-header">
        <h3 @click='fullpage' class="card-title cursor-pointer" v-text='label'></h3>
    </div>
    <template v-if='!missions.length'>
        <None :create='false' label='Missions'/>
    </template>
    <template v-else>
        <table class="table card-table table-hover table-vcenter">
            <thead>
                <tr>
                    <th>Name</th>
                    <th colspan="2">Labels</th>
                </tr>
            </thead>
            <tbody>
                <tr :key='mission.id' v-for='mission in missions'>
                    <td><a @click='$router.push(`/mission/${mission.id}`)' v-text='mission.title' class='cursor-pointer'></a></td>
                    <td v-text='mission.priority'></td>
                </tr>
            </tbody>
        </table>
    </template>
</div>
</template>

<script>
import None from '../util/None.vue';

export default {
    name: 'MissionCard',
    props: {
        label: {
            type: String,
            default: 'Recent Missions'
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
            missions: [],
        }
    },
    mounted: async function() {
        await this.fetch();
    },
    methods: {
        fullpage: function() {
            const searchParams = {}
            if (this.assigned) searchParams.assigned = this.assigned;
            this.$router.push({ path: '/mission', query: searchParams });
        },
        fetch: async function() {
            const url = window.stdurl('/api/mission');
            url.searchParams.append('limit', this.limit);
            if (this.assigned) url.searchParams.append('assigned', this.assigned);

            this.missions = (await window.std(url)).missions;
        }
    },
    components: {
        None,
    }
}
</script>
