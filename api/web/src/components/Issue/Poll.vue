<template>
    <div>
        <TablerLoading
            v-if='loading.poll'
            desc='Loading Poll'
        />
        <template v-else>
            <label
                v-if='!poll.vote'
                class='mx-3'
            >Select a vote from the following:</label>
            <div class='border rounded mx-2 my-2 px-2 py-2'>
                <div
                    v-for='question in poll.questions'
                    :key='question.id'
                    class='my-1'
                >
                    <template v-if='!poll.vote'>
                        <div class='d-flex'>
                            <span
                                class='cursor-pointer my-1'
                                @click='selected = question.id'
                                v-text='question.question.name'
                            />

                            <div class='ms-auto'>
                                <IconCheck
                                    v-if='selected === question.id'
                                    :size='32'
                                    stroke='1'
                                />
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div class='mb-3'>
                            <span
                                class='my-1'
                                v-text='question.question.name'
                            />
                            <TablerProgress :percent='votes[question.id] || 0' />
                        </div>
                    </template>
                </div>
                <div
                    v-if='!poll.vote'
                    class='d-flex'
                >
                    <div class='ms-auto'>
                        <button
                            :disabled='!selected'
                            class='btn'
                            @click='vote'
                        >
                            Vote
                        </button>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import {
    TablerLoading,
    TablerProgress
} from '@tak-ps/vue-tabler';
import {
    IconCheck,
} from '@tabler/icons-vue';

export default {
    name: 'Poll',
    components: {
        IconCheck,
        TablerProgress,
        TablerLoading
    },
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
            total: 0,
            votes: {},
            selected: null,
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

            if (this.poll.votes) {
                for (const vote of this.poll.votes) {
                    this.total += vote.votes;
                }
                for (const vote of this.poll.votes) {
                    this.votes[vote.question_id] = vote.votes / this.total;
                }
            }

            if (this.poll.vote) {
                this.selected = this.poll.vote;
            }

            this.loading.poll = false;
        },
        vote: async function() {
            this.loading.poll = true;
            await window.std(`/api/issue/${this.issue.id}/poll`, {
                method: 'POST',
                body: {
                    question: this.selected
                }
            });

            await this.fetchPoll();
        },
    }
}
</script>
