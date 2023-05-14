<template>
<thead>
    <tr>
        <template :key='h' v-for='h in header'>
            <th v-if='h.display'>
                <div class='d-flex'>
                    <span @click='sort = h.name' v-text='h.name' class='cursor-pointer'/>
                    <span v-if='h.name === sort' class='ms-auto'>
                        <ChevronDownIcon height='16' @click='order = "desc"' v-if='order === "asc"' class='cursor-pointer'/>
                        <ChevronUpIcon height='16' @click='order = "asc"' v-else class='cursor-pointer'/>
                    </span>

                    <template v-if='header[header.length - 1] === h'>
                        <span class='ms-auto'>
                            <SettingsIcon height='16' width='16' class='cursor-pointer'/>
                        </span>
                    </template>
                </div>
            </th>
        </template>
    </tr>
</thead>
</template>

<script>
import {
    ChevronUpIcon,
    ChevronDownIcon,
    SettingsIcon
} from 'vue-tabler-icons';

export default {
    name: 'TableHeader',
    props: {
        header: {
            type: Array,
            required: true,
            description: 'Array of object headers - [{ name: "example", "displayed: true }]'
        },
        order: {
            type: String,
            required: false,
            default: 'desc',
            description: 'Order to sort by asc or desc'
        },
        sort: {
            type: String,
            required: false,
            description: 'Field to sort by'
        },
    },
    watch: {
        sort: function() {
            this.$emit('update:sort', this.sort);
        },
        order: function() {
            this.$emit('update:order', this.order);
        }
    },
    components: {
        SettingsIcon,
        ChevronUpIcon,
        ChevronDownIcon
    }
}
</script>
