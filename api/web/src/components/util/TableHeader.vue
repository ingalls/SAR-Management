<template>
<thead>
    <tr>
        <th :key='h' v-for='h in header'>
            <div class='d-flex'>
                <span @click='selected = h' v-text='h' class='cursor-pointer'/>
                <span v-if='h === selected' class='ms-auto'>
                    <ChevronUpIcon height='16' @click='order = "desc"' v-if='order === "asc"' class='cursor-pointer'/>
                    <ChevronDownIcon height='16' @click='order = "asc"' v-else class='cursor-pointer'/>
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
    },
    data: function() {
        return {
            selected: this.header[0],
            order: 'asc'
        }
    },
    components: {
        ChevronUpIcon,
        ChevronDownIcon
    }
}
</script>
