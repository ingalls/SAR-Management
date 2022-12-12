<template>
<div class="card">
    <div class="card-body">
        <h3 class="subheader" v-text='label'></h3>
        <TablerProgress :progress='attended / total'/>
    </div>

</div>
</template>

<script>
import {
    TablerProgress
} from '@tak-ps/vue-tabler';

export default {
    name: 'MissionCardMini',
    props: {
        label: {
            type: String,
            default: 'Mission Rate'
        },
        assigned: {
            type: Number,
            default: null
        }
    },
    data: function() {
        return {
            total: 0,
            attended: 0
        }
    },
    mounted: function() {
        this.fetch();
    },
    methods: {
        fetch: async function() {
            try {
                const url = window.stdurl('/api/mission');
                url.searchParams.append('limit', 1);

                this.total = (await window.std(url)).total;

                url.searchParams.append('assigned', this.assigned);

                this.attended = (await window.std(url)).total;
            } catch (err) {
                this.$emit('err', err);
            }
        }
    },
    components: {
        TablerProgress
    }
}
</script>
