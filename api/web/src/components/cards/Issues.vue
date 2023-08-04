<template>
<div class="card">
    <div class="card-header row">
        <div class="d-flex">
            <h3 class="card-title"><a @click='$router.push("/issue")' class='cursor-pointer' v-text='label'></a></h3>
        </div>
    </div>
    <template v-if='loading'>
        <TablerLoading desc='Loading Issues'/>
    </template>
    <template v-else-if='!issues.length'>
        <None :create='false' label='Assigned Issues'/>
    </template>
    <template v-else>
        <table class="table card-table table-hover table-vcenter">
            <thead>
                <tr>
                    <th>Name</th>
                    <th colspan="2">Labels</th>
                </tr>
            </thead>
            <tbody>
                <tr :key='issue.id' v-for='issue in issues'>
                    <td><a @click='$router.push(`/issue/${issue.id}`)' v-text='issue.title' class='cursor-pointer'></a></td>
                    <td v-text='issue.priority'></td>
                </tr>
            </tbody>
        </table>
    </template>
</div>
</template>

<script>
import None from '../util/None.vue';
import {
    TablerLoading
} from '@tak-ps/vue-tabler'

export default {
    name: 'IssueCard',
    props: {
        label: {
            type: String,
            default: 'Recent Issues'
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
            loading: true,
            issues: [],
        }
    },
    mounted: async function() {
        await this.fetch();
    },
    methods: {
        fetch: async function() {
            this.loading = true;
            const url = window.stdurl('/api/issue');
            url.searchParams.append('limit', this.limit);
            if (this.assigned) url.searchParams.append('assigned', this.assigned);
            this.issues = (await window.std(url)).issues;
            this.loading = false;
        }
    },
    components: {
        None,
        TablerLoading
    }
}
</script>
