<template>
    <div class='card'>
        <div class='card-header'>
            <div class='col'>
                <div class='d-flex'>
                    <h3 class='card-title'>
                        Leadership Team
                    </h3>

                    <div class='ms-auto'>
                        <div class='btn-list'>
                            <button
                                data-bs-toggle='dropdown'
                                type='button'
                                class='btn dropdown-toggle dropdown-toggle-split'
                                aria-expanded='false'
                            />
                            <div
                                class='dropdown-menu dropdown-menu-end'
                                style=''
                            >
                                <a
                                    class='dropdown-item cursor-pointer'
                                    @click='$router.push("/team/leadership")'
                                >Edit</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class='card-body'>
            <div class='datagrid'>
                <div
                    v-for='position in Object.keys(leaders)'
                    :key='position'
                    class='datagrid-item'
                >
                    <div
                        class='datagrid-title'
                        v-text='position'
                    />
                    <div class='datagrid-content'>
                        <div
                            v-for='leader in leaders[position]'
                            :key='leader.id'
                            class='d-flex align-items-center py-1'
                        >
                            <Avatar
                                :user='leader'
                                :link='true'
                            />
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
    components: {
        Avatar
    },
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

            for (const leader of list.items) {
                if (!this.leaders[leader.position]) this.leaders[leader.position] = [];
                this.leaders[leader.position].push(leader);

            }
        },
    }
}
</script>
