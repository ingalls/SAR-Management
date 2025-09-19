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
                        <IconPlus
                            :size='32'
                            stroke='1'
                            class='cursor-pointer'
                        />
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

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
    IconPlus,
} from '@tabler/icons-vue'
import BuilderEdit from './BuilderEdit.vue'
import {
    TablerNone,
    TablerSchema
} from '@tak-ps/vue-tabler'

const props = defineProps({
    title: {
        type: String,
        default: 'JSON Schema Builder'
    },
    modelValue: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['update:modelValue'])

const modal = ref(null)
const loading = ref(true)
const input = reactive({})
const schema = reactive([])

const computedSchema = computed(() => {
    const res = {
        type: 'object',
        required: [],
        additionalProperties: false,
        properties: {}
    }

    for (const prop of JSON.parse(JSON.stringify(schema))) {
        const name = prop.name
        delete prop.name

        if (prop.required) res.required.push(name)
        delete prop.required
        res.properties[name] = prop
    }

    return res
})

const push = (prop) => {
    schema.push(prop)
    modal.value = null
}

onMounted(() => {
    for (const prop in props.modelValue.properties) {
        schema.push({
            name: prop,
            required: (props.modelValue.required || []).includes(prop),
            ...props.modelValue.properties[prop]
        })
    }
})
</script>

<style>
.opt:hover {
  font-weight: 900;
}
</style>
