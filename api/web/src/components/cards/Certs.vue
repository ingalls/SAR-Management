<template>
    <NoAccess
        v-if='!is_iam("User:View")'
        title='Certificates'
    />
    <div v-else class='card'>
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

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
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

const props = defineProps({
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
})

const page = ref(0)
const upload = ref(null)
const list = reactive({
    total: 0,
    items: []
})

const is_iam = (permission) => iam(props.iam, props.auth, permission)

const fetch = async () => {
    const url = window.stdurl(`/api/user/${props.assigned}/cert`);
    url.searchParams.append('limit', props.limit);
    url.searchParams.append('page', page.value);

    const result = await window.std(url);
    list.total = result.total;
    list.items = result.items;
}

watch(page, async () => {
    await fetch();
})

watch(upload, async () => {
    await fetch();
})

onMounted(async () => {
    if (is_iam("User:View")) {
        await fetch();
    }
})
</script>
