<template>
    <div class='card'>
        <div class='card-header'>
            <h3 class='card-title'>Assets</h3>
            <div class='card-actions btn-actions'>
                <TablerIconButton
                    v-if='mode === "edit" || is_iam("Training:Manage")'
                    title='Add Asset'
                    class='btn-primary'
                    style='width: 32px; height: 32px; min-height: 32px; min-width: 32px; padding: 0;'
                    @click='showUpload = true'
                >
                    <IconPlus
                        size='32'
                        stroke='1'
                    />
                </TablerIconButton>
            </div>
        </div>
        <div class='table-responsive'>
            <table
                v-if='training.assets && training.assets.length'
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
                    <tr v-for='asset in training.assets' :key='asset.id'>
                        <td>
                            <a :href='`/api/asset/${asset.id}/raw`' target='_blank' v-text='asset.name'></a>
                        </td>
                        <td v-text='asset.created' />
                        <td>
                            <div class='btn-list flex-nowrap'>
                                <TablerIconButton
                                    v-if='is_iam("Training:Manage")'
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
                label='Training Assets'
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
    TablerIconButton
} from '@tak-ps/vue-tabler';
import {
    IconPlus,
    IconTrash
} from '@tabler/icons-vue';

export default {
    name: 'TrainingAssets',
    components: {
        Upload,
        TablerNone,
        TablerIconButton,
        IconPlus,
        IconTrash
    },
    props: {
        training: {
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
            if (!this.training.assets_id) this.training.assets_id = [];
            this.training.assets_id.push(asset.id);
            await this.patchTraining({ assets: this.training.assets_id });
        },
        deleteAsset: async function(assetId) {
            this.training.assets_id = this.training.assets_id.filter((a) => a !== assetId);
            await this.patchTraining({ assets: this.training.assets_id });
        },
        patchTraining: async function(body) {
            await window.std(`/api/training/${this.$route.params.trainingid}`, {
                method: 'PATCH',
                body
            });
            this.$emit('refresh');
        }
    }
}
</script>
