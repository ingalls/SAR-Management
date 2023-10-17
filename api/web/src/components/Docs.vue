<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <TablerBreadCrumb :normalize='false'/>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div class="col-lg-12">
                    <NoAccess v-if='!is_iam("Doc:View")' title='Documents'/>
                    <TablerLoading v-else-if='loading.list'/>
                    <File
                        v-else-if='file'
                        :prefix='paging.prefix'
                        :file='file'
                        :manage='is_iam("Doc:Manage")'
                        @delete='deleteFile'
                    />
                    <div v-else class="card">
                        <div class="card-body">
                            <div class="d-flex">
                                <div class="input-icon w-50">
                                    <input v-model='paging.filter' type="text" class="form-control" placeholder="Search…">
                                    <span class="input-icon-addon">
                                        <SearchIcon width='24'/>
                                    </span>
                                </div>
                                <div class='ms-auto'>
                                    <div v-if='is_iam("Doc:Manage")' class='btn-list'>
                                        <FolderPlusIcon @click='folder = true' class='cursor-pointer my-1'/>
                                        <TablerDelete v-if='paging.prefix' displaytype='icon' class='my-1' @delete='deleteFolder'/>
                                        <PlusIcon @click='upload = true' class='cursor-pointer my-1'/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <table class="table table-hover card-table table-vcenter">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Size</th>
                                    <th>Last Modified</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr :key='doc.key' v-for='doc in list.documents'>
                                    <td>
                                        <template v-if='doc.type === "dir"'>
                                            <FolderFilledIcon class='mx-2'/>
                                            <a class='cursor-pointer' @click='paging.prefix = paging.prefix + doc.key' v-text='doc.key'></a>
                                        </template>
                                        <template v-else>
                                            <FileFilledIcon class='mx-2'/>
                                            <a class='cursor-pointer' @click='file = doc.key' v-text='doc.key'></a>
                                        </template>
                                    </td>
                                    <td>
                                        <span v-if='doc.type === "dir"'>-</span>
                                        <span v-else v-text='human(doc.size)'/>
                                    </td>
                                    <td v-text='doc.last_modified'/>
                                </tr>
                            </tbody>
                        </table>
                        <template v-if='!list.total'>
                            <TablerNone label='Documents' :create='false'/>
                        </template>
                        <TableFooter :limit='paging.limit' :total='list.total' @page='paging.page = $event'/>
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

<script>
import iam from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import TableFooter from './util/TableFooter.vue';
import Upload from './util/Upload.vue';
import NewFolder from './Docs/NewFolder.vue';
import File from './Docs/File.vue';
import {
    TablerNone,
    TablerDelete,
    TablerBreadCrumb,
    TablerLoading
} from '@tak-ps/vue-tabler';
import {
    DotsVerticalIcon,
    PlusIcon,
    FolderPlusIcon,
    SearchIcon,
    FileFilledIcon,
    FolderFilledIcon
} from 'vue-tabler-icons';

export default {
    name: 'Docs',
    props: {
        iam: {
            type: Object,
            required: true
        },
        auth: {
            type: Object,
            required: true
        }
    },
    data: function() {
        return {
            file: null,
            upload: false,
            folder: false,
            headers: {
                Authorization: `Bearer ${localStorage.token}`
            },
            paging: {
                filter: '',
                prefix: '',
                limit: 100,
                page: 0
            },
            loading: {
                list: true
            },
            list: {
                total: 0,
                documents: []
            }
        }
    },
    watch: {
       paging: {
           deep: true,
           handler: async function() {
              await this.listDocs();
           }
       },
    },
    mounted: async function() {
        let path = (this.$route.params.pathMatch ? this.$route.params.pathMatch : []).filter((p) => { return !!p.trim() });

        if (path.length && path[path.length - 1].includes('.')) this.file = path.pop();
        path = path.join('/') + '/';
        if (path !== '/') this.paging.prefix = path;

        if (this.is_iam("Doc:View")) await this.listDocs();
    },
    methods: {
        url: function() {
            return window.stdurl(`api/doc?prefix=${this.paging.prefix}`);
        },
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        human(size) {
            var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
            return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
        },
        deleteFile: async function() {
            this.loading.list = true;
            this.file = null;
            await this.sleep();
            await this.listDocs();
        },
        sleep: function() {
            return new Promise(resolve => setTimeout(resolve, 1000));
        },
        deleteFolder: async function() {

        },
        error: function($event) {
            this.upload = null;
            throw $event;
        },
        listDocs: async function() {
            if (this.paging.prefix) {
                this.$router.push(`/doc/${this.paging.prefix}${this.file ? this.file : ''}`);
            } else {
                this.$router.push(`/doc/${this.file ? this.file : ''}`);
            }

            this.loading.list = true;
            const url = window.stdurl('/api/doc');
            url.searchParams.append('limit', this.paging.limit);
            url.searchParams.append('page', this.paging.page);
            url.searchParams.append('filter', this.paging.filter);
            url.searchParams.append('prefix', this.paging.prefix);

            this.list = await window.std(url);
            this.loading.list = false;
        }
    },
    components: {
        TablerNone,
        File,
        Upload,
        PlusIcon,
        DotsVerticalIcon,
        NewFolder,
        FolderPlusIcon,
        NoAccess,
        SearchIcon,
        FileFilledIcon,
        FolderFilledIcon,
        TableFooter,
        TablerDelete,
        TablerBreadCrumb,
        TablerLoading
    }
}
</script>
