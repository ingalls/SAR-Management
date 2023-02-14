<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a @click='$router.push("/")' class='cursor-pointer'>Home</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="#">Missions</a></li>
                        </ol>

                        <div class='ms-auto'>
                            <a v-if='is_iam("Mission:Manage")' @click='$router.push("/mission/new")' class="cursor-pointer btn btn-primary">
                                New Mission
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
                    <NoAccess v-if='!is_iam("Mission:View")' title='Missions'/>
                    <div v-else class="card">
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
                                </tr>
                            </thead>
                            <tbody>
                                <tr :key='mission.id' v-for='mission in list.missions'>
                                    <td><a @click='$router.push(`/mission/${mission.id}`)' class='cursor-pointer' v-text='mission.title'></a></td>
                                </tr>
                            </tbody>
                        </table>
                        <template v-if='!list.total'>
                            <None label='Missions' :create='false'/>
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
import iam from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import None from './util/None.vue';
import PageFooter from './PageFooter.vue';

export default {
    name: 'Missions',
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
                missions: []
            }
        }
    },
    watch: {
        'query.filter': async function() {
            await this.listMissions();
        }
    },
    mounted: async function() {
        if (this.is_iam('Mission:View')) await this.listMissions();
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        listMissions: async function() {
            const url = window.stdurl('/api/mission');
            if (this.query.filter) url.searchParams.append('filter', this.query.filter);
            this.list = await window.std(url)
        }
    },
    components: {
        None,
        PageFooter,
        NoAccess
    }
}
</script>
