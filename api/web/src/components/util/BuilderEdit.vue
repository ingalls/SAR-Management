<template>
    <TablerModal>
        <button
            type='button'
            class='btn-close'
            aria-label='Close'
            @click='$emit("close")'
        />
        <div class='modal-status bg-yellow' />
        <div class='modal-body text-center py-4'>
            <div class='d-flex my-2'>
                <template v-if='edit.type === "string"'>
                    <IconAlphabetLatin
                        :size='32'
                        stroke='1'
                    />
                </template>
                <template v-else-if='edit.type === "number"'>
                    <DecimalIcon
                        :size='32'
                        stroke='1'
                    />
                </template>
                <template v-else-if='edit.type === "integer"'>
                    <Sort09Icon
                        :size='32'
                        stroke='1'
                    />
                </template>
                <template v-else>
                    <BinaryIcon
                        :size='32'
                        stroke='1'
                    />
                </template>
                <span
                    class='my-1 mx-2 strong'
                    v-text='edit.type'
                />
            </div>
            <div class='row g-2 d-flex'>
                <TablerInput
                    v-model='edit.name'
                    label='Field Name'
                />
                <TablerToggle
                    v-model='edit.required'
                    label='Required'
                />
                <TablerInput
                    v-model='edit.description'
                    :rows='3'
                    label='Description'
                />

                <template v-if='edit.type === "string" && edit.enum === undefined' />
                <template v-else-if='edit.type === "string" && Array.isArray(edit.enum)' />
                <template v-else-if='edit.type === "number"' />
                <template v-else-if='edit.type === "integer"' />
            </div>
        </div>
        <div class='modal-footer'>
            <button
                class='btn btn-primary'
                @click='$emit("done", edit)'
            >
                Save
            </button>
        </div>
    </TablerModal>
</template>

<script setup>
import { ref } from 'vue';
import {
    IconAlphabetLatin,
} from '@tabler/icons-vue';
import {
    TablerModal,
    TablerInput,
    TablerToggle
} from '@tak-ps/vue-tabler';

const props = defineProps({
    prop: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['close', 'done']);

const edit = ref(JSON.parse(JSON.stringify(props.prop)));
</script>
