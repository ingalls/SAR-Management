<template>
    <div class='card'>
        <div class='card-body'>
            <div class='d-flex'>
                <h3 class='card-title'>
                    Top User Groups
                </h3>

                <div class='ms-auto'>
                    <div class='btn-list'>
                        <TablerSelect
                            :default='current'
                            :values='["Category", "Agency", "SubAgency", "Title", "ZipCode"]'
                            @select='fetch($event)'
                        />

                        <button
                            data-bs-toggle='dropdown'
                            type='button'
                            class='btn dropdown-toggle dropdown-toggle-split'
                            aria-expanded='false'
                        />
                        <div
                            class='dropdown-menu dropdown-menu-end'
                            style=''
                        >
                            <a
                                class='dropdown-item'
                                href='#'
                                @click='getExport'
                            >Export</a>
                        </div>
                    </div>
                </div>
            </div>
            <div class='row'>
                <table class='table card-table table-hover table-vcenter'>
                    <thead>
                        <tr>
                            <th>User Group</th>
                            <th colspan='2'>
                                Users
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for='a in agg'
                            :key='a.name'
                        >
                            <td v-text='a.name' />
                            <td v-text='a.count' />
                            <td class='w-50'>
                                <div class='progress progress-xs'>
                                    <div
                                        class='progress-bar bg-primary'
                                        :style='`width: ${a.percent * 100}%;`'
                                    />
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { 
    TablerSelect
} from '@tak-ps/vue-tabler';

const agg = ref({})
const current = ref('Agency')
const convert = reactive({
    Category: 'businesscategory',
    Agency: 'o',
    SubAgency: 'ou',
    Title: 'title',
    ZipCode: 'postalcode'
})

const fetch = async (newCurrent) => {
    if (current.value === newCurrent) return;
    if (newCurrent) current.value = newCurrent;

    const aggData = await window.std(`/api/aggregate/${convert[current.value]}`);

    let aggs = [];
    let total = 0;
    for (const name in aggData) {
        total += aggData[name];
        aggs.push({
            name,
            count: aggData[name]
        });
    }

    agg.value = aggs.map((aggItem) => {
        aggItem.percent = aggItem.count / total;
        return aggItem;
    }).sort((a, b) => {
        return b.percent - a.percent;
    }).splice(0, 6);
}

const getExport = async () => {
    const url = new URL('/api/total/export', window.location.origin);
    // Allow serving through Vue for hotloading
    if (url.hostname === 'localhost') url.port = '4999'
    window.open(url, "_blank")
}

onMounted(() => {
    fetch();
})
</script>
