<template>
    <div class='card'>
        <div class='card-body'>
            <div class='d-flex'>
                <h3
                    class='subheader'
                    v-text='label'
                />

                <div class='ms-auto'>
                    <h3
                        class='subheader'
                        v-text='Math.round(percent * 100) + "%"'
                    />
                </div>
            </div>
            <TablerLoading v-if='loading' />
            <template v-else>
                <TablerProgress
                    :key='percent'
                    :percent='percent'
                />
            </template>
            <div class='d-flex'>
                <h3
                    class='subheader mt-2'
                    v-text='`${attended} of ${total} required trainings`'
                />
                <div class='ms-auto btn-list mt-1'>
                    <TablerSelect
                        v-model='range'
                        :options='["Current Year", "1st Quarter", "2nd Quarter", "3rd Quarter", "4th Quarter", "All Time"]'
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {
    TablerSelect,
    TablerLoading,
    TablerProgress
} from '@tak-ps/vue-tabler';
import moment from 'moment';

export default {
    name: 'TrainingCardMini',
    components: {
        TablerSelect,
        TablerLoading,
        TablerProgress
    },
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
            range: 'Current Year',
            loading: true,
            total: 0,
            attended: 0,
            percent: 0
        }
    },
    watch: {
        range: async function() {
            await this.fetch();
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

            if (this.range.includes('Quarter')) {
                const q = parseInt(this.range[0]);
                const { start, end } = this.getQuarterRange(q);
                url.searchParams.append('start', start);
                url.searchParams.append('end', end);
            } else if (this.range !== 'All Time') {
                url.searchParams.append('start', moment().format('YYYY') + '-01-01');
                url.searchParams.append('end', moment().format('YYYY-MM-DD'));
            }

            this.total = (await window.std(url)).total;

            url.searchParams.delete('required');
            url.searchParams.append('assigned', this.assigned);

            this.attended = (await window.std(url)).total;

            if (this.total === 0) this.percent = 1;
            else this.percent = this.attended / this.total;

            this.loading = false;
        },
        getQuarterRange: function(quarter) {
            const start = moment().quarter(quarter).startOf('quarter').format('YYYY-MM-DD');
            const end = moment().quarter(quarter).endOf('quarter').format('YYYY-MM-DD');
            return {start, end};
        }
    }
}
</script>
