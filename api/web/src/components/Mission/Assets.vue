<template>
    <div class='card'>
        <div class='card-header'>
            <h3 class='card-title'>
                Assets
            </h3>
            <div class='ms-auto btn-list'>
                <div class='btn-group'>
                    <button
                        type='button'
                        class='btn'
                        :class="{ 'btn-primary': view === 'files' }"
                        @click="view = 'files'"
                    >
                        Files
                    </button>
                    <button
                        type='button'
                        class='btn'
                        :class="{ 'btn-primary': view === 'photos' }"
                        @click="view = 'photos'"
                    >
                        Photos
                    </button>
                </div>

                <TablerIconButton
                    v-if='mode === "edit" || is_iam("Mission:Manage")'
                    title='Add Asset'
                    class='btn-primary'
                    style='width: 24px; height: 24px; min-height: 24px; min-width: 24px; padding: 0;'
                    @click='showUpload = true'
                >
                    <IconPlus
                        size='24'
                        stroke='1'
                    />
                </TablerIconButton>
            </div>
        </div>
        <div
            v-if="view === 'files'"
            class='table-responsive'
        >
            <table
                v-if='mission.assets && mission.assets.length'
                class='table table-vcenter card-table'
            >
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Created</th>
                        <th class='w-1' />
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for='asset in mission.assets'
                        :key='asset.id'
                    >
                        <td>
                            <a
                                :href='`/api/asset/${asset.id}/raw?token=${token}`'
                                target='_blank'
                                v-text='asset.name'
                            />
                        </td>
                        <td v-text='asset.created' />
                        <td>
                            <div class='btn-list flex-nowrap'>
                                <TablerDelete
                                    v-if='is_iam("Mission:Manage")'
                                    style='width: 24px; height: 24px; min-height: 24px; min-width: 24px; padding: 0;'
                                    displaytype='icon'
                                    title='Delete Asset'
                                    @delete='deleteAsset(asset.id)'
                                >
                                    <IconTrash
                                        size='24'
                                        stroke='1'
                                    />
                                </TablerDelete>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <TablerNone
                v-else
                label='No Mission Assets'
                :create='false'
            />
        </div>

        <div
            v-else-if="view === 'photos'"
            class='p-3'
        >
            <div
                v-if='photos.length'
                class='row row-cards'
            >
                <div
                    v-for='asset in photos'
                    :key='asset.id'
                    class='col-6 col-lg-4'
                >
                    <div class='card card-sm'>
                        <a
                            :href='`/api/asset/${asset.id}/raw?token=${token}`'
                            target='_blank'
                            class='d-block'
                        >
                            <img
                                :src='`/api/asset/${asset.id}/raw?token=${token}`'
                                class='card-img-top'
                                style='height: 200px; object-fit: cover;'
                            >
                        </a>
                        <div class='card-body'>
                            <div class='d-flex align-items-center'>
                                <div
                                    class='text-truncate'
                                    :title='asset.name'
                                >
                                    {{ asset.name }}
                                </div>
                                <div class='ms-auto btn-list'>
                                    <a
                                        :href='`/api/asset/${asset.id}/raw?token=${token}`'
                                        download
                                        class='text-secondary'
                                        title='Download'
                                    >
                                        <IconDownload
                                            size='20'
                                            stroke='1'
                                        />
                                    </a>
                                    <TablerDelete
                                        v-if='is_iam("Mission:Manage")'
                                        style='width: 24px; height: 24px; min-height: 24px; min-width: 24px; padding: 0;'
                                        displaytype='icon'
                                        title='Delete Asset'
                                        @delete='deleteAsset(asset.id)'
                                    >
                                        <IconTrash
                                            size='20'
                                            stroke='1'
                                        />
                                    </TablerDelete>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <TablerNone
                v-else
                label='No Mission Photos'
                :create='false'
            />
        </div>

        <Upload
            v-if='showUpload'
            url='/api/asset'
            :headers='{ Authorization: `Bearer ${token}` }'
            @close='showUpload = false'
            @done='postAsset($event)'
        />
    </div>
</template>

<script>
import iam from '../../iam.js';
import Upload from '../util/Upload.vue';
import {
    TablerNone,
    TablerIconButton,
    TablerDelete
} from '@tak-ps/vue-tabler';
import {
    IconPlus,
    IconTrash,
    IconDownload
} from '@tabler/icons-vue';

export default {
    name: 'MissionAssets',
    components: {
        Upload,
        TablerNone,
        TablerIconButton,
        TablerDelete,
        IconPlus,
        IconTrash,
        IconDownload
    },
    props: {
        mission: {
            type: Object,
            required: true
        },
        iam: {
            type: Object,
            required: true
        },
        auth: {
            type: Object,
            required: true
        },
        mode: {
            type: String,
            default: 'view'
        }
    },
    emits: ['refresh'],
    data: function() {
        return {
            token: localStorage.token,
            showUpload: false,
            view: 'files'
        }
    },
    computed: {
        photos: function() {
            if (!this.mission.assets) return [];
            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            return this.mission.assets.filter((asset) => {
                const ext = asset.name.split('.').pop().toLowerCase();
                return imageExtensions.includes(ext);
            });
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        postAsset: async function(asset) {
            this.showUpload = false;
            if (!asset || !asset.id) return;

            const assets = this.mission.assets_id ? [...this.mission.assets_id] : [];
            assets.push(asset.id);
            await this.patchMission({ assets: assets });
        },
        deleteAsset: async function(assetId) {
            const assets = this.mission.assets_id ? this.mission.assets_id.filter((a) => a !== assetId) : [];
            await this.patchMission({ assets: assets });
        },
        patchMission: async function(body) {
            await window.std(`/api/mission/${this.$route.params.missionid}`, {
                method: 'PATCH',
                body
            });
            this.$emit('refresh');
        }
    }
}
</script>
