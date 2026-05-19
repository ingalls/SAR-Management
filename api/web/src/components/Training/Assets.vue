<template>
    <div class='card'>
        <div class='card-header'>
            <h3 class='card-title'>
                Assets
            </h3>
            <div class='card-actions btn-actions d-flex align-items-center'>
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
                        <th class='w-1' />
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for='asset in training.assets'
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
                                    v-if='is_iam("Training:Manage")'
                                    displaytype='icon'
                                    title='Delete Asset'
                                    @delete='deleteAsset(asset.id)'
                                />
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <TablerNone
                v-else
                label='No Training Assets'
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

<script setup>
import iamHelper from '../../iam.js';
import Upload from '../util/Upload.vue';
import {
    TablerNone,
    TablerIconButton,
    TablerDelete
} from '@tak-ps/vue-tabler';
import {
    IconPlus
} from '@tabler/icons-vue';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
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
});

const emit = defineEmits(['refresh']);

const route = useRoute();

const token = ref(localStorage.token);
const showUpload = ref(false);

function is_iam(permission) { return iamHelper(props.iam, props.auth, permission); }

async function postAsset(asset) {
    showUpload.value = false;
    const assets = props.training.assets_id ? [...props.training.assets_id] : [];
    assets.push(asset.id);
    await patchTraining({ assets: assets });
}

async function deleteAsset(assetId) {
    const assets = props.training.assets_id ? props.training.assets_id.filter((a) => a !== assetId) : [];
    await patchTraining({ assets: assets });
}

async function patchTraining(body) {
    await window.std(`/api/training/${route.params.trainingid}`, {
        method: 'PATCH',
        body
    });
    emit('refresh');
}
</script>
