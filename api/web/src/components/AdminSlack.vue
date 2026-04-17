<template>
    <div>
        <div class='page-wrapper'>
            <div class='page-header d-print-none'>
                <div class='container-xl'>
                    <div class='row g-2 align-items-center'>
                        <div class='col d-flex'>
                            <TablerBreadCrumb />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class='page-body'>
            <div class='container-xl'>
                <div class='row row-cards'>
                    <div class='col-lg-12'>
                        <div class='card'>
                            <div class='card-header'>
                                <TablerIconButton
                                    title='Back to Admin'
                                    @click='$router.push("/admin")'
                                >
                                    <IconArrowLeft
                                        :size='32'
                                        stroke='1'
                                    />
                                </TablerIconButton>
                                <h2 class='card-title ms-2'>
                                    Slack Channel Membership
                                </h2>
                                <div class='ms-auto'>
                                    <IconBrandSlack
                                        :size='24'
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class='col-lg-4'>
                        <div class='card'>
                            <div class='card-header'>
                                <h3 class='card-title'>
                                    Channels
                                </h3>
                            </div>
                            <div class='card-body border-bottom py-2'>
                                <TablerInput
                                    v-model='channelFilter'
                                    icon='search'
                                    placeholder='Search channels...'
                                />
                            </div>
                            <TablerLoading
                                v-if='loading.channels'
                                desc='Loading Channels'
                            />
                            <TablerNone
                                v-else-if='!filteredChannels.length'
                                :create='false'
                                label='No channels found'
                            />
                            <div
                                v-else
                                class='list-group list-group-flush overflow-auto'
                                style='max-height: 70vh;'
                            >
                                <a
                                    v-for='channel in filteredChannels'
                                    :key='channel.id'
                                    class='list-group-item list-group-item-action cursor-pointer'
                                    :class='{ active: selectedChannel && selectedChannel.id === channel.id }'
                                    @click='selectChannel(channel)'
                                >
                                    <div class='d-flex align-items-center'>
                                        <div>
                                            <strong v-text='`#${channel.name}`' />
                                            <div class='text-secondary small'>
                                                {{ channel.num_members || 0 }} members
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div class='col-lg-8'>
                        <template v-if='!selectedChannel'>
                            <div class='card'>
                                <div class='card-body text-center text-secondary py-5'>
                                    <IconBrandSlack
                                        :size='48'
                                        stroke='1'
                                        class='mb-3'
                                    />
                                    <p>Select a channel to view membership details</p>
                                </div>
                            </div>
                        </template>
                        <template v-else>
                            <div class='card'>
                                <div class='card-header'>
                                    <h3 class='card-title'>
                                        #{{ selectedChannel.name }}
                                        <TablerBadge
                                            v-if='membership'
                                            class='ms-2'
                                            background-color='rgba(110, 117, 130, 0.2)'
                                            text-color='#6e7582'
                                        >
                                            {{ membership.members.length }} members
                                        </TablerBadge>
                                    </h3>
                                    <div
                                        v-if='membership && membership.teams.length && (membership.should_not_be_present.length || membership.should_be_present.length)'
                                        class='ms-auto'
                                    >
                                        <button
                                            class='btn btn-primary btn-sm'
                                            :disabled='loading.sync'
                                            @click='syncChannel'
                                        >
                                            <IconRefresh
                                                v-if='!loading.sync'
                                                :size='16'
                                                class='me-1'
                                            />
                                            <span
                                                v-else
                                                class='spinner-border spinner-border-sm me-1'
                                            />
                                            Sync Membership
                                        </button>
                                    </div>
                                </div>
                                <TablerLoading
                                    v-if='loading.membership'
                                    desc='Analyzing membership'
                                />
                                <template v-else-if='membership'>
                                    <div
                                        v-if='membership.teams.length'
                                        class='card-body border-bottom'
                                    >
                                        <div class='d-flex align-items-center flex-wrap gap-2'>
                                            <span class='text-secondary me-1'>Linked Teams:</span>
                                            <a
                                                v-for='team in membership.teams'
                                                :key='team.id'
                                                :href='`/team/${team.id}`'
                                                target='_blank'
                                                style='text-decoration: none;'
                                            >
                                                <TablerBadge
                                                    class='cursor-pointer'
                                                    background-color='rgba(32, 107, 196, 0.2)'
                                                    text-color='#206bc4'
                                                >{{ team.name }}</TablerBadge>
                                            </a>
                                            <span
                                                v-if='membership.should_be_present.length'
                                                class='ms-auto cursor-pointer'
                                                @click='showShouldBe = !showShouldBe'
                                            >
                                                <TablerBadge
                                                    background-color='rgba(245, 159, 0, 0.2)'
                                                    text-color='#f59f00'
                                                >
                                                    <IconUserPlus :size='14' class='me-1' />
                                                    {{ membership.should_be_present.length }} Should Be Present
                                                </TablerBadge>
                                            </span>
                                        </div>
                                        <div
                                            v-if='showShouldBe && membership.should_be_present.length'
                                            class='mt-2 d-flex flex-wrap gap-1'
                                        >
                                            <a
                                                v-for='user in membership.should_be_present'
                                                :key='user.user_id'
                                                :href='`/user/${user.user_id}`'
                                                target='_blank'
                                                style='text-decoration: none;'
                                            >
                                                <TablerBadge
                                                    class='cursor-pointer'
                                                    background-color='rgba(245, 159, 0, 0.2)'
                                                    text-color='#f59f00'
                                                >{{ user.fname }} {{ user.lname }}</TablerBadge>
                                            </a>
                                        </div>
                                    </div>
                                    <div
                                        v-else
                                        class='card-body border-bottom'
                                    >
                                        <div class='text-warning'>
                                            <IconAlertTriangle
                                                :size='16'
                                                class='me-1'
                                            />
                                            This channel is not linked to any SAR team. Link it via a Team's Slack settings to enable membership comparison.
                                        </div>
                                    </div>
                                    <TablerNone
                                        v-if='!membership.members.length'
                                        :create='false'
                                        label='No members'
                                    />
                                    <table
                                        v-else
                                        class='table card-table table-vcenter'
                                    >
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Slack Handle</th>
                                                <th>Email</th>
                                                <th>Type</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr
                                                v-for='member in sortedMembers'
                                                :key='member.id'
                                                :class='{ "cursor-pointer": member.user_id }'
                                                class='member-row'
                                                @click='openUser(member)'
                                            >
                                                <td v-text='member.real_name' />
                                                <td>@{{ member.name }}</td>
                                                <td v-text='member.email || "—"' />
                                                <td>
                                                    <TablerBadge
                                                        v-if='shouldNotBePresentIds.has(member.id)'
                                                        background-color='rgba(214, 57, 57, 0.2)'
                                                        text-color='#d63939'
                                                    >Should Not Be Present</TablerBadge>
                                                    <TablerBadge
                                                        v-else-if='member.is_bot'
                                                        background-color='rgba(147, 51, 234, 0.2)'
                                                        text-color='#9333ea'
                                                    >Bot</TablerBadge>
                                                    <TablerBadge
                                                        v-else
                                                        background-color='rgba(32, 107, 196, 0.2)'
                                                        text-color='#206bc4'
                                                    >User</TablerBadge>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </template>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import {
    IconBrandSlack,
    IconArrowLeft,
    IconAlertTriangle,
    IconUserPlus,
    IconRefresh,
} from '@tabler/icons-vue';
import {
    TablerBadge,
    TablerBreadCrumb,
    TablerIconButton,
    TablerInput,
    TablerLoading,
    TablerNone,
} from '@tak-ps/vue-tabler';

defineProps({
    iam: {
        type: Object,
        required: true
    },
    auth: {
        type: Object,
        required: true
    }
});

const loading = reactive({
    channels: true,
    membership: false,
    sync: false,
});

const channels = ref([]);
const channelFilter = ref('');
const selectedChannel = ref(null);
const membership = ref(null);
const showShouldBe = ref(false);

const shouldNotBePresentIds = computed(() => {
    if (!membership.value) return new Set();
    return new Set(membership.value.should_not_be_present.map(u => u.slack_id));
});

const sortedMembers = computed(() => {
    if (!membership.value) return [];
    const ids = shouldNotBePresentIds.value;
    return [...membership.value.members].sort((a, b) => {
        const aFlag = ids.has(a.id) ? 0 : 1;
        const bFlag = ids.has(b.id) ? 0 : 1;
        return aFlag - bFlag;
    });
});

const filteredChannels = computed(() => {
    const q = channelFilter.value.toLowerCase().trim();
    if (!q) return channels.value;
    return channels.value.filter(c => c.name.toLowerCase().includes(q));
});

const fetchChannels = async () => {
    loading.channels = true;
    try {
        const result = await window.std('/api/slack/channels');
        channels.value = (result.channels || []).sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
        console.error(err);
    }
    loading.channels = false;
};

const selectChannel = async (channel) => {
    selectedChannel.value = channel;
    membership.value = null;
    showShouldBe.value = false;
    loading.membership = true;

    try {
        const result = await window.std(`/api/slack/channels/${encodeURIComponent(channel.id)}/membership`);
        membership.value = result;
    } catch (err) {
        console.error(err);
    }

    loading.membership = false;
};

const openUser = (member) => {
    if (member.user_id) {
        window.open(`/user/${member.user_id}`, '_blank');
    }
};

const syncChannel = async () => {
    if (!selectedChannel.value) return;
    loading.sync = true;

    try {
        await window.std(`/api/slack/channels/${encodeURIComponent(selectedChannel.value.id)}/sync`, {
            method: 'POST'
        });

        // Refresh membership data after sync
        const result = await window.std(`/api/slack/channels/${encodeURIComponent(selectedChannel.value.id)}/membership`);
        membership.value = result;
    } catch (err) {
        console.error(err);
    }

    loading.sync = false;
};

onMounted(() => {
    fetchChannels();
});
</script>

<style scoped>
.member-row:hover {
    background-color: rgba(32, 107, 196, 0.05);
}
.member-row.cursor-pointer:hover {
    background-color: rgba(32, 107, 196, 0.1);
}
</style>
