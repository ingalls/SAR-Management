<template>
    <div @paste.capture='handlePaste'>
        <MdEditor
            ref='editorRef'
            :model-value='modelValue'
            :preview='false'
            no-upload-img
            no-mermaid
            :no-katex='true'
            :toolbars-exclude='["save", "prettier", "mermaid"]'
            language='en-US'
            @update:model-value='$emit("update:modelValue", $event)'
        />
    </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue';
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

defineProps<{ modelValue: string }>();
defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const editorRef = ref<InstanceType<typeof MdEditor> | null>(null);

function handlePaste(e: ClipboardEvent): void {
    const pastedText = e.clipboardData?.getData('text/plain');
    const hasFiles = (e.clipboardData?.files?.length ?? 0) > 0;

    if (pastedText && hasFiles) {
        e.stopPropagation();
        e.preventDefault();

        editorRef.value?.insert(() => {
            return {
                targetValue: pastedText,
                select: false,
                deviationStart: 0,
                deviationEnd: 0
            };
        });
    }
}
</script>
