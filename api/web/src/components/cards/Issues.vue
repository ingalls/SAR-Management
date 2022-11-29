<template>
<div class="card">
    <div class="card-body">
        <div class="d-flex">
            <h3 class="card-title"><a @click='$router.push("/issue")' class='cursor-pointer'>Recent Issues</a></h3>

            <div class='ms-auto'>
                <div class="btn-list">
                    <TablerSelect
                        default='Recent'
                        :values='["Recent", "Priority"]'
                        @select='fetch($event)'
                    />

                    <button data-bs-toggle="dropdown" type="button" class="btn dropdown-toggle dropdown-toggle-split" aria-expanded="false"></button>
                    <div class="dropdown-menu dropdown-menu-end" style="">
                        <a @click='getExport' class="dropdown-item" href="#">Page</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <table class="table card-table table-vcenter">
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
</div>
</template>

<script>
import { Select } from '@tak-ps/vue-tabler';

export default {
    name: 'IssueCard',
    data: function() {
        return {
            issues: [],
        }
    },
    mounted: function() {
        this.fetch();
    },
    methods: {
        fetch: async function() {
            try {
                this.issues = (await window.std('/api/issue')).issues;
            } catch (err) {
                this.$emit('err', err);
            }
        }
    },
    components: {
        TablerSelect: Select
    }
}
</script>
