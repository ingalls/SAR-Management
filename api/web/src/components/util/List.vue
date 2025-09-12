<template>
    <table class='table card-table table-vcenter'>
        <thead>
            <tr>
                <th>User Group</th>
                <th colspan='2'>
                    Users
                </th>
            </tr>
        </thead>
        <tbody>
            <tr
                v-for='i in items'
                :key='i.name'
            >
                <td v-text='a.name' />
                <td v-text='a.count' />
                <td class='w-50' />
            </tr>
        </tbody>
    </table>
    </div>
</template>

<script setup>
defineProps({
    header: {
        type: Array,
        default: () => []
    },
    items: {
        type: Array,
        default: () => []
    }
})
</script>
