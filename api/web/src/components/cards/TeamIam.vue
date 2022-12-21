<template>
<div class="card">
    <div class="card-body">
        <div class="d-flex">
            <h3 class="card-title"><a @click='$router.push("/issue")' class='cursor-pointer' v-text='label'></a></h3>

            <div class='ms-auto'>
                <div class='btn btn--sm'>
                    <PlusIcon/>
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
                <td v-text='policy.groupref'></td>
                <td v-text='policy.resource'></td>
                <td>
                    <div class='d-flex'>
                        <span v-text='policy.action'/>
                        <div class='ms-auto'>
                            <div class='btn-list'>
                                <PencilIcon class='cursor-pointer'/>
                                <TrashIcon class='cursor-pointer'/>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</div>
</template>

<script>
import {
    PlusIcon,
    PencilIcon,
    TrashIcon
} from 'vue-tabler-icons';

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
        fetch: async function() {
            try {
                const url = window.stdurl(`/api/team/${this.team.id}/iam`);
                this.policies = await window.std(url);
            } catch (err) {
                this.$emit('err', err);
            }
        }
    },
    components: {
        PlusIcon,
        PencilIcon,
        TrashIcon
    }
}
</script>
