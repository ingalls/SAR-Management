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
                    <AlphabetLatinIcon />
                </template>
                <template v-else-if='edit.type === "number"'>
                    <DecimalIcon />
                </template>
                <template v-else-if='edit.type === "integer"'>
                    <Sort09Icon />
                </template>
                <template v-else>
                    <BinaryIcon />
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

<script>
import {
    AlphabetLatinIcon,
    DecimalIcon,
    Sort09Icon,
    BinaryIcon,
} from 'vue-tabler-icons';
import {
    TablerModal,
    TablerInput,
    TablerToggle
} from '@tak-ps/vue-tabler';

export default {
    name: 'BuilderEdit',
    components: {
        AlphabetLatinIcon,
        DecimalIcon,
        Sort09Icon,
        BinaryIcon,
        TablerModal,
        TablerInput,
        TablerToggle
    },
    props: {
        prop: {
            type: Object,
            required: true
        }
    },
    data: function() {
        return {
            edit: JSON.parse(JSON.stringify(this.prop))
        }
    }
}
</script>
