<template>
    <Modal>
        <button type="button" class="btn-close" @click='close' aria-label="Close"></button>
            <div class="modal-status bg-yellow"></div>
            <div class="modal-body text-center py-4">
                UPLOAD
            </div>
            <div class="modal-footer">
                <div class="w-100">
                    <div class="row">
                        <div class="col"><a @click='close' class="cursor-pointer btn w-100">OK</a></div>
                    </div>
                </div>
          </div>
    </Modal>
</template>

<script>
import { Modal } from '@tak-ps/vue-tabler';

console.error('MODAL', Modal);

export default {
    name: 'Err',
    props: ['err'],
    methods: {
        close: function() {
            this.$emit('close');
        }
    },
    components: {
        Modal,
    }
}
</script>
