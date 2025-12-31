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
                            v-if='!is_iam("Equipment:View")'
                            title='Equipment Types'
                        />
                        <div
                            v-else
                            class='card'
                        >
                            <div class='card-body'>
                                <div class='d-flex'>
                                    <div class='input-icon w-50'>
                                        <input
                                            v-model='query.filter'
                                            type='text'
                                            class='form-control'
                                            placeholder='Search…'
                                        >
                                        <span class='input-icon-addon'>
                                            <IconSearch
                                                :size='24'
                                                stroke='1'
                                            />
                                        </span>
                                    </div>
                                    <div
                                        v-if='is_iam("Equipment:Admin")'
                                        class='ms-auto'
                                    >
                                        <IconPlus
                                            :size='32'
                                            stroke='1'
                                            class='cursor-pointer'
                                            @click='$router.push("/equipment/type/new")'
                                        />
                                    </div>
                                </div>
                            </div>
                            <table class='table card-table table-vcenter'>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Created</th>
                                        <th>Updated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for='type in list.types'
                                        :key='type.id'
                                    >
                                        <td>
                                            <a
                                                class='cursor-pointer'
                                                @click='$router.push(`/equipment/type/${type.id}`)'
                                                v-text='type.type'
                                            />
                                        </td>
                                        <td><TablerEpoch :date='type.created' /></td>
                                        <td><TablerEpoch :date='type.updated' /></td>
                                    </tr>
                                </tbody>
                            </table>
                            <template v-if='!list.total'>
                                <TablerNone
                                    label='No Equipment Types'
                                    :create='false'
                                />
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import NoAccess from './util/NoAccess.vue';
import {
    TablerNone,
    TablerEpoch,
    TablerBreadCrumb
} from '@tak-ps/vue-tabler';
import iamHelper from '../iam.js';
import {
    IconPlus,
    IconSearch
} from '@tabler/icons-vue'

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

const query = reactive({
    filter: ''
})

const list = reactive({
    total: 0,
    types: []
})

function is_iam(permission) { 
    return iamHelper(props.iam, props.auth, permission) 
}

async function listTypes() {
    const url = window.stdurl('/api/equipment-type');
    if (query.filter) url.searchParams.append('filter', query.filter);
    const result = await window.std(url)
    list.total = result.total
    list.types = result.types
}

onMounted(async () => {
    if (is_iam("Equipment:View")) await listTypes();
})
</script>
