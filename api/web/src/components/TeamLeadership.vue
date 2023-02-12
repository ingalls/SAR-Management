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
                    <div class="card">
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
                        <TablerLoading v-if='loading.list'/>
                        <template v-else-if='!leaders.length'>
                            <None :create='false' label='Leaders'/>
                        </template>
                        <table v-else class="table card-table table-vcenter">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Position</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr :key='leader.id' v-for='leader in leaders'>
                                    <template v-if='leader._edit'>
                                        <td>
                                            <UserDropdown v-model='leader.name' @selected='selected(leader, $event)'/>
                                        </td>
                                        <td>
                                            <div class='d-flex'>
                                                <TablerInput v-model='leader.position' placeholder='Position' class='w-full' style='margin-right: 12px;'/>
                                                <div class='ms-auto'>
                                                    <div class='btn-list'>
                                                        <CheckIcon @click='saveLeader(leader)' class='my-1 cursor-pointer'/>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </template>
                                    <template v-else>
                                        <td><Avatar :user='leader' link='true'/></td>
                                        <td>
                                            <div class='d-flex'>
                                                <span v-text='leader.position'/>
                                                <div class='ms-auto'>
                                                    <div class='btn-list'>
                                                        <PencilIcon @click='leader._edit = true' class='cursor-pointer'/>
                                                        <TrashIcon class='cursor-pointer'/>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </template>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <PageFooter/>
</div>
</template>

<script>
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
    data: function() {
        return {
            loading: {
                list: true
            },
            leaders: []
        }
    },
    mounted: async function() {
        await this.listLeaders();
    },
    methods: {
        push: function() {
            this.leaders.splice(0, 0, {
                _edit: true,
                uid: null,
                name: '',
                position: ''
            });
        },
        selected: function(leader, user) {
            leader.name = user.fname + ' ' + user.lname;
            leader.uid = user.id;
        },
        saveLeader: async function(leader) {
            leader._edit = false;
            await window.std('/api/leadership', {
                method: 'POST',
                body: leader
            });
        },
        listLeaders: async function() {
            this.loading.list = true;
            this.leaders = (await window.std('/api/leadership')).leadership;
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
        UserDropdown
    }
}
</script>
