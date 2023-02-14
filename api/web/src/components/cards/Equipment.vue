<template>
<div class="card">
    <div class="card-body">
        <h3 class="card-title"><a @click='$router.push("/equipment")' class='cursor-pointer' v-text='label'></a></h3>
    </div>
    <template v-if='!equipment.length'>
        <None :create='false' label='Personal Equipment' :compact='true'/>
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
                <tr :key='equip.id' v-for='equip in equipment'>
                    <td><a @click='$router.push(`/equipment/${equip.id}`)' v-text='equip.title' class='cursor-pointer'></a></td>
                </tr>
            </tbody>
        </table>
    </template>
</div>
</template>

<script>
import None from '../util/None.vue';

export default {
    name: 'EquipmentCard',
    props: {
        label: {
            type: String,
            default: 'Equipment'
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
            equipment: [],
        }
    },
    mounted: async function() {
        await this.fetch();
    },
    methods: {
        fetch: async function() {
            const url = window.stdurl('/api/equipment');
            url.searchParams.append('limit', this.limit);
            if (this.assigned) url.searchParams.append('assigned', this.assigned);
            this.equipement = (await window.std(url)).equipment;
        }
    },
    components: {
        None
    }
}
</script>
