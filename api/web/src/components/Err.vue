<template>
    <Modal>
        <div class='col col--12 flex flex--center-main'>
            <div class='pt12'>
                <svg class='icon h60 w60 color-gray'><use href='#icon-alert' /></svg>
            </div>
        </div>

        <div class='col col--12 txt-l mb12 align-center'>
            Uh Oh!
        </div>
        <div
            class='col col--12 txt-m align-center my12'
            v-text='err.message'
        />

        <div
            v-if='err.body'
            class='col col--12 pre pb12 h400'
            v-text='err.body'
        />

        <div class='col col--12 mt12'>
            <a
                href='mailto:info@climbseneca.com'
                class='fl btn btn--stroke btn--gray round'
            >Contact Us</a>
            <button
                class='fr btn btn--stroke btn--gray round'
                @click='close'
            >
                Ok
            </button>
        </div>
    </Modal>
</template>

<script setup>
import Modal from './util/Modal.vue';

defineProps(['err'])

const emit = defineEmits(['close'])

const close = () => {
    emit('close');
}
</script>
