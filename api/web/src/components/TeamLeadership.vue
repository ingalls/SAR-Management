<template>
    <div>
        <div class='page-wrapper'>
            <div class='page-header d-print-none'>
                <div class='container-xl'>
                    <div class='row g-2 align-items-center'>
                        <div class='col d-flex'>
                            <TablerBreadCrumb />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class='page-body'>
            <div class='container-xl'>
                <div class='row row-deck row-cards'>
                    <div class='col-lg-12'>
                        <NoAccess
                            v-if='!is_iam("Leadership:Admin")'
                            title='Leadership'
                        />
                        <div
                            v-else
                            class='card'
                        >
                            <div class='card-header'>
                                <div class='col'>
                                    <div class='d-flex'>
                                        <h3 class='card-title'>
                                            Leadership Team
                                        </h3>

                                        <div class='ms-auto'>
                                            <IconPlus
                                                class='cursor-pointer'
                                                :size='24'
                                                :stroke='1'
                                                @click='push'
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <template v-if='loading.list'>
                                <TablerLoading desc='Loading Leadership' />
                            </template>
                            <template v-else-if='!list.items.length'>
                                <TablerNone
                                    :create='false'
                                    label='Leaders'
                                />
                            </template>
                            <template v-else>
                                <div class='table-responsive'>
                                    <table class='table card-table table-hover table-vcenter'>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Position</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr
                                                v-for='(leader, leader_it) in list.items'
                                                :key='leader.id'
                                            >
                                                <template v-if='leader._edit'>
                                                    <td>
                                                        <UserDropdown
                                                            v-model='leader.name'
                                                            :disabled='leader._loading'
                                                            @selected='selected(leader, $event)'
                                                        />
                                                    </td>
                                                    <td>
                                                        <div class='d-flex'>
                                                            <TablerInput
                                                                v-model='leader.position'
                                                                label='Position'
                                                                :disabled='leader._loading'
                                                                placeholder='Position'
                                                                class='w-full'
                                                                style='margin-right: 12px;'
                                                            />
                                                            <div class='ms-auto'>
                                                                <div
                                                                    v-if='!leader._loading'
                                                                    class='btn-list'
                                                                >
                                                                    <IconCheck
                                                                        class='my-1 cursor-pointer'
                                                                        :size='32'
                                                                        :stroke='1'
                                                                        @click='saveLeader(leader)'
                                                                    />
                                                                </div>
                                                                <div
                                                                    v-else
                                                                    class='btn-list'
                                                                >
                                                                    <TablerLoading :inline='true' />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </template>
                                                <template v-else>
                                                    <td>
                                                        <Avatar
                                                            :user='leader'
                                                            :link='true'
                                                        />
                                                    </td>
                                                    <td>
                                                        <div class='d-flex'>
                                                            <span v-text='leader.position' />
                                                            <div class='ms-auto'>
                                                                <div
                                                                    v-if='!leader._loading'
                                                                    class='btn-list'
                                                                >
                                                                    <IconPencil
                                                                        class='cursor-pointer'
                                                                        :size='32'
                                                                        :stroke='1'
                                                                        @click='leader._edit = true'
                                                                    />
                                                                    <IconTrash
                                                                        class='cursor-pointer'
                                                                        :size='32'
                                                                        :stroke='1'
                                                                        @click='removeLeader(leader, leader_it)'
                                                                    />
                                                                </div>
                                                                <div
                                                                    v-else
                                                                    class='btn-list'
                                                                >
                                                                    <TablerLoading :inline='true' />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </template>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </template>

                            <TableFooter
                                :limit='paging.limit'
                                :total='list.total'
                                @page='paging.page = $event'
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import iamHelper from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import TableFooter from './util/TableFooter.vue';
import UserDropdown from './util/UserDropdown.vue';
import Avatar from './util/Avatar.vue';
import {
    IconPlus,
    IconTrash,
    IconPencil,
    IconCheck,
} from '@tabler/icons-vue'
import {
    TablerNone,
    TablerBreadCrumb,
    TablerLoading,
    TablerInput
} from '@tak-ps/vue-tabler';

const props = defineProps({
    iam: {
        type: Object,
        required: true
    },
    auth: {
        type: Object,
        required: true
    }
})

const loading = reactive({
    list: true
});
const paging = reactive({
    limit: 25,
    page: 0
});
const list = reactive({
    total: 0,
    items: []
});

onMounted(async () => {
    if (is_iam("Team:Admin")) await listLeaders();
});

function is_iam(permission) {
    return iamHelper(props.iam, props.auth, permission);
}

function push() {
    list.items.splice(0, 0, {
        _edit: true,
        _loading: false,
        uid: null,
        name: '',
        position: ''
    });
    list.total++;
}

function selected(leader, user) {
    leader.name = user.fname + ' ' + user.lname;
    leader.uid = user.id;
}

async function removeLeader(leader, it) {
    leader._loading = true;
    await window.std(`/api/leadership/${leader.id}`, {
        method: 'DELETE',
    });
    leader._loading = false;

    list.items.splice(it, 1);
    list.total--;
}

async function saveLeader(leader) {
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
}

async function listLeaders() {
    loading.list = true;
    const result = await window.std('/api/leadership');
    list.total = result.total;
    list.items = result.items;
    loading.list = false;
}
</script>
