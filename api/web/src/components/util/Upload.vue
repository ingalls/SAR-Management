<template>
    <TablerModal>
        <button
            type='button'
            class='btn-close'
            aria-label='Close'
            @click='close'
        />
        <div class='modal-status bg-yellow' />
        <div class='modal-body text-center py-4'>
            <UploadDefault
                :url='url'
                :headers='headers'
                :cancel='false'
                @done='$emit("done", $event)'
                @cancel='$emit("cancel")'
            />
        </div>
    </TablerModal>
</template>

<script setup>
import { TablerModal } from '@tak-ps/vue-tabler'
import UploadDefault from './UploadDefault.vue'

defineProps({
    url: {
        type: [String, URL],
        default: '/api/asset'
    },
    headers: {
        type: Object,
        default: () => ({})
    },
    prefix: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['done', 'cancel', 'close'])

const close = () => {
    emit('close')
}
</script>
