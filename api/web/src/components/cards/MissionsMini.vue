<template>
<div class="card">
    <div class="card-body">
        <div class='d-flex'>
            <h3 class="subheader" v-text='label'></h3>

            <div class='ms-auto'>
                <h3 class="subheader" v-text='Math.round(percent * 100) + "%"'></h3>
            </div>
        </div>
        <template v-if='loading'>
            <TablerLoading/>
        </template>
        <template v-else>
            <TablerProgress :key='percent' :percent='percent'/>
        </template>
        <h3 class="mt-2 subheader" v-text='`${this.attended} of ${this.total} Missions`'></h3>
    </div>
</div>
</template>

<script>
import {
    TablerLoading,
    TablerProgress
} from '@tak-ps/vue-tabler';

export default {
    name: 'MissionCardMini',
    props: {
        label: {
            type: String,
            default: 'Annual Mission Rate'
        },
        assigned: {
            type: Number,
            default: null
        }
    },
    data: function() {
        return {
            loading: true,
            total: 0,
            attended: 0,
            percent: 0
        }
    },
    mounted: async function() {
        await this.fetch();
    },
    methods: {
        fetch: async function() {
            this.loading = true;
            const url = window.stdurl('/api/mission');
            url.searchParams.append('limit', 1);

            this.total = (await window.std(url)).total;

            url.searchParams.append('assigned', this.assigned);

            this.attended = (await window.std(url)).total;

            if (this.total === 0) this.percent = 1;
            else this.percent = this.attended / this.total;

            this.loading = false;
        }
    },
    components: {
        TablerLoading,
        TablerProgress
    }
}
</script>
