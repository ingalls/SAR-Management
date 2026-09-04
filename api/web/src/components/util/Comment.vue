<template>
    <div class='card'>
        <div class='card-header py-2'>
            <div class='d-flex align-items-center w-100'>
                <Avatar
                    :user='comment.user'
                    :link='true'
                />
                <span
                    class='text-muted small ms-2'
                    v-text='`commented ${fromNow}`'
                />
                <span
                    v-if='edited'
                    v-tooltip='`Edited ${moment(comment.updated).fromNow()}`'
                    class='badge bg-secondary-lt ms-2'
                >
                    edited
                </span>

                <div
                    v-if='canEdit && !edit'
                    class='ms-auto d-flex align-items-center gap-1'
                >
                    <TablerIconButton
                        title='Edit Comment'
                        @click='startEdit'
                    >
                        <IconPencil
                            :size='20'
                            stroke='1'
                        />
                    </TablerIconButton>
                    <TablerDelete
                        displaytype='icon'
                        :size='20'
                        @delete='$emit("delete", comment)'
                    />
                </div>
            </div>
        </div>

        <TablerLoading v-if='loading' />
        <template v-else-if='edit'>
            <div class='card-body pb-0'>
                <MDEditorShim v-model='body' />
            </div>
            <div class='card-footer d-flex gap-2'>
                <div class='ms-auto d-flex gap-2'>
                    <button
                        class='btn btn-link link-secondary'
                        @click='edit = false'
                    >
                        Cancel
                    </button>
                    <button
                        class='btn btn-primary'
                        :disabled='!body.trim()'
                        @click='updateComment'
                    >
                        Save Comment
                    </button>
                </div>
            </div>
        </template>
        <template v-else>
            <div
                class='card-body overflow-hidden'
                style='word-break: break-word;'
            >
                <TablerMarkdown :markdown='comment.body' />
            </div>
        </template>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
    TablerMarkdown,
    TablerLoading,
    TablerIconButton,
    TablerDelete
} from '@tak-ps/vue-tabler'
import { IconPencil } from '@tabler/icons-vue';
import Avatar from './Avatar.vue';
import moment from 'moment';
import MDEditorShim from './MDEditorShim.vue';

const props = defineProps({
    canEdit: {
        type: Boolean,
        default: false
    },
    comment: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['delete', 'update']);

const loading = ref(false);
const edit = ref(false);
const body = ref(props.comment.body);

const fromNow = computed(() => moment(props.comment.created).fromNow());

// Comments are stamped with created === updated on insert
const edited = computed(() => {
    return props.comment.updated && moment(props.comment.updated).diff(moment(props.comment.created), 'seconds') > 5;
});

function startEdit() {
    body.value = props.comment.body;
    edit.value = true;
}

function updateComment() {
    loading.value = true;
    const c = JSON.parse(JSON.stringify(props.comment));
    c.body = body.value;
    emit('update', c);
}
</script>
