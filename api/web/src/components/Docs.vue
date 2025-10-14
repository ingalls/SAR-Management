<template>
    <div>
        <div class='page-wrapper'>
            <div class='page-header d-print-none'>
                <div class='container-xl'>
                    <div class='row g-2 align-items-center'>
                        <div class='col d-flex'>
                            <TablerBreadCrumb :normalize='false' />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class='page-body'>
            <div class='container-xl'>
                <div class='row row-deck row-cards'>
                    <div class='col-lg-12'>
                        <NoAccess
                            v-if='!is_iam("Doc:View")'
                            title='Documents'
                        />
                        <File
                            v-else-if='file'
                            :prefix='paging.prefix'
                            :file='file'
                            :manage='is_iam("Doc:Manage")'
                            @delete='deleteFile'
                        />
                        <div
                            v-else
                            class='card'
                        >
                            <div class='card-body'>
                                <div class='d-flex'>
                                    <TablerInput
                                        v-model='paging.filter'
                                        icon='search'
                                        placeholder='Search…'
                                    />

                                    <div class='ms-auto'>
                                        <div
                                            v-if='is_iam("Doc:Manage")'
                                            class='btn-list'
                                        >
                                            <TablerIconButton
                                                title='New Folder'
                                                @click='folder = true'
                                            >
                                                <IconFolderPlus
                                                    :size='32'
                                                    :stroke='1'
                                                />
                                            </TablerIconButton>
                                            <TablerDelete
                                                v-if='paging.prefix'
                                                displaytype='icon'
                                                class='my-1'
                                                @delete='deleteFolder'
                                            />
                                            <TablerIconButton
                                                title='Upload File'
                                                @click='upload = true'
                                            >
                                                <IconPlus
                                                    :size='32'
                                                    :stroke='1'
                                                />
                                            </TablerIconButton>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <TablerLoading v-if='loading.list' />
                            <template v-else>
                                <table class='table table-hover card-table table-vcenter'>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Size</th>
                                            <th>Last Modified</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr
                                            v-for='doc in list.items'
                                            :key='doc.key'
                                        >
                                            <td>
                                                <template v-if='doc.type === "dir"'>
                                                    <IconFolderFilled
                                                        class='mx-2'
                                                        :size='32'
                                                        :stroke='1'
                                                    />
                                                    <a
                                                        class='cursor-pointer'
                                                        @click='paging.prefix = paging.prefix + doc.key'
                                                        v-text='doc.key'
                                                    />
                                                </template>
                                                <template v-else>
                                                    <IconFileFilled
                                                        class='mx-2'
                                                        :size='32'
                                                        :stroke='1'
                                                    />
                                                    <a
                                                        class='cursor-pointer'
                                                        @click='file = doc.key'
                                                        v-text='doc.key'
                                                    />
                                                </template>
                                            </td>
                                            <td>
                                                <span v-if='doc.type === "dir"'>-</span>
                                                <span
                                                    v-else
                                                    v-text='human(doc.size)'
                                                />
                                            </td>
                                            <td v-text='doc.last_modified' />
                                        </tr>
                                    </tbody>
                                </table>
                                <template v-if='!list.total'>
                                    <TablerNone
                                        label='Documents'
                                        :create='false'
                                    />
                                </template>
                                <TableFooter
                                    :limit='paging.limit'
                                    :total='list.total'
                                    @page='paging.page = $event'
                                />
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <NewFolder
            v-if='folder'
            :prefix='paging.prefix'
            @close='folder = null'
            @done='folder = null; listDocs($event)'
        />

        <Upload
            v-if='upload'
            :url='url()'
            :headers='headers'
            @close='upload = null'
            @done='upload = null; listDocs($event)'
        />
    </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import iamHelper from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import TableFooter from './util/TableFooter.vue';
import Upload from './util/Upload.vue';
import NewFolder from './Docs/NewFolder.vue';
import File from './Docs/File.vue';
import {
    TablerNone,
    TablerInput,
    TablerDelete,
    TablerLoading,
    TablerIconButton,
    TablerBreadCrumb,
} from '@tak-ps/vue-tabler';
import {
    IconPlus,
    IconFolderPlus,
    IconFileFilled,
    IconFolderFilled,
} from '@tabler/icons-vue';
import { useRouter, useRoute } from 'vue-router';

const props = defineProps({
    iam: {
        type: Object,
        required: true
    },
    auth: {
        type: Object,
        required: true
    }
})

const router = useRouter();
const route = useRoute();

const file = ref(null);
const upload = ref(false);
const folder = ref(false);
const headers = reactive({
    Authorization: `Bearer ${localStorage.token}`
});
const paging = reactive({
    filter: '',
    prefix: '',
    limit: 100,
    page: 0
});
const loading = reactive({
    list: true
});
const list = reactive({
    total: 0,
    items: []
});

watch(paging, async () => {
    await listDocs();
}, { deep: true });

onMounted(async () => {
    let path = (route.params.pathMatch ? route.params.pathMatch : []).filter((p) => { return !!p.trim() });

    if (path.length && path[path.length - 1].includes('.')) file.value = path.pop();
    path = path.join('/') + '/';
    if (path !== '/') paging.prefix = path;

    if (is_iam("Doc:View")) await listDocs();
});

function url() {
    return window.stdurl(`api/doc?prefix=${paging.prefix}`);
}

function is_iam(permission) {
    return iamHelper(props.iam, props.auth, permission);
}

function human(size) {
    var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

async function deleteFile() {
    loading.list = true;
    file.value = null;
    await sleep();
    await listDocs();
}

function sleep() {
    return new Promise(resolve => setTimeout(resolve, 1000));
}

async function deleteFolder() {

}

async function listDocs() {
    if (paging.prefix) {
        router.push(`/doc/${paging.prefix}${file.value ? file.value : ''}`);
    } else {
        router.push(`/doc/${file.value ? file.value : ''}`);
    }

    loading.list = true;
    const url_obj = window.stdurl('/api/doc');
    url_obj.searchParams.append('limit', paging.limit);
    url_obj.searchParams.append('page', paging.page);
    url_obj.searchParams.append('filter', paging.filter);
    url_obj.searchParams.append('prefix', paging.prefix);

    const result = await window.std(url_obj);
    list.total = result.total;
    list.items = result.items;
    loading.list = false;
}
</script>
