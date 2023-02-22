<template>
<div class="card">
    <div class="card-body">
        <h3 class="card-title"><a @click='$router.push("/equipment")' class='cursor-pointer' v-text='label'></a></h3>
    </div>
    <template v-if='loading.list'>
        <TablerLoading/>
    </template>
    <template v-else-if='!list.equipment.length'>
        <None :create='false' label='Equipment' :compact='true'/>
    </template>
    <template v-else>
        <table class="table card-table table-vcenter">
            <thead>
                <tr>
                    <th>Name</th>
                    <th colspan="2">Status</th>
                </tr>
            </thead>
            <tbody>
                <tr :key='equip.id' v-for='equip in list.equipment'>
                    <td><a @click='$router.push(`/equipment/${equip.id}`)' v-text='equip.name' class='cursor-pointer'></a></td>
                    <td v-text='equip.status'></td>
                </tr>
            </tbody>
        </table>
    </template>

    <TableFooter v-if='footer' :limit='paging.limit' :total='list.total' @page='paging.page = $event'/>
</div>
</template>

<script>
import None from '../util/None.vue';
import TableFooter from '../util/TableFooter.vue';
import {
    TablerLoading
} from '@tak-ps/vue-tabler';

export default {
    name: 'EquipmentCard',
    props: {
        label: {
            type: String,
            default: 'Equipment'
        },
        assigned: {
            type: Number,
            default: null
        },
        parent: {
            type: Number,
            default: 0
        },
        footer: {
            type: Boolean,
            default: true
        }
    },
    data: function() {
        return {
            loading: {
                list: true
            },
            paging: {
                filter: '',
                limit: 10,
                page: 0
            },
            list: {
                total: 0,
                equipment: []
            }
        }
    },
    watch: {
        'paging.page': async function() {
            await this.listUsers();
        },
        'paging.filter': async function() {
            await this.listUsers();
        }
    },
    mounted: async function() {
        await this.fetch();
    },
    methods: {
        fetch: async function() {
            this.loading.list = true;
            const url = window.stdurl('/api/equipment');
            url.searchParams.append('limit', this.paging.limit);
            url.searchParams.append('page', this.paging.page);
            url.searchParams.append('filter', this.paging.filter);

            if (typeof this.assigned === 'number') url.searchParams.append('assigned', this.assigned);
            if (typeof this.parent === 'number') url.searchParams.append('parent', this.parent);
            this.list = await window.std(url);
            this.loading.list = false;
        }
    },
    components: {
        None,
        TableFooter,
        TablerLoading
    }
}
</script>
