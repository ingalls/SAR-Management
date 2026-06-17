<template>
    <div class='export-container'>
        <div class='d-flex gap-2 align-items-center'>
            <label
                v-if='showLabel'
                class='form-label mb-0'
            >
                Export:
            </label>
            <TablerDropdown :width='280'>
                <button
                    type='button'
                    class='btn btn-outline-secondary d-flex align-items-center gap-1'
                    :title='title'
                >
                    <IconDownload
                        :size='20'
                        stroke='1'
                    />
                    <span v-if='showButtonText'>Export</span>
                </button>
                <template #dropdown>
                    <div class='p-3 d-flex flex-column gap-2'>
                        <div class='text-uppercase text-secondary small fw-bold mb-1'>
                            Export Options
                        </div>
                        <button
                            v-for='option in exportOptions'
                            :key='option.format'
                            type='button'
                            class='btn btn-outline-primary text-start d-flex align-items-center gap-2'
                            @click='handleExport(option.format)'
                        >
                            <IconFileTypeCsv
                                v-if='option.format === "csv"'
                                :size='20'
                                stroke='1'
                            />
                            <IconFileTypeXls
                                v-else-if='option.format === "excel"'
                                :size='20'
                                stroke='1'
                            />
                            <IconFileTypePdf
                                v-else-if='option.format === "pdf"'
                                :size='20'
                                stroke='1'
                            />
                            <IconFileTypeDoc
                                v-else-if='option.format === "vcard"'
                                :size='20'
                                stroke='1'
                            />
                            <IconCalendarEvent
                                v-else-if='option.format === "ical"'
                                :size='20'
                                stroke='1'
                            />
                            <IconFileExport
                                v-else
                                :size='20'
                                stroke='1'
                            />
                            <span v-text='option.label' />
                        </button>
                    </div>
                </template>
            </TablerDropdown>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import {
    TablerDropdown
} from '@tak-ps/vue-tabler';
import {
    IconDownload,
    IconFileTypeCsv,
    IconFileTypeXls,
    IconFileTypePdf,
    IconFileTypeDoc,
    IconCalendarEvent,
    IconFileExport
} from '@tabler/icons-vue';

const props = defineProps({
    formats: {
        type: Array,
        default: () => ['csv'],
        description: 'Array of export formats: csv, excel, pdf, vcard, ical, json'
    },
    showLabel: {
        type: Boolean,
        default: false
    },
    showButtonText: {
        type: Boolean,
        default: true
    },
    title: {
        type: String,
        default: 'Export data'
    }
});

const emit = defineEmits(['export']);

const formatLabels = {
    csv: 'CSV (Comma-separated values)',
    excel: 'Excel Spreadsheet',
    pdf: 'PDF Document',
    vcard: 'vCard Contact File',
    ical: 'iCalendar Event',
    json: 'JSON Data'
};

const exportOptions = computed(() => {
    return props.formats.map(format => ({
        format,
        label: formatLabels[format] || format.toUpperCase()
    }));
});

const handleExport = (format) => {
    emit('export', format);
};
</script>

<style scoped>
.export-container {
    display: inline-block;
}

.small {
    font-size: 0.75rem;
}
</style>
