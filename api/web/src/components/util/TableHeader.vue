<template>
<thead>
    <tr>
        <th :key='h' v-for='h in header'>
            <div class='d-flex'>
                <span @click='sort = h' v-text='h' class='cursor-pointer'/>
                <span v-if='h === sort' class='ms-auto'>
                    <ChevronDownIcon height='16' @click='order = "desc"' v-if='order === "asc"' class='cursor-pointer'/>
                    <ChevronUpIcon height='16' @click='order = "asc"' v-else class='cursor-pointer'/>
                </span>
            </div>
        </th>
    </tr>
</thead>
</template>

<script>
import {
    ChevronUpIcon,
    ChevronDownIcon
} from 'vue-tabler-icons';

export default {
    name: 'TableHeader',
    props: {
        header: {
            type: Array,
            required: true
        },
        order: {
            type: String,
            required: false,
            default: 'desc'
        },
        sort: {
            type: String,
            required: false
        }
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
        ChevronUpIcon,
        ChevronDownIcon
    }
}
</script>
