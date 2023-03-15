<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a @click='$router.push("/")' class='cursor-pointer'>Home</a></li>
                            <li class="breadcrumb-item" :class='{
                                active: paging.prefix === ""
                            }'><a @click='paging.prefix = ""' class='cursor-pointer'>Docs</a></li>
                            <li :key='fit' v-for='(folder, fit) of paging.prefix.substring(0, paging.prefix.length - 1).split("/")' class="breadcrumb-item" :class='{
                                active: fit === paging.prefix.substring(0, paging.prefix.length - 1).split("/").length - 1
                            }'><a @click='paging.prefix = paging.prefix.substring(0, paging.prefix.length - 1).split("/").splice(0, fit).join("/") + "/"' class='cursor-pointer' v-text='folder.replace("/", )'></a></li>
                        </ol>

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
                        @delete='file = null;'
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
                                    <div class='btn-list'>
                                        <div v-if='is_iam("Doc:Manage")' class='ms-auto'>
                                            <PlusIcon @click='upload = true' class='cursor-pointer my-1'/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <table class="table card-table table-vcenter">
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
                                    <td v-text='doc.last_modified'></td>
                                </tr>
                            </tbody>
                        </table>
                        <template v-if='!list.total'>
                            <None label='Documents' :create='false'/>
                        </template>
                        <TableFooter :limit='paging.limit' :total='list.total' @page='paging.page = $event'/>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Upload
        v-if='upload'
        url='api/doc'
        :prefix='paging.prefix'
        @err='error($event)'
        @close='upload = null'
        @upload='upload = null; listDocs($event)'
    />
</div>
</template>

<script>
import iam from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import None from './util/None.vue';
import TableFooter from './util/TableFooter.vue';
import Upload from './util/Upload.vue';
import File from './Docs/File.vue';
import {
    TablerLoading
} from '@tak-ps/vue-tabler';
import {
    PlusIcon,
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
       'paging.page': async function() {
           await this.listDocs();
       },
       'paging.filter': async function() {
           await this.listDocs();
       },
       'paging.prefix': async function() {
           await this.listDocs();
       },
       'file': async function() {
           await this.listDocs();
       }
    },
    mounted: async function() {
        if (this.is_iam("Doc:View")) await this.listDocs();
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        human(size) {
            var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
            return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
        },
        error: function($event) {
            this.upload = null;
            throw $event;
        },
        listDocs: async function() {
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
        None,
        File,
        Upload,
        PlusIcon,
        NoAccess,
        SearchIcon,
        FileFilledIcon,
        FolderFilledIcon,
        TableFooter,
        TablerLoading
    }
}
</script>
