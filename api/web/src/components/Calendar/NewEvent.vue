<template>
    <TablerModal
        size='lg'
    >
        <button
            type='button'
            class='btn-close'
            aria-label='Close'
            @click='emit("close")'
        />
        <div class='modal-status bg-yellow' />
        <div class='modal-header'>
            <div class='modal-title'>
                Create New Event
            </div>
        </div>
        <div class='modal-body'>
            <div class='row g-2'>
                <div class='col-12 d-flex align-items-center justify-content-center'>
                    <div
                        class='btn-group'
                        role='group'
                    >
                        <input
                            type='radio'
                            class='btn-check'
                            name='btn-radio-toolbar'
                            :checked='params.type === "mission"'
                            value='list'
                        >
                        <label
                            class='btn btn-icon px-2'
                            @click='params.type = "mission"'
                        >
                            <IconAmbulance
                                size='32'
                                stroke='1'
                            />
                            <span class='ms-2'>New Mission</span>
                        </label>

                        <input
                            type='radio'
                            class='btn-check'
                            name='btn-radio-toolbar'
                            :checked='params.type === "training"'
                            value='gallery'
                        >
                        <label
                            class='btn btn-icon px-2'
                            @click='params.type = "training"'
                        >
                            <IconTruck
                                size='32'
                                stroke='1'
                            />
                            <span class='ms-2'>New Training</span>
                        </label>
                    </div>
                </div>
                <div class='col-12'>
                    <TablerInput
                        label='Title'
                        v-model='params.title'
                        :required='true'
                    />
                </div>
                <div class='col-12 col-md-6'>
                    <TablerInput
                        label='Event Start'
                        type='datetime-local'
                        v-model='params.start'
                        :required='true'
                    />
                </div>
                <div class='col-12 col-md-6'>
                    <TablerInput
                        label='Event End'
                        type='datetime-local'
                        v-model='params.end'
                        :required='true'
                    />
                </div>
                <div class='col-12 d-flex'>
                    <div class='ms-auto'>
                        <button
                            class='btn btn-primary'
                            @click='newEvent'
                        >
                            New Event
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </TablerModal>
</template>

<script setup>
import { ref } from 'vue';
import {
    IconTruck,
    IconAmbulance
} from '@tabler/icons-vue';

import {
    TablerModal,
    TablerInput,
} from '@tak-ps/vue-tabler'

const emit = defineEmits(['close'])

const props = defineProps({
    start: {
        type: String,
        required: true
    },
    end: {
        type: String,
        required: true
    }
})

const params = ref({
    type: 'training',
    title: '',
    start: (new Date(props.start)).toISOString().replace(/:\d+\.\d+[A-Z]/, ''),
    end: (new Date(props.end)).toISOString().replace(/:\d+\.\d+[A-Z]/, '')
})

function newEvent() {
    window.open(`/${params.value.type}/new?start=${params.value.start}&end=${params.value.end}&title=${encodeURIComponent(params.value.title)}`, "_blank")
    emit('close')
}
</script>
