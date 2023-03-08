<template>
<div class="card">
    <div class="card-header">
        <div class="d-flex">
            <h3 class="card-title">Certificates</h3>
        </div>
    </div>
    <template v-if='!list.certs.length'>
        <None :create='false' label='Certificates'/>
    </template>
    <template v-else>
        <table class="table card-table table-vcenter">
            <thead>
                <tr>
                    <th>Name</th>
                    <th colspan="2">Expiry</th>
                </tr>
            </thead>
            <tbody>
                <tr :key='cert.id' v-for='cert in list.certs'>
                    <td><a @click='$router.push(`/certs/${cert.id}`)' v-text='cert.name' class='cursor-pointer'></a></td>
                    <td v-text='cert.expiry'></td>
                </tr>
            </tbody>
        </table>
    </template>
</div>
</template>

<script>
import None from '../util/None.vue';

export default {
    name: 'CertsCard',
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
            list: {
                total: 0,
                certs: []
            }
        }
    },
    mounted: async function() {
        await this.fetch();
    },
    methods: {
        fetch: async function() {
            const url = window.stdurl(`/api/user/${this.assigned}/certs`);
            url.searchParams.append('limit', this.limit);
            url.searchParams.append('page', this.page);

            this.list = await window.std(url);
        }
    },
    components: {
        None,
    }
}
</script>
