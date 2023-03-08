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
    </div>
</div>
</template>

<script>
import {
    TablerLoading,
    TablerProgress
} from '@tak-ps/vue-tabler';

export default {
    name: 'TrainingCardMini',
    props: {
        label: {
            type: String,
            default: 'Annual Training Rate (To Date)'
        },
        assigned: {
            type: Number,
            default: null
        },
    },
    data: function() {
        return {
            loading: true,
            percent: 0
        }
    },
    mounted: async function() {
        await this.fetch();
    },
    methods: {
        fetch: async function() {
            this.loading = true;
            const url = window.stdurl('/api/training');
            url.searchParams.append('limit', 1);
            url.searchParams.append('required', 'true');
            url.searchParams.append('end', +new Date());

            const total = (await window.std(url)).total;

            url.searchParams.delete('required');
            url.searchParams.append('assigned', this.assigned);

            const attended = (await window.std(url)).total;

            if (total === 0) this.percent = 1;
            else this.percent = attended / total;

            this.loading = false;
        }
    },
    components: {
        TablerLoading,
        TablerProgress
    }
}
</script>
