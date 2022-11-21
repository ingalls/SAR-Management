<template>
<table class="table card-table table-vcenter">
    <thead>
        <tr>
            <th>User Group</th>
            <th colspan="2">Users</th>
        </tr>
    </thead>
    <tbody>
        <tr :key='i.name' v-for='i in items'>
            <td v-text='a.name'></td>
            <td v-text='a.count'></td>
            <td class="w-50">
            </td>
        </tr>
    </tbody>
</table>
</div>
</template>

<script>
export default {
    name: 'TablerList',
    props: {
        header: {
            type: Array,
            default: []
        },
        items: {
            type: Array,
            default: []
        }
    },
    data: function() {
        return { };
    },
}
</script>
