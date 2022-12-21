<template>
<div class="card">
    <div class="card-body">
        <div class="d-flex">
            <h3 class="card-title"><a @click='$router.push("/issue")' class='cursor-pointer' v-text='label'></a></h3>

            <div class='ms-auto'>
                <div class='btn'>
                    <PlusIcon @click='push' height='16' width='16'/>
                </div>
            </div>
        </div>
    </div>
    <table class="table card-table table-vcenter">
        <thead>
            <tr>
                <th>Group Ref</th>
                <th>Resource</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            <tr :key='policy.id' v-for='policy in policies'>
                <template v-if='policy._edit'>
                    <td>
                        <TablerInput v-model='policy.groupref' placeholder='Group Ref'/>
                    </td>
                    <td>
                        <TablerInput v-model='policy.resource' placeholder='Resource'/>
                    </td>
                    <td>
                        <div class='d-flex'>
                            <TablerInput v-model='policy.action' placeholder='Action'/>
                            <div class='ms-auto'>
                                <div class='btn-list'>
                                    <CheckIcon @click='policy._edit = false' class='my-1 cursor-pointer'/>
                                </div>
                            </div>
                        </div>
                    </td>
                </template>
                <template v-else>
                    <td v-text='policy.groupref'></td>
                    <td v-text='policy.resource'></td>
                    <td>
                        <div class='d-flex'>
                            <span v-text='policy.action'/>
                            <div class='ms-auto'>
                                <div class='btn-list'>
                                    <PencilIcon @click='policy._edit = true' class='cursor-pointer'/>
                                    <TrashIcon class='cursor-pointer'/>
                                </div>
                            </div>
                        </div>
                    </td>
                </template>
            </tr>
        </tbody>
    </table>

    <div class='card-body'>
        <div class='d-flex'>
            <div class='ms-auto'>
                <a @click='update' class="cursor-pointer btn btn-primary">Save IAM</a>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import {
    PlusIcon,
    PencilIcon,
    CheckIcon,
    TrashIcon
} from 'vue-tabler-icons';
import {
    TablerInput
} from '@tak-ps/vue-tabler'

export default {
    name: 'TeamIAMCard',
    props: {
        label: {
            type: String,
            default: 'Team IAM'
        },
        team: {
            type: Object,
            required: true
        }
    },
    data: function() {
        return {
            policies: [],
        }
    },
    mounted: async function() {
        await this.fetch();
    },
    methods: {
        push: function() {
            this.policies.push({
                _edit: true,
                group: '',
                role: '',
                action: ''
            });
        },
        fetch: async function() {
            const url = window.stdurl(`/api/team/${this.team.id}/iam`);
            this.policies = (await window.std(url)).map((policy) => {
                policy._edit = false;
                return policy;
            });
        }
    },
    components: {
        TablerInput,
        PlusIcon,
        CheckIcon,
        PencilIcon,
        TrashIcon
    }
}
</script>
