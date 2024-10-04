<template>
    <thead>
        <tr>
            <th
                v-for='h in shown'
                :key='h'
            >
                <div class='d-flex'>
                    <span
                        class='cursor-pointer'
                        @click='sort = h.name'
                        v-text='h.name'
                    />
                    <span
                        v-if='h.name === sort'
                        class='ms-auto'
                    >
                        <ChevronDownIcon
                            v-if='order === "asc"'
                            height='16'
                            class='cursor-pointer'
                            @click='order = "desc"'
                        />
                        <ChevronUpIcon
                            v-else
                            height='16'
                            class='cursor-pointer'
                            @click='order = "asc"'
                        />
                    </span>

                    <template v-if='shown[shown.length - 1] === h'>
                        <div class='ms-auto'>
                            <div class='dropdown'>
                                <SettingsIcon
                                    height='16'
                                    width='16'
                                    class='mx-2 dropdown-toggle cursor-pointer'
                                    data-bs-toggle='dropdown'
                                />
                                <div class='dropdown-menu'>
                                    <div
                                        v-for='(h, h_it) of header'
                                        :key='h_it'
                                        class='mx-1 my-1'
                                    >
                                        <label class='form-check subheader mb-0'>
                                            <input
                                                class='form-check-input'
                                                type='checkbox'
                                                :checked='h.display'
                                                @change='displayHeader(h_it, $event)'
                                            >
                                            <span
                                                class='form-check-label'
                                                v-text='h.name'
                                            />
                                        </label>
                                    </div>
                                    <div
                                        v-if='export'
                                        class='px-2 py-1'
                                    >
                                        <div
                                            class='btn w-full'
                                            @click='$emit("export")'
                                        >
                                            Export
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </th>
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
    components: {
        SettingsIcon,
        ChevronUpIcon,
        ChevronDownIcon
    },
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
        export: {
            type: Boolean,
            required: false,
            description: 'Export Events',
            default: false,
        },
    },
    computed: {
        shown: function() {
           return this.header.filter((h) => {
                return h.display;
           });
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
    methods: {
        displayHeader: function(h_it, $event) {
            const header = JSON.parse(JSON.stringify(this.header));
            header[h_it].display = $event.target.checked;
            this.$emit('update:header', header);
        }
    }
}
</script>
