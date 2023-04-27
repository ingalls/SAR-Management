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
    props: {
        prefix: {
            type: String,
            required: true
        }
    },
    data: function() {
        return {
            name: ''
        };
    },
    methods: {
        close: function() {
            this.$emit('close');
        },
        createFolder: async function() {
            if (this.name.includes('.')) throw new Error('Name cannot contain "."');
            if (this.name.includes('/')) throw new Error('Name cannot contain "/"');

            const url = window.stdurl('/api/doc/folder');
            url.searchParams.append('prefix', this.prefix + this.name + '/');

            await window.std(url, {
                method: 'POST'
            });

            this.$emit('done');
        }
    },
    components: {
        TablerInput,
        TablerModal
    }
}
</script>
