<template>
    <div class='card'>
        <div class='card-header'>
            <h3 class='card-title'>Assets</h3>
            <div class='card-actions btn-actions'>
                <TablerIconButton
                    v-if='mode === "edit" || is_iam("Mission:Manage")'
                    title='Add Asset'
                    class='btn-primary'
                    style='width: 32px; height: 32px; min-height: 32px; min-width: 32px; padding: 0;'
                    @click='showUpload = true'
                >
                    <IconPlus size='32' />
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
                        <th class='w-1'></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for='asset in mission.assets' :key='asset.id'>
                        <td>
                            <a :href='`/api/asset/${asset.id}/raw`' target='_blank' v-text='asset.name'></a>
                        </td>
                        <td v-text='asset.created' />
                        <td>
                            <div class='btn-list flex-nowrap'>
                                <TablerIconButton
                                    v-if='is_iam("Mission:Manage")'
                                    color='red'
                                    title='Delete Asset'
                                    @click='deleteAsset(asset.id)'
                                >
                                    <IconTrash size='20' />
                                </TablerIconButton>
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
    TablerIconButton
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
            showUpload: false
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        postAsset: async function(asset) {
            this.showUpload = false;
            if (!this.mission.assets_id) this.mission.assets_id = [];
            this.mission.assets_id.push(asset.id);
            await this.patchMission({ assets: this.mission.assets_id });
        },
        deleteAsset: async function(assetId) {
            this.mission.assets_id = this.mission.assets_id.filter((a) => a !== assetId);
            await this.patchMission({ assets: this.mission.assets_id });
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
