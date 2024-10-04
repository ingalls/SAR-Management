<template>
    <div class='card'>
        <div class='card-header'>
            <div class='col'>
                <div class='d-flex align-items-center'>
                    <Avatar
                        :user='comment.user'
                        :link='true'
                        color='black'
                    />
                    <span class='mx-2'>-</span>
                    <div v-text='fromNow' />
                    <div class='ms-auto btn-list'>
                        <button
                            v-if='canEdit'
                            data-bs-toggle='dropdown'
                            type='button'
                            class='btn dropdown-toggle dropdown-toggle-split'
                            aria-expanded='false'
                        />
                        <div
                            class='dropdown-menu dropdown-menu-end'
                            style=''
                        >
                            <a
                                class='dropdown-item cursor-pointer hover-light'
                                @click='edit = true'
                            >Edit</a>
                            <a
                                class='dropdown-item cursor-pointer hover-light'
                                @click='$emit("delete", comment)'
                            >Delete</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <TablerLoading v-if='loading' />
        <template v-else-if='edit'>
            <MdEditor
                v-model='comment.body'
                :preview='false'
                no-upload-img
                no-mermaid
                :no-katex='true'
                :toolbars-exclude='[
                    "save",
                    "prettier",
                    "mermaid"
                ]'
                language='en-US'
            />
            <div class='card-footer d-flex'>
                <div class='ms-auto'>
                    <button
                        class='btn btn-primary'
                        @click='updateComment'
                    >
                        Update
                    </button>
                </div>
            </div>
        </template>
        <template v-else>
            <div class='card-body'>
                <TablerMarkdown :markdown='comment.body' />
            </div>
        </template>
    </div>
</template>

<script>
import {
    TablerMarkdown,
    TablerLoading
} from '@tak-ps/vue-tabler'
import Avatar from './Avatar.vue';
import moment from 'moment';
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

moment.updateLocale('en', {
    relativeTime : {
        future: "in %s",
        past:   "%s ago",
        s  : 'a few seconds',
        ss : '%d seconds',
        m:  "a minute",
        mm: "%d minutes",
        h:  "an hour",
        hh: "%d hours",
        d:  "a day",
        dd: "%d days",
        w:  "a week",
        ww: "%d weeks",
        M:  "a month",
        MM: "%d months",
        y:  "a year",
        yy: "%d years"
    }
});

export default {
    name: 'Comment',
    components: {
        Avatar,
        MdEditor,
        TablerMarkdown,
        TablerLoading
    },
    props: {
        canEdit: {
            type: Boolean,
            default: false
        },
        comment: {
            type: Object,
            required: true
        }
    },
    data: function() {
        return {
            loading: false,
            edit: false
        }
    },
    computed: {
        fromNow: function() {
            return moment(this.comment.created).fromNow();
        }
    },
    methods: {
        updateComment: function() {
            this.loading = true;
            this.$emit('update', this.comment);
        }
    }
}
</script>
