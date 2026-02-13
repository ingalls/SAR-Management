<template>
    <div class='card'>
        <div class='card-header'>
            <h3 class='card-title'>
                Assets
            </h3>
            <div class='card-actions btn-actions'>
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
        <div class='table-responsive'>
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
                label='Mission Assets'
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
    IconTrash
} from '@tabler/icons-vue';

export default {
    name: 'MissionAssets',
    components: {
        Upload,
        TablerNone,
        TablerIconButton,
        TablerDelete,
        IconPlus,
        IconTrash
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
            showUpload: false
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
