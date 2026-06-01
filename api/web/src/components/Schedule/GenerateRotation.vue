<template>
    <div>
        <template v-if='showTitle'>
            <h4 class='mb-3'>
                Generate Rotation
            </h4>
            <p class='text-muted'>
                Automatically create shift events by rotating through subteam members.
            </p>
        </template>
        <div class='row g-3'>
            <div class='col-12 col-lg-4'>
                <TablerInput
                    v-model='generate.start_date'
                    type='date'
                    label='Start Date'
                />
            </div>
            <div class='col-12 col-lg-4'>
                <TablerInput
                    v-model='generate.end_date'
                    type='date'
                    label='End Date'
                />
            </div>
            <div class='col-12 col-lg-4 d-flex align-items-lg-end'>
                <div class='w-100 d-grid'>
                    <button
                        class='btn btn-primary w-100'
                        :disabled='generate.loading'
                        @click='generateRotation'
                    >
                        <span
                            v-if='generate.loading'
                            class='spinner-border spinner-border-sm me-1'
                        />
                        Generate
                    </button>
                </div>
            </div>
        </div>
        <div
            v-if='generate.result'
            class='alert mt-3 mb-0'
            :class='generate.error ? "alert-danger" : "alert-success"'
            v-text='generate.result'
        />
    </div>
</template>

<script setup>
import moment from 'moment';
import { reactive } from 'vue';
import {
    TablerInput,
} from '@tak-ps/vue-tabler';

const props = defineProps({
    scheduleId: {
        type: [String, Number],
        required: true
    },
    showTitle: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['generated']);

const generate = reactive({
    start_date: moment().format('YYYY-MM-DD'),
    end_date: moment().add(4, 'weeks').format('YYYY-MM-DD'),
    loading: false,
    result: '',
    error: false
});

async function generateRotation() {
    generate.loading = true;
    generate.result = '';
    generate.error = false;

    try {
        const result = await window.std(`/api/schedule/${props.scheduleId}/generate`, {
            method: 'POST',
            body: {
                start_date: generate.start_date,
                end_date: generate.end_date
            }
        });

        generate.result = result.message;
        emit('generated', result);
    } catch (err) {
        generate.error = true;
        generate.result = err.message || 'Failed to generate rotation';
    }

    generate.loading = false;
}
</script>