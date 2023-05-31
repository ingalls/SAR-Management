<template>
<div>
    <TablerLoading v-if='loading.poll' desc='Loading Poll'/>
    <template v-else>
        POLL
    </template>
</div>
</template>

<script>
import {
    TablerLoading
} from '@tak-ps/vue-tabler';

export default {
    name: 'Poll',
    props: {
        issue: {
            type: Object,
            required: true
        }
    },
    data: function() {
        return {
            loading: {
                poll: true,
            },
            poll: {},
        }
    },
    mounted: async function() {
        await this.fetchPoll();
    },
    methods: {
        fetchPoll: async function() {
            this.loading.poll = true;
            this.poll = await window.std(`/api/issue/${this.issue.id}/poll`);
            this.loading.poll = false;
        },
    },
    components: {
        TablerLoading
    }
}
</script>
