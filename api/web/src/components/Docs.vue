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
                            v-else-if='fileId'
                            :key='fileId'
                            :docid='fileId'
                            :manage='manage'
                            @close='openFolder(folderPath)'
                            @delete='openFolder(folderPath)'
                            @move='openFolder($event.path, $event.id)'
                        />
                        <div
                            v-else
                            class='card'
                        >
                            <div class='card-body'>
                                <div class='d-flex align-items-center'>
                                    <TablerInput
                                        v-model='paging.filter'
                                        icon='search'
                                        :placeholder='folderPath === "/" ? "Search all documents…" : "Search this folder & its subfolders…"'
                                    />

                                    <div class='ms-auto d-flex align-items-center'>
                                        <div
                                            v-if='manage'
                                            class='btn-list me-2'
                                        >
                                            <TablerIconButton
                                                title='New Folder'
                                                class='my-1'
                                                @click='folder = true'
                                            >
                                                <IconFolderPlus
                                                    :size='32'
                                                    :stroke='1'
                                                />
                                            </TablerIconButton>
                                            <TablerIconButton
                                                v-if='list.folder'
                                                title='Rename or Move Folder'
                                                class='my-1'
                                                @click='move = list.folder'
                                            >
                                                <IconFolderSymlink
                                                    :size='32'
                                                    :stroke='1'
                                                />
                                            </TablerIconButton>
                                            <TablerDelete
                                                v-if='list.folder'
                                                v-tooltip='"Delete Folder & Contents"'
                                                displaytype='icon'
                                                :match='list.folder.name'
                                                class='my-1'
                                                @delete='deleteFolder'
                                            />
                                            <TablerIconButton
                                                title='Upload File'
                                                class='my-1'
                                                @click='upload = true'
                                            >
                                                <IconPlus
                                                    :size='32'
                                                    :stroke='1'
                                                />
                                            </TablerIconButton>
                                        </div>

                                        <div class='btn-group'>
                                            <button
                                                type='button'
                                                class='btn btn-icon'
                                                :class='{ "active": mode === "list" }'
                                                title='List View'
                                                @click='mode = "list"'
                                            >
                                                <IconList
                                                    :size='24'
                                                    :stroke='1'
                                                />
                                            </button>
                                            <button
                                                type='button'
                                                class='btn btn-icon'
                                                :class='{ "active": mode === "tile" }'
                                                title='Tile View'
                                                @click='mode = "tile"'
                                            >
                                                <IconLayoutGrid
                                                    :size='24'
                                                    :stroke='1'
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <TablerLoading v-if='loading.list' />
                            <div
                                v-else
                                class='d-flex flex-column'
                                style='height: 70vh'
                            >
                                <div class='flex-fill overflow-auto'>
                                    <table
                                        v-if='mode === "list"'
                                        class='table table-hover card-table table-vcenter'
                                    >
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th v-if='paging.filter'>
                                                    Folder
                                                </th>
                                                <th>Size</th>
                                                <th>Last Modified</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr
                                                v-for='doc in list.items'
                                                :key='doc.id'
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
                                                            @click='open(doc)'
                                                            v-text='doc.name'
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
                                                            @click='open(doc)'
                                                            v-text='doc.name'
                                                        />
                                                    </template>
                                                </td>
                                                <td v-if='paging.filter'>
                                                    <a
                                                        class='cursor-pointer text-muted'
                                                        @click='openFolder(doc.path)'
                                                        v-text='doc.path'
                                                    />
                                                </td>
                                                <td>
                                                    <span v-if='doc.type === "dir"'>-</span>
                                                    <span
                                                        v-else
                                                        v-text='human(doc.size)'
                                                    />
                                                </td>
                                                <td>
                                                    <TablerEpoch
                                                        v-if='doc.type === "file"'
                                                        :date='doc.updated'
                                                    />
                                                    <span v-else>-</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <div
                                        v-else-if='mode === "tile"'
                                        class='row row-cards p-2'
                                    >
                                        <div
                                            v-for='doc in list.items'
                                            :key='doc.id'
                                            class='col-6 col-sm-4 col-md-3 col-lg-2 cursor-pointer'
                                            @click='open(doc)'
                                        >
                                            <div class='card card-sm hover-shadow-sm tile-hover'>
                                                <div class='card-body text-center'>
                                                    <div class='mb-2'>
                                                        <IconFolderFilled
                                                            v-if='doc.type === "dir"'
                                                            :size='48'
                                                            :stroke='1'
                                                        />
                                                        <IconFileFilled
                                                            v-else
                                                            :size='48'
                                                            :stroke='1'
                                                        />
                                                    </div>
                                                    <div
                                                        class='text-truncate'
                                                        :title='doc.name'
                                                    >
                                                        {{ doc.name }}
                                                    </div>
                                                    <div
                                                        v-if='paging.filter'
                                                        class='text-muted small text-truncate'
                                                        :title='doc.path'
                                                    >
                                                        {{ doc.path }}
                                                    </div>
                                                    <div class='text-muted small'>
                                                        {{ doc.type === "dir" ? "-" : human(doc.size) }}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <template v-if='!list.total'>
                                        <TablerNone
                                            :label='paging.filter ? "No Matching Documents" : "No Documents"'
                                            :create='false'
                                        />
                                    </template>
                                </div>
                                <TableFooter
                                    :limit='paging.limit'
                                    :total='list.total'
                                    :page='paging.page'
                                    @page='paging.page = $event'
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <NewFolder
            v-if='folder'
            :path='folderPath'
            @close='folder = false'
            @done='folder = false; listDocs()'
        />

        <Move
            v-if='move'
            :doc='move'
            @close='move = null'
            @done='move = null; openFolder(`${$event.path}${$event.name}/`)'
        />

        <Upload
            v-if='upload'
            :url='url()'
            :headers='headers'
            @close='upload = false'
            @done='upload = false; listDocs()'
        />
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import iamHelper from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import TableFooter from './util/TableFooter.vue';
import Upload from './util/Upload.vue';
import NewFolder from './Docs/NewFolder.vue';
import Move from './Docs/Move.vue';
import File from './Docs/File.vue';
import {
    TablerNone,
    TablerInput,
    TablerEpoch,
    TablerDelete,
    TablerLoading,
    TablerIconButton,
    TablerBreadCrumb,
} from '@tak-ps/vue-tabler';
import {
    IconPlus,
    IconList,
    IconLayoutGrid,
    IconFolderPlus,
    IconFolderSymlink,
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

const mode = ref('list');
const upload = ref(false);
const folder = ref(false);
const move = ref(null);
const headers = reactive({
    Authorization: `Bearer ${localStorage.token}`
});
const paging = reactive({
    filter: '',
    limit: 100,
    page: 0
});
const loading = reactive({
    list: true
});
const list = reactive({
    total: 0,
    folder: null,
    items: []
});

// The URL is the source of truth: /doc/<folder>/<folder>?file=<uuid>
const folderPath = computed(() => {
    const segments = [].concat(route.params.pathMatch || []).filter((p) => { return !!p.trim() });
    return segments.length ? `/${segments.join('/')}/` : '/';
});

const fileId = computed(() => {
    return route.query.file ? String(route.query.file) : null;
});

const manage = computed(() => {
    return is_iam("Doc:Admin");
});

watch(folderPath, async () => {
    if (paging.filter || paging.page) {
        // Handled by the paging watcher
        paging.filter = '';
        paging.page = 0;
    } else {
        await listDocs();
    }
});

watch(() => paging.filter, () => {
    paging.page = 0;
});

watch(paging, async () => {
    await listDocs();
}, { deep: true });

watch(fileId, async (id) => {
    if (!id) await listDocs();
});

onMounted(async () => {
    if (is_iam("Doc:View")) await listDocs();
});

function url() {
    const url = window.stdurl('/api/doc');
    url.searchParams.append('path', folderPath.value);
    return url;
}

function is_iam(permission) {
    return iamHelper(props.iam, props.auth, permission);
}

function human(size) {
    var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

function openFolder(path, file) {
    router.push({
        name: 'docs',
        params: { pathMatch: path.split('/').filter((p) => { return !!p }) },
        query: file ? { file } : {}
    });
}

async function deleteFolder() {
    loading.list = true;

    try {
        await window.std(`/api/doc/${list.folder.id}`, {
            method: 'DELETE'
        });

        openFolder(list.folder.path);
    } catch (err) {
        loading.list = false;
        throw err;
    }
}

async function listDocs() {
    if (!is_iam("Doc:View")) return;

    loading.list = true;

    try {
        const url_obj = window.stdurl('/api/doc');
        url_obj.searchParams.append('limit', paging.limit);
        url_obj.searchParams.append('page', paging.page);
        url_obj.searchParams.append('filter', paging.filter);
        url_obj.searchParams.append('path', folderPath.value);
        // Searches include everything beneath the current folder
        url_obj.searchParams.append('recursive', String(!!paging.filter));

        const result = await window.std(url_obj);
        list.total = result.total;
        list.folder = result.folder;
        list.items = result.items;
    } finally {
        loading.list = false;
    }
}

function open(doc) {
    if (doc.type === 'dir') {
        openFolder(`${doc.path}${doc.name}/`);
    } else {
        openFolder(doc.path, doc.id);
    }
}
</script>

<style scoped>
.tile-hover:hover {
    background-color: rgba(0, 0, 0, 0.025);
}
</style>
