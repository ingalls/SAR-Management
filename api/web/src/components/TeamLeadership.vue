<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a @click='$router.push("/")' class='cursor-pointer'>Home</a></li>
                            <li class="breadcrumb-item" aria-current="page"><a @click='$router.push("/team")' class='cursor-pointer'>Team</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="#">Leadership</a></li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div class="col-lg-12">
                    <NoAccess v-if='!is_iam("Leadership:Admin")' title='Leadership'/>
                    <div v-else class="card">
                        <div class='card-header'>
                            <div class="col">
                                <div class="d-flex">
                                    <h3 class='card-title'>Leadership Team</h3>

                                    <div class='ms-auto'>
                                        <PlusIcon @click='push' class='cursor-pointer' height='24' width='24'/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <template v-if='loading.list'>
                            <TablerLoading desc='Loading Leadership'/>
                        </template>
                        <template v-else-if='!list.leadership.length'>
                            <None :create='false' label='Leaders'/>
                        </template>
                        <template v-else>
                            <table class="table card-table table-vcenter">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Position</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr :key='leader.id' v-for='(leader, leader_it) in list.leadership'>
                                        <template v-if='leader._edit'>
                                            <td>
                                                <UserDropdown v-model='leader.name' :disabled='leader._loading' @selected='selected(leader, $event)'/>
                                            </td>
                                            <td>
                                                <div class='d-flex'>
                                                    <TablerInput v-model='leader.position' :disabled='leader._loading' placeholder='Position' class='w-full' style='margin-right: 12px;'/>
                                                    <div class='ms-auto'>
                                                        <div v-if='!leader._loading' class='btn-list'>
                                                            <CheckIcon @click='saveLeader(leader)' class='my-1 cursor-pointer'/>
                                                        </div>
                                                        <div v-else class='btn-list'>
                                                            <TablerLoading :inline='true'/>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </template>
                                        <template v-else>
                                            <td><Avatar :user='leader' :link='true'/></td>
                                            <td>
                                                <div class='d-flex'>
                                                    <span v-text='leader.position'/>
                                                    <div class='ms-auto'>
                                                        <div v-if='!leader._loading' class='btn-list'>
                                                            <PencilIcon @click='leader._edit = true' class='cursor-pointer'/>
                                                            <TrashIcon @click='removeLeader(leader, leader_it)' class='cursor-pointer'/>
                                                        </div>
                                                        <div v-else class='btn-list'>
                                                            <TablerLoading :inline='true'/>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </template>
                                    </tr>
                                </tbody>
                            </table>
                        </template>

                        <TableFooter :limit='paging.limit' :total='list.total' @page='paging.page = $event'/>
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
import TableFooter from './util/TableFooter.vue';
import PageFooter from './PageFooter.vue';
import None from './util/None.vue';
import UserDropdown from './util/UserDropdown.vue';
import Avatar from './util/Avatar.vue';
import {
    PlusIcon,
    TrashIcon,
    PencilIcon,
    CheckIcon,
} from 'vue-tabler-icons'
import {
    TablerLoading,
    TablerInput
} from '@tak-ps/vue-tabler';

export default {
    name: 'TeamLeadership',
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
            loading: {
                list: true
            },
            paging: {
                limit: 25,
                page: 0
            },
            list: {
                total: 0,
                leadership: []
            }
        }
    },
    mounted: async function() {
        if (this.is_iam("Team:Admin")) await this.listLeaders();
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        push: function() {
            this.list.leadership.splice(0, 0, {
                _edit: true,
                _loading: false,
                uid: null,
                name: '',
                position: ''
            });
            this.list.total++;
        },
        selected: function(leader, user) {
            leader.name = user.fname + ' ' + user.lname;
            leader.uid = user.id;
        },
        removeLeader: async function(leader, it) {
            leader._loading = true;
            await window.std(`/api/leadership/${leader.id}`, {
                method: 'DELETE',
            });
            leader._loading = false;

            this.list.leadership.splice(it, 1);
            this.list.total--;
        },
        saveLeader: async function(leader) {
            leader._loading = true;

            if (leader.id) {
                await window.std(`/api/leadership/${leader.id}`, {
                    method: 'PATCH',
                    body: leader
                });
            } else {
                await window.std('/api/leadership', {
                    method: 'POST',
                    body: leader
                });
            }

            leader._loading = false;

            leader._edit = false;
        },
        listLeaders: async function() {
            this.loading.list = true;
            this.list = await window.std('/api/leadership');
            this.loading.list = false;
        }
    },
    components: {
        None,
        Avatar,
        PlusIcon,
        TrashIcon,
        CheckIcon,
        PencilIcon,
        TablerLoading,
        TablerInput,
        PageFooter,
        UserDropdown,
        TableFooter,
        NoAccess
    }
}
</script>
