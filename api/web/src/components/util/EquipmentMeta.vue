<template>
<div v-if='schema.properties && Object.keys(schema.properties).length !== 0' class='col-md-12 my-3'>
    <div class='card-header'>
        <span class='card-title'>Equipment Metadata</span>
    </div>

    <div class="col">
        <template v-if='schema.type !== "object"'>
            <div class="d-flex justify-content-center my-4">
                Only Object Schemas are Supported.
            </div>
        </template>
        <template v-else>
            <div :key='key' v-for='key in Object.keys(schema.properties)' class='py-2 px-3 floating-input'>
                <template v-if='schema.properties[key].enum'>
                    <div class='row round px-2 py-2'>
                        SELECT
                    </div>
                </template>
                <template v-else-if='schema.properties[key].type === "string"'>
                    <div class='row round px-2 py-2'>
                        <TablerInput :label='key' :disabled='disabled' v-model='meta[key]'/>
                    </div>
                </template>
                <template v-else-if='schema.properties[key].type === "boolean"'>
                    <div class='row round px-2 py-2'>
                        <TablerToggle v-model='meta[key]' :label='key' :disabled='disabled'/>
                    </div>
                </template>
                <template v-else-if='schema.properties[key].type === "array" && schema.properties[key].items.type === "string"'>
                    <div class='row round px-2 py-2'>
                        <div class='d-flex'>
                            <label class='form-label' v-text='key'/>
                            <div class='ms-auto'>
                                <PlusIcon v-if='!disabled' @click='meta[key].push("")' class='cursor-pointer'/>
                            </div>
                        </div>

                        <div :key='i' v-for='(arr, i) of meta[key]' class='my-1'>
                            <TablerInput :disabled='disabled' v-model='meta[key][i]'/>
                        </div>
                    </div>
                </template>
                <template v-else>
                    <div class='row'>
                        <TablerInput :label='key' :rows='3' :disabled='disabled' v-model='meta[key]'/>
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
    PlusIcon
} from 'vue-tabler-icons'

export default {
    name: 'EquipmentMetadata',
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
    },
    components: {
        PlusIcon,
        TablerToggle,
        TablerInput,
    }
}
</script>
