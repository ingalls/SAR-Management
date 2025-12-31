<template>
    <TablerModal v-if='modal'>
        <div class='bg-white'>
            <div class='modal-status bg-yellow' />
            <div class='modal-header'>
                <div class='modal-title'>
                    Table Columns
                </div>

                <button
                    type='button'
                    class='btn-close'
                    aria-label='Close'
                    @click='modal = false'
                />
            </div>
            <div class='modal-body'>
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

                <div class='pt-4'>
                    <div
                        v-if='allowExport'
                        class='px-2 py-1'
                    >
                        <div
                            class='btn btn-secondary w-full'
                            @click='$emit("export")'
                        >
                            Export
                        </div>
                    </div>
                    <div class='px-2 py-1'>
                        <div
                            class='btn btn-primary w-full'
                            @click='modal = false'
                        >
                            Done
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </TablerModal>

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
                        <IconChevronDown
                            v-if='order === "asc"'
                            size='16'
                            stroke='1'
                            class='cursor-pointer'
                            @click='order = "desc"'
                        />
                        <IconChevronUp
                            v-else
                            size='16'
                            stroke='1'
                            class='cursor-pointer'
                            @click='order = "asc"'
                        />
                    </span>

                    <template v-if='shown[shown.length - 1] === h'>
                        <div class='ms-auto'>
                            <IconSettings
                                size='16'
                                stroke='1'
                                class='mx-2 cursor-pointer'
                                @click='modal = true'
                            />
                        </div>
                    </template>
                </div>
            </th>
        </tr>
    </thead>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import {
    IconChevronUp,
    IconChevronDown,
    IconSettings
} from '@tabler/icons-vue';
import {
    TablerModal
} from '@tak-ps/vue-tabler';

const props = defineProps({
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
    allowExport: {
        type: Boolean,
        required: false,
        description: 'Export Events',
        default: false,
    },
});

const emit = defineEmits(['update:sort', 'update:order', 'update:header', 'export']);

const modal = ref(false);
const sort = ref(props.sort);
const order = ref(props.order);

const shown = computed(() => {
   return props.header.filter((h) => {
        return h.display;
   });
});

watch(sort, () => {
    emit('update:sort', sort.value);
});

watch(order, () => {
    emit('update:order', order.value);
});

const displayHeader = (h_it, $event) => {
    const header = JSON.parse(JSON.stringify(props.header));
    header[h_it].display = $event.target.checked;
    emit('update:header', header);
};
</script>
