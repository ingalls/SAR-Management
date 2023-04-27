<template>
    <TablerModal>
        <button type="button" class="btn-close" @click='close' aria-label="Close"></button>
            <div class="modal-status bg-yellow"></div>
            <div class='modal-header'>
                <div class='modal-title'>Create Folder</div>
            </div>
            <div class="modal-body">
                <div class='col-12'>
                    <TablerInput v-on:keyup.enter='createFolder' label='Folder Name' v-model='name' class='w-full'/>
                </div>
                <div class='col-12 d-flex'>
                    <button @click='createFolder' class='btn btn-primary mt-2 ms-auto'>Create Folder</button>
                </div>
            </div>
    </TablerModal>
</template>

<script>
import {
    TablerInput,
    TablerModal
} from '@tak-ps/vue-tabler';

export default {
    name: 'NewFolder',
    data: function() {
        return {
            name: ''
        };
    },
    methods: {
        close: function() {
            this.$emit('close');
        },
        createFolder: function() {
            this.$emit('done');
        }
    },
    components: {
        TablerInput,
        TablerModal
    }
}
</script>
