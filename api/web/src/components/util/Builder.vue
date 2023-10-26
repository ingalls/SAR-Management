<template>
<div class='card'>
    <div class="card-header">
        <h3 class="card-title" v-text='title'></h3>

        <div class='ms-auto btn-list'>
            <EyeIcon v-if='!preview' @click='preview = true' class='cursor-pointer'/>
            <EyeOffIcon v-else @click='preview = false' class='cursor-pointer'/>
            <div v-if='!preview' class="dropdown">
                <div class="dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                    <PlusIcon class='cursor-pointer'/>
                </div>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                    <div class='m-1 text-center'>
                        <div @click='schema.push({
                            "name": "",
                            "type": "string",
                            "required": false,
                        })' class='opt cursor-pointer py-1'>String</div>
                        <div @click='schema.push({
                            "name": "",
                            "type": "string",
                            "enum": [],
                            "required": false,
                        })' class='opt cursor-pointer py-1'>Enum</div>
                        <div @click='schema.push({
                            "name": "",
                            "type": "boolean",
                            "required": false,
                        })' class='opt cursor-pointer py-1'>Boolean</div>
                        <div @click='schema.push({
                            "name": "",
                            "type": "number",
                            "required": false,
                        })' class='opt cursor-pointer py-1'>Number</div>
                        <div @click='schema.push({
                            "name": "",
                            "type": "integer",
                            "required": false,
                        })' class='opt cursor-pointer py-1'>Integer</div>
                    </div>
                </ul>
            </div>
        </div>
    </div>
    <div class="card-body">
        <template v-if='!preview'>
            <template v-if='!schema.length'>
                <TablerNone label='Properties' :create='false' :compact='true'/>
            </template>
            <template v-else>
                <div class='row g-2'>
                    <TablerSchema :schema='computedSchema' v-model='previewModel'/>
                </div>
            </template>
        </template>
        <template v-else>
        </template>
    </div>
</div>

</template>

<script>
import {
    PlusIcon,
    TrashIcon,
    EyeIcon,
    EyeOffIcon,
} from 'vue-tabler-icons';
import {
    TablerNone,
} from '@tak-ps/vue-tabler';

export default {
    name: 'builder',
    props: {
        title: {
            type: String,
            default: 'JSON Schema Builder'
        },
        modelValue: {
            type: Object,
            required: true
        }
    },
    computed: {
        computedSchema: function() {
            const res = {
                type: 'object',
                required: [],
                additionalProperties: false,
                properties: {}
            }

            for (const prop of JSON.parse(JSON.stringify(this.schema))) {
                const name = prop.name;
                delete prop.name;

                if (prop.required) res.required.push(name);
                res.properties[name] = prop;
            }

            return res;
        }
    },
    data: function() {
        return {
            preview: false,
            previewModel: {},
            schema: [],
            display: {

            }
        }
    },
    mounted: function() {
        for (const prop in this.modelValue.properties) {
            this.schema.push({
                name: prop,
                ...this.modelValue.properties[prop]
            });
        }
    },
    components: {
        PlusIcon,
        EyeIcon,
        EyeOffIcon,
        TrashIcon,
        TablerNone,
    }
}
</script>

<style>
.opt:hover {
  font-weight: 900;
}
</style>
