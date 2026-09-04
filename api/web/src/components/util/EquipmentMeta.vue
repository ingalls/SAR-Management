<template>
    <div
        v-if='schema.properties && Object.keys(schema.properties).length !== 0'
        class='col-md-12 my-3'
    >
        <div class='card-header'>
            <span class='card-title'>Equipment Metadata</span>
        </div>

        <div class='col'>
            <template v-if='schema.type !== "object"'>
                <div class='d-flex justify-content-center my-4'>
                    Only Object Schemas are Supported.
                </div>
            </template>
            <template v-else>
                <div
                    v-for='key in Object.keys(schema.properties)'
                    :key='key'
                    class='py-2 px-3 floating-input'
                >
                    <template v-if='schema.properties[key].enum'>
                        <div class='row round px-2 py-2'>
                            <TablerEnum
                                v-model='meta[key]'
                                :label='key'
                                :description='schema.properties[key].description'
                                :options='schema.properties[key].enum.map((e) => String(e))'
                                :disabled='disabled'
                            />
                        </div>
                    </template>
                    <template v-else-if='schema.properties[key].type === "string"'>
                        <div class='row round px-2 py-2'>
                            <TablerInput
                                v-model='meta[key]'
                                :label='key'
                                :description='schema.properties[key].description'
                                :disabled='disabled'
                            />
                        </div>
                    </template>
                    <template v-else-if='schema.properties[key].type === "number" || schema.properties[key].type === "integer"'>
                        <div class='row round px-2 py-2'>
                            <TablerInput
                                :model-value='meta[key] ?? ""'
                                type='number'
                                :label='key'
                                :description='schema.properties[key].description'
                                :disabled='disabled'
                                @update:model-value='setNumber(key, $event, schema.properties[key].type === "integer")'
                            />
                        </div>
                    </template>
                    <template v-else-if='schema.properties[key].type === "boolean"'>
                        <div class='row round px-2 py-2'>
                            <TablerToggle
                                v-model='meta[key]'
                                :label='key'
                                :disabled='disabled'
                            />
                        </div>
                    </template>
                    <template v-else-if='schema.properties[key].type === "array" && schema.properties[key].items && schema.properties[key].items.type === "string"'>
                        <div class='row round px-2 py-2'>
                            <div class='d-flex'>
                                <label
                                    class='form-label'
                                    v-text='key'
                                />
                                <div class='ms-auto'>
                                    <IconPlus
                                        v-if='!disabled'
                                        stroke='1'
                                        :size='32'
                                        class='cursor-pointer'
                                        @click='meta[key].push("")'
                                    />
                                </div>
                            </div>

                            <div
                                v-for='(arr, i) of meta[key]'
                                :key='i'
                                class='my-1 d-flex align-items-center'
                            >
                                <TablerInput
                                    v-model='meta[key][i]'
                                    class='flex-grow-1'
                                    :disabled='disabled'
                                />
                                <IconTrash
                                    v-if='!disabled'
                                    stroke='1'
                                    :size='24'
                                    class='cursor-pointer ms-2'
                                    @click='meta[key].splice(i, 1)'
                                />
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div class='row'>
                            <TablerInput
                                v-model='meta[key]'
                                :label='key'
                                :rows='3'
                                :disabled='disabled'
                            />
                        </div>
                    </template>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import {
    TablerEnum,
    TablerToggle,
    TablerInput,
} from '@tak-ps/vue-tabler';
import {
    IconPlus,
    IconTrash
} from '@tabler/icons-vue'

const props = defineProps({
    modelValue: {
        type: Object,
        required: true
    },
    schema: {
        type: Object,
        required: true
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue']);

const meta = ref(props.modelValue);

// The parent may swap in a fresh object (e.g. when the equipment type
// changes); pick it up rather than keep editing the stale one
watch(() => props.modelValue, (value) => {
    if (value !== meta.value) {
        meta.value = value;
        format();
    }
});

watch(() => props.schema, () => {
    format();
}, { deep: true });

watch(meta, () => {
    emit('update:modelValue', meta.value);
}, { deep: true });

const setNumber = (key, raw, integer) => {
    if (raw === '' || raw === null || raw === undefined) {
        meta.value[key] = null;
        return;
    }

    const num = integer ? parseInt(raw) : Number(raw);
    meta.value[key] = Number.isNaN(num) ? null : num;
};

// Seed missing keys with sensible defaults so inputs bind to a real value
const format = () => {
    if (!props.schema || props.schema.type !== 'object' || !props.schema.properties) return;

    for (const key in props.schema.properties) {
        const prop = props.schema.properties[key];
        const missing = meta.value[key] === undefined || meta.value[key] === null;

        if (prop.type === 'array') {
            if (!Array.isArray(meta.value[key])) meta.value[key] = [];
        } else if (prop.type === 'boolean') {
            if (typeof meta.value[key] !== 'boolean') meta.value[key] = prop.default || false;
        } else if (missing && prop.default !== undefined) {
            meta.value[key] = prop.default;
        } else if (missing && prop.enum && prop.enum.length && !props.disabled) {
            meta.value[key] = String(prop.enum[0]);
        }
    }
};

onMounted(async () => {
    format();
});
</script>
