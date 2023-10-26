<template>
<TablerModal>
    <button type="button" class="btn-close" @click='close' aria-label="Close"></button>
    <div class="modal-status bg-yellow"></div>
    <div class="modal-body text-center py-4">
        <div class='d-flex my-2'>
            <template v-if='edit.type === "string"'>
                <AlphabetLatinIcon/>
            </template>
            <template v-else-if='edit.type === "number"'>
                <DecimalIcon/>
            </template>
            <template v-else-if='edit.type === "integer"'>
                <Sort09Icon/>
            </template>
            <template v-else>
                <BinaryIcon/>
            </template>
            <span v-text='edit.type' class='my-1 mx-2 strong'/>
        </div>
        <div class='row g-2 d-flex'>
            <TablerInput label='Field Name' v-model='edit.name'/>
            <TablerToggle label='Required' v-model='edit.required'/>
            <TablerInput :rows='3' label='Description' v-model='edit.description'/>

            <template v-if='edit.type === "string" && edit.enum === undefined'>
            </template>
            <template v-else-if='edit.type === "string" && Array.isArray(edit.enum)'>
            </template>
            <template v-else-if='edit.type === "number"'>
            </template>
            <template v-else-if='edit.type === "integer"'>
            </template>
        </div>
    </div>
    <div class='modal-footer'>
        <button @click='$emit("done", edit)' class='btn btn-primary'>Save</button>
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
    },
    components: {
        AlphabetLatinIcon,
        DecimalIcon,
        Sort09Icon,
        BinaryIcon,
        TablerModal,
        TablerInput,
        TablerToggle
    }
}
</script>
