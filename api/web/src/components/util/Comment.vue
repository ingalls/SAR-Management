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
                        <a @click='$router.push("/team/leadership")' class="dropdown-item cursor-pointer">Edit</a>
                        <a @click='deleteComment(comment)' class="dropdown-item cursor-pointer">Delete</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="card-body">
       <TablerMarkdown :markdown='comment.body'/>
    </div>
</div>
</template>

<script>
import {
    TablerMarkdown,
} from '@tak-ps/vue-tabler'
import Avatar from './Avatar.vue';
import moment from 'moment';

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
    computed: {
        fromNow: function() {
            return moment(this.comment.created).fromNow();
        }
    },
    methods: {
        deleteComment: async function(comment) {
            await window.std(`/api/issue/${this.$route.params.issueid}/comment/${comment.id}`, {
                method: 'DELETE'
            })
            this.$emit('delete');
        },
    },
    components: {
        Avatar,
        TablerMarkdown,
    }
}
</script>
