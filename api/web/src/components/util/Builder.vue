<template>
<div class='card'>
    <div class="card-header">
        <h3 class="card-title" v-text='title'></h3>

        <div class='ms-auto btn-list'>
            <div class="dropdown">
                <div class="dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                    <PlusIcon class='cursor-pointer'/>
                </div>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                    <div class='m-1 text-center'>
                        <div @click='modal = {
                            "name": "",
                            "type": "string",
                            "required": false,
                        }' class='opt cursor-pointer py-1'>String</div>
                        <div @click='modal = {
                            "name": "",
                            "type": "string",
                            "enum": [],
                            "required": false,
                        }' class='opt cursor-pointer py-1'>Enum</div>
                        <div @click='modal = {
                            "name": "",
                            "type": "boolean",
                            "required": false,
                        }' class='opt cursor-pointer py-1'>Boolean</div>
                        <div @click='modal = {
                            "name": "",
                            "type": "number",
                            "required": false,
                        }' class='opt cursor-pointer py-1'>Number</div>
                        <div @click='modal = {
                            "name": "",
                            "type": "integer",
                            "required": false,
                        }' class='opt cursor-pointer py-1'>Integer</div>
                    </div>
                </ul>
            </div>
        </div>
    </div>
    <div class="card-body">
        <template v-if='!schema.length'>
            <TablerNone label='Properties' :create='false' :compact='true'/>
        </template>
        <template v-else>
            <div class='row g-2'>
                <TablerSchema :schema='computedSchema' v-model='input' :disabled='true'/>
            </div>
        </template>
    </div>

    <BuilderEdit
        v-if='modal'
        @close='modal = null'
        @done='push($event)'
        :prop='modal'
    />
</div>

</template>

<script>
import {
    PlusIcon,
    TrashIcon,
} from 'vue-tabler-icons';
import BuilderEdit from './BuilderEdit.vue';
import {
    TablerNone,
    TablerSchema
} from '@tak-ps/vue-tabler';

export default {
    name: 'Builder',
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
    data: function() {
        return {
            modal: null,
            input: {},
            schema: [],
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
    mounted: function() {
        for (const prop in this.modelValue.properties) {
            this.schema.push({
                name: prop,
                ...this.modelValue.properties[prop]
            });
        }
    },
    methods: {
        push: function(prop) {
            this.schema.push(prop);
            this.modal = null;
        }
    },
    components: {
        PlusIcon,
        TrashIcon,
        TablerNone,
        TablerSchema,
        BuilderEdit,
    }
}
</script>

<style>
.opt:hover {
  font-weight: 900;
}
</style>
