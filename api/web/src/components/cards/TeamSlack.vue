<template>
    <div class='card'>
        <div class='card-header'>
            <h2 class='card-title'>
                Slack Integration
            </h2>
            <div class='ms-auto btn-list'>
                <TablerIconButton
                    title='Sync Slack Users'
                    @click='sync'
                >
                    <IconRefresh
                            :size='32'
                            stroke='1'
                    />
                </TablerIconButton>
                <IconPlus
                    :size='32'
                    stroke='1'
                    class='cursor-pointer'
                    @click='adding = !adding'
                />
            </div>
        </div>
        <table class='table card-table table-vcenter'>
            <thead>
                <tr>
                    <th>Channel</th>
                    <th />
                </tr>
            </thead>
            <tbody>
                <tr v-if='loading'>
                    <td colspan='2'>
                        <TablerLoading />
                    </td>
                </tr>
                <tr v-else-if='!channels.length'>
                    <td colspan='2'>
                        <TablerNone
                            :create='false'
                            label='No Channels Linked'
                        />
                    </td>
                </tr>
                <tr
                    v-for='channel in channels'
                    :key='channel.id'
                >
                    <td v-text='`#${channel.channel_name}`' />
                    <td>
                        <div class='d-flex'>
                            <div class='ms-auto'>
                                <TablerDelete
                                    displaytype='icon'
                                    @delete='deleteChannel(channel.id)'
                                />
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <div
            v-if='adding'
            class='card-body'
        >
            <div class='row'>
                <div class='col-12'>
                    <div class='d-flex'>
                        <select
                            v-if='allChannels.length'
                            v-model='newChannelId'
                            class='form-select'
                        >
                            <option
                                :value='null'
                                disabled
                            >
                                Select a channel...
                            </option>
                            <option
                                v-for='c in allChannels'
                                :key='c.value'
                                :value='c.value'
                            >
                                {{ c.label }}
                            </option>
                        </select>
                        <div
                            v-else
                            class='text-danger'
                        >
                            Unable to fetch Slack channels
                        </div>
                        <button
                            class='btn btn-icon btn-primary ms-2'
                            :disabled='!newChannelId'
                            @click='addChannel'
                        >
                            <IconPlus :size='20' />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { IconPlus, IconRefresh } from '@tabler/icons-vue';
import { TablerLoading, TablerNone, TablerDelete, TablerIconButton } from '@tak-ps/vue-tabler';

const props = defineProps({
    teamId: {
        type: Number,
        required: true
    }
});

const loading = ref(true);
const adding = ref(false);
const channels = ref([]);
const newChannelId = ref(null);
const allChannels = ref([]); // { label: string, value: string, name: string }[]

const fetchChannels = async () => {
    loading.value = true;
    try {
        const [linked, available] = await Promise.all([
             window.std(`/api/team-channel?team_id=${props.teamId}`),
             window.std('/api/slack/channels')
        ]);

        channels.value = linked.items;
        allChannels.value = available.channels.map(c => ({
            label: `#${c.name} (${c.num_members || 0} members)`,
            value: c.id,
            name: c.name // Keep name for saving
        }));
    } catch (err) {
        console.error(err);
    }
    loading.value = false;
};

const addChannel = async () => {
    if (!newChannelId.value) return;
    try {
        loading.value = true;
        const channel = allChannels.value.find(c => c.value === newChannelId.value);
        await window.std('/api/team-channel', {
            method: 'POST',
            body: {
                team_id: props.teamId,
                channel_id: newChannelId.value,
                channel_name: channel ? channel.name : 'Unknown'
            }
        });
        newChannelId.value = null;
        adding.value = false;
        await fetchChannels();
    } catch (err) {
        console.error(err);
    }
};

const deleteChannel = async (id) => {
    try {
        loading.value = true;
        await window.std(`/api/team-channel/${id}`, {
            method: 'DELETE'
        });
        await fetchChannels();
    } catch (err) {
        console.error(err);
    }
};

const sync = async () => {
    try {
        loading.value = true;
        await window.std('/api/team-channel/sync', {
            method: 'POST',
            body: {
                team_id: props.teamId
            }
        });
        loading.value = false;
    } catch (err) {
        console.error(err);
        loading.value = false;
    }
};

onMounted(() => {
    fetchChannels();
});
</script>

