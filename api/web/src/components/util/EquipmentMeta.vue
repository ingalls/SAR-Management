<template>
<div class='col-md-12 my-3'>
    <div class='d-flex'>
        <h3>Equipment Metadata</h3>
    </div>

    <div class="col">
        <template v-if='schema.type !== "object"'>
            <div class="d-flex justify-content-center my-4">
                Only Object Schemas are Supported.
            </div>
        </template>
        <template v-else>
            <div :key='key' v-for='key in Object.keys(schema.properties)' class='py-2 floating-input'>
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
    TablerInput,
} from '@tak-ps/vue-tabler';

export default {
    name: 'LayerEnvironment',
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
            meta: {},
            mode: null,
        };
    },
    watch: {
        meta: {
            deep: true,
            handler: function() {
                this.$emit('update:modelValue', this.meta);
            }
        },
    },
    mounted: async function() {
        this.meta = this.modelValue;

        if (this.schema.type === 'object' && this.schema.properties) {
            for (const key in this.schema.properties) {
                if (!this.meta[key] && this.schema.properties[key].type === 'array') {
                    this.meta[key] = [];
                }
            }
        }
    },
    components: {
        TablerInput,
    }
}
</script>
