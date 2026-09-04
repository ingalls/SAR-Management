<template>
    <SlideDownHeader
        :model-value='modelValue'
        :label='label'
        @update:model-value='emit("update:modelValue", $event)'
    >
        <template #right>
            <TablerIconButton
                v-if='!edit && modelValue'
                title='Edit'
                @click.stop='emit("update:edit", true)'
            >
                <IconPencil stroke='1' />
            </TablerIconButton>
            <div
                v-else-if='edit && modelValue'
                class='d-flex gap-1'
            >
                <TablerIconButton
                    color='rgba(var(--tblr-primary-rgb), 0.14)'
                    title='Save'
                    @click.stop='emit("save")'
                >
                    <IconDeviceFloppy
                        color='rgb(var(--tblr-primary-rgb))'
                        stroke='1'
                    />
                </TablerIconButton>
                <TablerIconButton
                    title='Cancel'
                    @click.stop='emit("cancel")'
                >
                    <IconX stroke='1' />
                </TablerIconButton>
            </div>
        </template>
        <div class='col-lg-12 py-2 px-2 border rounded'>
            <TablerLoading v-if='loading' />
            <template v-else>
                <TablerAlert
                    v-if='err'
                    :err='err'
                />
                <div class='row'>
                    <div class='col-lg-12'>
                        <slot />
                    </div>
                </div>
            </template>
        </div>
    </SlideDownHeader>
</template>

<script setup>
import SlideDownHeader from '../../util/SlideDownHeader.vue';
import {
    TablerLoading,
    TablerIconButton,
    TablerAlert
} from '@tak-ps/vue-tabler';
import {
    IconPencil,
    IconDeviceFloppy,
    IconX
} from '@tabler/icons-vue';

defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    label: {
        type: String,
        required: true
    },
    edit: {
        type: Boolean,
        default: false
    },
    loading: {
        type: Boolean,
        default: false
    },
    err: {
        type: Error,
        default: null
    }
});

const emit = defineEmits(['update:modelValue', 'update:edit', 'save', 'cancel']);
</script>
