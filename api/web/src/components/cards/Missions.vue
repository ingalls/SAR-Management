<template>
<div class="card">
    <div class="card-body">
        <div class="d-flex">
            <h3 class="card-title">Recent Missions</h3>

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
</div>
</template>

<script>
import TablerSelect from '../util/Select.vue';

export default {
    name: 'MissionCard',
    data: function() {
        return {
            missions: [],
        }
    },
    mounted: function() {
        this.fetch();
    },
    methods: {
        fetch: async function(current) {
            try {
                this.missions = (await window.std('/api/mission')).missions;
            } catch (err) {
                this.$emit('err', err);
            }
        }
    },
    components: {
        TablerSelect
    }
}
</script>
