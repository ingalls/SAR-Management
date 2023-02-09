<template>
<div class="card">
    <div class="card-body">
        <div class="d-flex">
            <h3 class="card-title" v-text='label'></h3>

            <div class='ms-auto'>
                <div class="btn-list">
                    <TablerSelect
                        default='Recent'
                        :values='["Recent"]'
                        @select='fetch($event)'
                    />

                    <button data-bs-toggle="dropdown" type="button" class="btn dropdown-toggle dropdown-toggle-split" aria-expanded="false"></button>
                    <div class="dropdown-menu dropdown-menu-end" style="">
                        <a @click='getExport' class="dropdown-item" href="#">Page</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <template v-if='!missions.length'>
        <None :create='false' label='Missions'/>
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
import { TablerSelect } from '@tak-ps/vue-tabler';
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
        fetch: async function() {
            const url = window.stdurl('/api/mission');
            url.searchParams.append('limit', this.limit);
            if (this.assigned) url.searchParams.append('assigned', this.assigned);

            this.missions = (await window.std(url)).missions;
        }
    },
    components: {
        None,
        TablerSelect
    }
}
</script>
