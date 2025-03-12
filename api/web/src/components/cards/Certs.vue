<template>
    <NoAccess
        v-if='!is_iam("User:View")'
        title='Certificates'
    />
    <div class='card'>
        <div class='card-header'>
            <div class='col'>
                <div class='d-flex'>
                    <h3 class='card-title'>
                        Certificates
                    </h3>

                    <div class='ms-auto'>
                        <TablerIconButton
                            v-if='$route.name === "profile" || is_iam("User:Manage")'
                            title='Upload Certificate'
                            @click='upload = true'
                        >
                            <IconPlus
                                :size='32'
                                stroke='1'
                            />
                        </TablerIconButton>
                    </div>
                </div>
            </div>
        </div>
        <template v-if='!list.items.length'>
            <TablerNone
                :create='false'
                label='Certificates'
            />
        </template>
        <template v-else>
            <table class='table table-hover card-table table-vcenter'>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th colspan='2'>
                            Expiry
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for='cert in list.items'
                        :key='cert.id'
                    >
                        <td>
                            <a
                                class='cursor-pointer'
                                @click='$router.push(`/user/${cert.uid}/cert/${cert.id}`)'
                                v-text='cert.name'
                            />
                        </td>
                        <td v-text='cert.expiry || "None"' />
                    </tr>
                </tbody>
            </table>
        </template>

        <TableFooter
            :limit='limit'
            :total='list.total'
            @page='page = $event'
        />

        <UploadCertificate
            v-if='upload'
            :uid='assigned'
            @err='error($event)'
            @close='upload = null'
            @upload='upload = null; fetch($event)'
        />
    </div>
</template>

<script>
import iam from '../../iam.js';
import {
    TablerNone ,
    TablerIconButton
} from '@tak-ps/vue-tabler';
import NoAccess from '../util/NoAccess.vue';
import UploadCertificate from '../util/UploadCertificate.vue';
import TableFooter from '../util/TableFooter.vue';
import {
    IconPlus
} from '@tabler/icons-vue'

export default {
    name: 'CertsCard',
    components: {
        TablerNone,
        TableFooter,
        TablerIconButton,
        UploadCertificate,
        NoAccess,
        IconPlus
    },
    props: {
        limit: {
            type: Number,
            default: 10
        },
        iam: {
            type: Object,
            required: true
        },
        auth: {
            type: Object,
            required: true
        },
        assigned: {
            type: Number,
            default: null
        }
    },
    data: function() {
        return {
            page: 0,
            upload: null,
            list: {
                total: 0,
                items: []
            }
        }
    },
    watch: {
        page: async function() {
            await this.fetch();
        },
        upload: async function() {
            await this.fetch();
        }
    },
    mounted: async function() {
        if (this.is_iam("User:View")) {
            await this.fetch();
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        fetch: async function() {
            const url = window.stdurl(`/api/user/${this.assigned}/cert`);
            url.searchParams.append('limit', this.limit);
            url.searchParams.append('page', this.page);

            this.list = await window.std(url);
        }
    }
}
</script>
