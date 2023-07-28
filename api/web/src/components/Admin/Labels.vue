<template>
<div class="card">
    <div class="card-body">
        <div class="d-flex">
            <h3 class="card-title"><a @click='$router.push("/issue")' class='cursor-pointer'></a>Issue Labels</h3>
        </div>
    </div>
    <table class="table card-table table-vcenter">
        <thead>
            <tr>
                <th>Label</th>
                <th colspan="2">Colour</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    </table>
</div>
</template>

<script>
export default {
    name: 'AdminLabelCard',
    data: function() {
        return {
            list: {
                total: 0,
                roles: ''
            }
        }
    },
    mounted: async function() {
        await this.fetch();
    },
    methods: {
        fetch: async function() {
            //const url = window.stdurl('/api/meta/roles');
            //this.list = await window.std(url);
        }
    },
}
</script>
