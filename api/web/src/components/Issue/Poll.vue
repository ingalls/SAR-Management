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

<script setup>
import { ref, onMounted } from 'vue';
import {
    TablerLoading,
    TablerProgress
} from '@tak-ps/vue-tabler';
import {
    IconCheck,
} from '@tabler/icons-vue';

const props = defineProps({
    issue: {
        type: Object,
        required: true
    }
});

const loading = ref({
    poll: true,
});
const total = ref(0);
const votes = ref({});
const selected = ref(null);
const poll = ref({});

const fetchPoll = async () => {
    loading.value.poll = true;
    poll.value = await window.std(`/api/issue/${props.issue.id}/poll`);

    if (poll.value.votes) {
        for (const vote of poll.value.votes) {
            total.value += vote.votes;
        }
        for (const vote of poll.value.votes) {
            votes.value[vote.question_id] = vote.votes / total.value;
        }
    }

    if (poll.value.vote) {
        selected.value = poll.value.vote;
    }

    loading.value.poll = false;
};

const vote = async () => {
    loading.value.poll = true;
    await window.std(`/api/issue/${props.issue.id}/poll`, {
        method: 'POST',
        body: {
            question: selected.value
        }
    });

    await fetchPoll();
};

onMounted(async () => {
    await fetchPoll();
});
</script>
