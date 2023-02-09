<template>
<div class="card">
    <div class="card-header row">
        <div class="d-flex">
            <h3 class="card-title"><a @click='$router.push("/training")' class='cursor-pointer' v-text='label'></a></h3>
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
            <tr :key='training.id' v-for='training in list.training'>
                <td><a @click='$router.push(`/training/${training.id}`)' v-text='training.title' class='cursor-pointer'></a></td>
            </tr>
        </tbody>
    </table>
</div>
</template>

<script>
export default {
    name: 'IssueCard',
    props: {
        label: {
            type: String,
            default: 'Upcoming Training'
        },
        limit: {
            type: Number,
            default: 10
        }
    },
    data: function() {
        return {
            list: {
                total: 0,
                training: []
            },
        }
    },
    mounted: async function() {
        await this.fetch();
    },
    methods: {
        fetch: async function() {
            const url = window.stdurl('/api/training');
            url.searchParams.append('limit', this.limit);
            this.list = await window.std(url);
        }
    },
}
</script>
