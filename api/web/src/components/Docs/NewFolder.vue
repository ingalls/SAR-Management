<template>
    <TablerModal>
        <button
            type='button'
            class='btn-close'
            aria-label='Close'
            @click='close'
        />
        <div class='modal-status bg-yellow' />
        <div class='modal-header'>
            <div class='modal-title'>
                Create Folder
            </div>
        </div>
        <div class='modal-body'>
            <div class='col-12'>
                <TablerInput
                    v-model='name'
                    label='Folder Name'
                    class='w-full'
                    @keyup.enter='createFolder'
                />
            </div>
            <div class='col-12 d-flex'>
                <button
                    class='btn btn-primary mt-2 ms-auto'
                    @click='createFolder'
                >
                    Create Folder
                </button>
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
    components: {
        TablerInput,
        TablerModal
    },
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
    }
}
</script>
