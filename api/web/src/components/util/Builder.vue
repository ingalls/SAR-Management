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
            <div class='col-12 row border rounded my-2 py-2 px-2' :key='prop_it' v-for='(prop, prop_it) in schema'>
                <div class='col-12 d-flex'>
                    <template v-if='prop.type === "string"'>
                        <AlphabetLatinIcon/>
                    </template>
                    <template v-else-if='prop.type === "number"'>
                        <DecimalIcon/>
                    </template>
                    <template v-else-if='prop.type === "integer"'>
                        <Sort09Icon/>
                    </template>
                    <template v-else>
                        <BinaryIcon/>
                    </template>

                    <span v-text='prop.type' class='my-1 mx-2 strong'/>

                    <div class='ms-auto btn-list'>
                        <TrashIcon @click='schema.splice(prop_it, 1)' class='cursor-pointer'/>
                    </div>
                </div>
                <div class='col-12 row d-flex'>
                    <TablerInput label='Field Name' v-model='prop.name' class='col-12 py-1'/>
                    <TablerToggle label='Required' v-model='prop.required' class='col-12 py-1'/>
                    <TablerInput :rows='3' label='Description' v-model='prop.description' class='col-12 py-1'/>
                    <template v-if='prop.type === "string" && prop.enum === undefined'>
                    </template>
                    <template v-else-if='prop.type === "string" && Array.isArray(prop.enum)'>
                    </template>
                    <template v-else-if='prop.type === "number"'>
                    </template>
                    <template v-else-if='prop.type === "integer"'>
                    </template>
                </div>
            </div>
        </template>
        <template v-else>
            <TablerSchema :schema='computedSchema' v-model='previewModel'/>
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
    AlphabetLatinIcon,
    DecimalIcon,
    Sort09Icon,
    BinaryIcon,
} from 'vue-tabler-icons';
import {
    TablerInput,
    TablerSchema,
    TablerToggle,
} from '@tak-ps/vue-tabler';

export default {
    name: 'builder',
    props: {
        title: {
            type: String,
            default: 'JSON Schema Builder'
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
                const required = prop.required;
                delete prop.required;

                if (required) res.required.push(prop.name);
                res.properties[prop.name] = prop;
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
    components: {
        PlusIcon,
        EyeIcon,
        EyeOffIcon,
        TrashIcon,
        AlphabetLatinIcon,
        DecimalIcon,
        Sort09Icon,
        BinaryIcon,
        TablerInput,
        TablerToggle,
        TablerSchema
    }
}
</script>

<style>
.opt:hover {
  font-weight: 900;
}
</style>
