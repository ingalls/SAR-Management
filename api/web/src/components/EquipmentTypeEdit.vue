<template>
    <div>
        <div class='page-wrapper'>
            <div class='page-header d-print-none'>
                <div class='container-xl'>
                    <div class='row g-2 align-items-center'>
                        <div class='col d-flex'>
                            <TablerBreadCrumb />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class='page-body'>
            <div class='container-xl'>
                <div class='row row-deck row-cards'>
                    <div class='col-lg-12'>
                        <NoAccess
                            v-if='!is_iam("Equipment:Admin")'
                            title='Equipment Type Editing'
                        />
                        <div
                            v-else
                            class='card'
                        >
                            <TablerLoading v-if='loading.type' />
                            <div
                                v-else
                                class='card-body'
                            >
                                <div class='row row-cards'>
                                    <div class='col-md-12'>
                                        <TablerInput
                                            v-model='type.type'
                                            label='Equipment Type'
                                            :error='errors.type'
                                        />
                                    </div>

                                    <div class='col-md-12'>
                                        <div class='d-flex align-items-center mb-2'>
                                            <label class='form-label mb-0'>Equipment Schema</label>
                                            <div class='ms-auto'>
                                                <TablerIconButton
                                                    v-if='mode === "builder"'
                                                    title='Edit Raw JSON Schema'
                                                    @click='setMode("json")'
                                                >
                                                    <IconCode
                                                        :size='24'
                                                        stroke='1'
                                                    />
                                                </TablerIconButton>
                                                <TablerIconButton
                                                    v-else
                                                    title='Use Schema Builder'
                                                    @click='setMode("builder")'
                                                >
                                                    <IconForms
                                                        :size='24'
                                                        stroke='1'
                                                    />
                                                </TablerIconButton>
                                            </div>
                                        </div>

                                        <TablerSchemaBuilder
                                            v-if='mode === "builder"'
                                            :key='builderKey'
                                            v-model='builder'
                                            title='Equipment Properties'
                                        />
                                        <TablerInput
                                            v-else
                                            v-model='json'
                                            :rows='14'
                                            :error='errors.schema'
                                            description='Advanced: edit the JSON Schema directly. Switch back to the builder to see the result.'
                                        />
                                        <div
                                            v-if='mode === "builder" && errors.schema'
                                            class='text-danger small mt-2'
                                            v-text='errors.schema'
                                        />
                                    </div>

                                    <div class='col-md-12'>
                                        <div class='d-flex'>
                                            <div class='ms-auto'>
                                                <a
                                                    class='cursor-pointer btn btn-primary'
                                                    @click='save'
                                                >
                                                    <span v-text='$route.params.typeid ? "Update Type" : "Create Type"' />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
    TablerBreadCrumb,
    TablerLoading,
    TablerInput,
    TablerIconButton,
    TablerSchemaBuilder
} from '@tak-ps/vue-tabler'
import {
    IconCode,
    IconForms
} from '@tabler/icons-vue';
import NoAccess from './util/NoAccess.vue';
import iamHelper from '../iam.js';

const route = useRoute();
const router = useRouter();

const props = defineProps({
    iam: {
        type: Object,
        required: true
    },
    auth: {
        type: Object,
        required: true
    }
})

const loading = reactive({
    type: false,
})

const errors = reactive({
    type: '',
    schema: ''
})

const type = reactive({
    type: '',
    // The schema exactly as stored on the server - top level keys the builder
    // does not manage (title, description, additionalProperties, ...) are
    // carried through from here on save so existing schemas are never
    // silently reshaped
    schema: {
        type: 'object',
        properties: {}
    }
})

// 'builder' for the visual TablerSchemaBuilder, 'json' for the raw editor
// that pre-dates it - kept so schemas with constructs the builder can't
// express (nested objects, arrays, formats) remain fully editable
const mode = ref('builder');
const builder = ref(toBuilder(type.schema));
const json = ref('');

// TablerSchemaBuilder only reads its model when mounted, so it is re-keyed
// whenever the schema is replaced from outside (fetch or the JSON editor)
const builderKey = ref(0);

// JSON Schema type names are case sensitive - older Equipment Types were
// saved with capitalised names (ie "String") which the form renderer skips
const KNOWN_TYPES = ['string', 'number', 'integer', 'boolean', 'array', 'object'];

function is_iam(permission) {
    return iamHelper(props.iam, props.auth, permission)
}

/**
 * Coerce whatever is stored into the shape TablerSchemaBuilder expects
 * without dropping any keys it doesn't know about
 */
function toBuilder(schema) {
    const src = (schema && typeof schema === 'object' && !Array.isArray(schema)) ? schema : {};
    const properties = {};

    for (const [name, prop] of Object.entries(src.properties || {})) {
        const copy = (prop && typeof prop === 'object') ? { ...prop } : { type: 'string' };

        if (typeof copy.type === 'string') {
            const lower = copy.type.toLowerCase();
            if (KNOWN_TYPES.includes(lower)) copy.type = lower;
        }

        properties[name] = copy;
    }

    return {
        ...src,
        type: 'object',
        properties,
        required: Array.isArray(src.required) ? src.required : []
    };
}

/**
 * Merge the builder output back over the stored schema so the result is a
 * superset of what was there before: only `properties` and `required` are
 * taken from the builder and keys like `additionalProperties` are only
 * present if the original schema (or an explicit JSON edit) set them
 */
function fromBuilder(original, built) {
    const out = {
        ...(original && typeof original === 'object' ? original : {}),
        type: 'object',
        properties: built.properties || {}
    };

    const required = built.required || [];
    if (required.length || Object.prototype.hasOwnProperty.call(out, 'required')) {
        out.required = required;
    }

    return out;
}

/**
 * Current schema as it would be saved, regardless of editing mode.
 * Returns undefined (and sets errors.schema) if the JSON editor holds
 * invalid JSON
 */
function currentSchema() {
    if (mode.value === 'json') {
        try {
            const parsed = JSON.parse(json.value);
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                errors.schema = 'Schema must be a JSON object';
                return undefined;
            }
            errors.schema = '';
            return parsed;
        } catch (err) {
            errors.schema = `Invalid JSON: ${err.message}`;
            return undefined;
        }
    }

    errors.schema = '';
    return fromBuilder(type.schema, builder.value);
}

function setMode(next) {
    if (next === mode.value) return;

    if (next === 'json') {
        json.value = JSON.stringify(fromBuilder(type.schema, builder.value), null, 4);
        mode.value = 'json';
    } else {
        const parsed = currentSchema();
        if (parsed === undefined) return;

        type.schema = parsed;
        builder.value = toBuilder(parsed);
        builderKey.value++;
        mode.value = 'builder';
    }
}

async function fetch() {
    loading.type = true;
    const result = await window.std(`/api/equipment-type/${route.params.typeid}`);

    type.type = result.type;
    type.schema = (result.schema && typeof result.schema === 'object') ? result.schema : { type: 'object', properties: {} };
    builder.value = toBuilder(type.schema);
    builderKey.value++;

    loading.type = false;
}

async function save() {
    errors.type = type.type ? '' : 'Cannot be empty';

    const schema = currentSchema();

    if (errors.type || errors.schema) return;

    loading.type = true;

    try {
        if (route.params.typeid) {
            await window.std(`/api/equipment-type/${route.params.typeid}`, {
                method: 'PATCH',
                body: {
                    type: type.type,
                    schema
                }
            })

            router.push(`/equipment/type/${route.params.typeid}`);
        } else {
            const result = await window.std('/api/equipment-type', {
                method: 'POST',
                body: {
                    type: type.type,
                    schema
                }
            })

            router.push(`/equipment/type/${result.id}`);
        }
    } finally {
        loading.type = false;
    }
}

onMounted(async () => {
    if (is_iam("Equipment:Manage") && route.params.typeid) {
        await fetch();
    }
})

defineExpose({
    save
})
</script>
