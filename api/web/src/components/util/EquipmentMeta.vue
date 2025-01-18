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
                            SELECT
                        </div>
                    </template>
                    <template v-else-if='schema.properties[key].type === "string"'>
                        <div class='row round px-2 py-2'>
                            <TablerInput
                                v-model='meta[key]'
                                :label='key'
                                :disabled='disabled'
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
                    <template v-else-if='schema.properties[key].type === "array" && schema.properties[key].items.type === "string"'>
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
                                class='my-1'
                            >
                                <TablerInput
                                    v-model='meta[key][i]'
                                    :disabled='disabled'
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

<script>
import {
    TablerToggle,
    TablerInput,
} from '@tak-ps/vue-tabler';
import {
    IconPlus
} from '@tabler/icons-vue'

export default {
    name: 'EquipmentMetadata',
    components: {
        IconPlus,
        TablerToggle,
        TablerInput,
    },
    props: {
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
    },
    data: function() {
        return {
            meta: this.modelValue,
        };
    },
    watch: {
        schema: {
            deep: true,
            handler: function() {
                this.format();
            }
        },
        meta: {
            deep: true,
            handler: function() {
                this.$emit('update:modelValue', this.meta);
            }
        },
    },
    mounted: async function() {
        this.format();
    },
    methods: {
        format: function() {
            if (this.schema && this.schema.type === 'object' && this.schema.properties) {
                for (const key in this.schema.properties) {
                    if (!this.meta[key] && this.schema.properties[key].type === 'array') {
                        this.meta[key] = [];
                    }

                    if (!this.meta[key] && this.schema.properties[key].type === 'boolean') {
                        this.meta[key] = this.schema.properties[key].default || false;
                    }
                }
            }
        }
    }
}
</script>
