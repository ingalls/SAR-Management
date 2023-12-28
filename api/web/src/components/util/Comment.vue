<template>
<div class="card">
    <div class='card-header'>
        <div class="col">
            <div class="d-flex align-items-center">
                <Avatar :user='comment.user'/>
                <span class='mx-2'>-</span>
                <div v-text='fromNow'></div>
                <div class='ms-auto btn-list'>
                    <button v-if='canEdit' data-bs-toggle="dropdown" type="button" class="btn dropdown-toggle dropdown-toggle-split" aria-expanded="false"></button>
                    <div class="dropdown-menu dropdown-menu-end" style="">
                        <a @click='edit = true' class="dropdown-item cursor-pointer hover-light">Edit</a>
                        <a @click='$emit("delete", comment)' class="dropdown-item cursor-pointer hover-light">Delete</a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <TablerLoading v-if='loading'/>
    <template v-else-if='edit'>
        <MdEditor
            :preview='false' noUploadImg noMermaid
            :noKatex='true'
            :toolbarsExclude='[
                "save",
                "prettier",
                "mermaid"
            ]'
            language='en-US'
            v-model="comment.body"
        />
        <div class='card-footer d-flex'>
            <div class='ms-auto'>
                <button @click='updateComment' class='btn btn-primary'>Update</button>
            </div>
        </div>
    </template>
    <template v-else>
        <div class="card-body">
            <TablerMarkdown :markdown='comment.body'/>
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
    },
    components: {
        Avatar,
        MdEditor,
        TablerMarkdown,
        TablerLoading
    }
}
</script>
