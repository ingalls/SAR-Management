<template>
    <div class='card'>
        <div class='card-header'>
            <h3
                class='card-title'
                v-text='title'
            />

            <div class='ms-auto btn-list'>
                <div class='dropdown'>
                    <div
                        id='dropdownMenuButton1'
                        class='dropdown-toggle'
                        type='button'
                        data-bs-toggle='dropdown'
                        aria-expanded='false'
                    >
                        <PlusIcon class='cursor-pointer' />
                    </div>
                    <ul
                        class='dropdown-menu'
                        aria-labelledby='dropdownMenuButton1'
                    >
                        <div class='m-1 text-center'>
                            <div
                                class='opt cursor-pointer py-1'
                                @click='modal = {
                                    "name": "",
                                    "type": "string",
                                    "required": false,
                                }'
                            >
                                String
                            </div>
                            <div
                                class='opt cursor-pointer py-1'
                                @click='modal = {
                                    "name": "",
                                    "type": "string",
                                    "enum": [],
                                    "required": false,
                                }'
                            >
                                Enum
                            </div>
                            <div
                                class='opt cursor-pointer py-1'
                                @click='modal = {
                                    "name": "",
                                    "type": "boolean",
                                    "required": false,
                                }'
                            >
                                Boolean
                            </div>
                            <div
                                class='opt cursor-pointer py-1'
                                @click='modal = {
                                    "name": "",
                                    "type": "number",
                                    "required": false,
                                }'
                            >
                                Number
                            </div>
                            <div
                                class='opt cursor-pointer py-1'
                                @click='modal = {
                                    "name": "",
                                    "type": "integer",
                                    "required": false,
                                }'
                            >
                                Integer
                            </div>
                        </div>
                    </ul>
                </div>
            </div>
        </div>
        <div class='card-body'>
            <TablerNone
                v-if='!schema.length'
                label='Properties'
                :create='false'
                :compact='true'
            />
            <template v-else>
                <div class='row g-2'>
                    <TablerSchema
                        v-model='input'
                        :schema='computedSchema'
                        :disabled='true'
                    />
                </div>
                <div class='row'>
                    <div class='d-flex'>
                        <div class='ms-auto'>
                            <button
                                class='btn btn-primary'
                                @click='$emit("update:modelValue", computedSchema)'
                            >
                                Update Application
                            </button>
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <BuilderEdit
            v-if='modal'
            :prop='modal'
            @close='modal = null'
            @done='push($event)'
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
    components: {
        PlusIcon,
        TrashIcon,
        TablerNone,
        TablerSchema,
        BuilderEdit,
    },
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
            loading: true,
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
                delete prop.required;
                res.properties[name] = prop;
            }

            return res;
        }
    },
    mounted: function() {
        for (const prop in this.modelValue.properties) {
            this.schema.push({
                name: prop,
                required: (this.modelValue.required || []).includes(prop),
                ...this.modelValue.properties[prop]
            });
        }
    },
    methods: {
        push: function(prop) {
            this.schema.push(prop);
            this.modal = null;
        }
    }
}
</script>

<style>
.opt:hover {
  font-weight: 900;
}
</style>
