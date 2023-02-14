<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a @click='$router.push("/")' class='cursor-pointer'>Home</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="#">Equipment</a></li>
                        </ol>

                        <div class='ms-auto'>
                            <a @click='$router.push("/equipment/new")' class="cursor-pointer btn btn-primary">
                                New Gear
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div class="col-lg-12">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex">
                                <div class="input-icon w-50">
                                    <input v-model='query.filter' type="text" class="form-control" placeholder="Search…">
                                    <span class="input-icon-addon">
                                        <SearchIcon width='24'/>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <table class="table card-table table-vcenter">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr :key='equip.id' v-for='equip in list.equipment'>
                                    <td>
                                        <a @click='$router.push(`/equipment/${equip.id}`)' class='cursor-pointer' v-text='equip.name'></a>
                                    </td>
                                    <td v-text='equip.status'></td>
                                </tr>
                            </tbody>
                        </table>
                        <template v-if='!list.total'>
                            <None label='Equipment' :create='false'/>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <PageFooter/>
</div>
</template>

<script>
import None from './util/None.vue';
import PageFooter from './PageFooter.vue';
import {
    SearchIcon
} from 'vue-tabler-icons'

export default {
    name: 'Equipments',
    props: {
        iam: {
            type: Object,
            required: true
        },
        auth: {
            type: Object,
            required: true
        }
    },
    data: function() {
        return {
            query: {
                filter: ''
            },
            list: {
                total: 0,
                equipment: []
            }
        }
    },
    mounted: async function() {
        await this.listEquipment();
    },
    methods: {
        listEquipment: async function() {
            const url = window.stdurl('/api/equipment');
            if (this.query.filter) url.searchParams.append('filter', this.query.filter);
            this.list = await window.std(url)
        }
    },
    components: {
        None,
        PageFooter,
        SearchIcon
    }
}
</script>
