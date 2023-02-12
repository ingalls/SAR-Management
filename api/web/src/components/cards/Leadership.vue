<template>
<div class="card">
    <div class='card-header'>
        <div class="col">
            <div class="d-flex">
                <h3 class='card-title'>Leadership Team</h3>

                <div class='ms-auto'>
                    <div class="btn-list">
                        <button data-bs-toggle="dropdown" type="button" class="btn dropdown-toggle dropdown-toggle-split" aria-expanded="false"></button>
                        <div class="dropdown-menu dropdown-menu-end" style="">
                            <a @click='$router.push("/team/leadership")' class="dropdown-item cursor-pointer">Edit</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="card-body">
        <div class="datagrid">
            <div class="datagrid-item" :key='position' v-for='position in Object.keys(leaders)'>
                <div class="datagrid-title" v-text='position'></div>
                <div class="datagrid-content">
                    <div :key='leader.id' v-for='leader in leaders[position]' class="d-flex align-items-center">
                        <Avatar :user='leader' :link='true'/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import Avatar from '../util/Avatar.vue';

export default {
    name: 'CardLeadership',
    data: function() {
        return {
            leaders: {}
        }
    },
    mounted: async function() {
        await this.listLeaders();
    },
    methods: {
        listLeaders: async function() {
            const list = await window.std('/api/leadership');

            for (const leader of list.leadership) {
                if (!this.leaders[leader.position]) this.leaders[leader.position] = [];
                this.leaders[leader.position].push(leader);

            }
        },
    },
    components: {
        Avatar
    }
}
</script>
