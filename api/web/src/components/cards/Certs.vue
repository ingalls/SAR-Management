<template>
    <div class='card'>
        <div class='card-header'>
            <div class='col'>
                <div class='d-flex'>
                    <h3 class='card-title'>
                        Certificates
                    </h3>

                    <div class='ms-auto'>
                        <PlusIcon
                            v-if='$route.name === "profile"'
                            class='cursor-pointer'
                            @click='upload = true'
                        />
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
import {
    TablerNone 
} from '@tak-ps/vue-tabler';
import UploadCertificate from '../util/UploadCertificate.vue';
import {
    PlusIcon
} from 'vue-tabler-icons'

export default {
    name: 'CertsCard',
    components: {
        TablerNone,
        UploadCertificate,
        PlusIcon
    },
    props: {
        limit: {
            type: Number,
            default: 10
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
        upload: async function() {
            await this.fetch();
        }
    },
    mounted: async function() {
        await this.fetch();
    },
    methods: {
        fetch: async function() {
            const url = window.stdurl(`/api/user/${this.assigned}/cert`);
            url.searchParams.append('limit', this.limit);
            url.searchParams.append('page', this.page);

            this.list = await window.std(url);
        }
    }
}
</script>
