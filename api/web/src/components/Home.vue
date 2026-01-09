<template>
    <div>
        <div class='page-body'>
            <div
                class='container-xl'
            >
                <div v-if='!loading && !cards.length' class='empty-state py-5 text-center'>
                    <h1 class='mb-3'>Welcome to your Dashboard</h1>
                    <p class='lead text-muted mb-5'>Select a widget below to add it to your personal dashboard view.</p>

                    <div class='row justify-content-center'>
                        <div
                            v-for="widget in allWidgets"
                            :key="widget.name"
                            class='col-md-3 mb-4'
                        >
                            <div class='card h-100 widget-preview' @click='addCard(widget.name)'>
                                <div class='card-body text-center'>
                                    <component :is="widget.icon" size="48" stroke="1" class="mb-3" />
                                    <h3 class='card-title'>{{ widget.label }}</h3>
                                    <p>{{ widget.desc }}</p>
                                    <button class='btn btn-primary w-100'>Add Widget</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="!loading && cards.length > 0 && missingWidgets.length > 0" class="d-flex justify-content-end mb-3">
                    <div class="dropdown">
                        <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                           <IconPlus class="me-2" />Add Widget
                        </button>
                        <ul class="dropdown-menu">
                            <li v-for="widget in missingWidgets" :key="widget.name">
                                <a class="dropdown-item" href="#" @click.prevent="addCard(widget.name)">
                                     <component :is="widget.icon" size="20" stroke="1" class="me-2" />{{ widget.label }}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div
                    ref='gridstack'
                    class='grid-stack'
                >
                    <div
                        v-for='card in cards'
                        :key='card.id'
                        class='grid-stack-item'
                        :gs-x='card.x'
                        :gs-y='card.y'
                        :gs-w='card.w'
                        :gs-h='card.h'
                        :gs-id='card.id'
                    >
                        <div class='grid-stack-item-content'>
                            <template v-if='card.name === "Issues"'>
                                <IssuesCard
                                    :limit='5'
                                    :iam='props.iam'
                                    :auth='props.auth'
                                    :drag-handle='true'
                                    :create='false'
                                    :footer='false'
                                    :menu='true'
                                    @remove='removeCard(card.id)'
                                />
                            </template>
                            <template v-else-if='card.name === "Trainings"'>
                                <TrainingsCard
                                    :iam='props.iam'
                                    :auth='props.auth'
                                    :limit='5'
                                    order='asc'
                                    :attendance='false'
                                    :start='moment().subtract(1, "day").format()'
                                    :end='moment().add(1, "month").format()'
                                    :drag-handle='true'
                                    :create='false'
                                    :footer='false'
                                    :menu='true'
                                    @remove='removeCard(card.id)'
                                />
                            </template>
                            <template v-else-if='card.name === "Calendar"'>
                                <CalendarCard
                                    :limit='5'
                                    :iam='iam'
                                    :auth='auth'
                                    :drag-handle='true'
                                    :menu='true'
                                    @remove='removeCard(card.id)'
                                />
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, useTemplateRef, nextTick, computed } from 'vue';
import 'gridstack/dist/gridstack.min.css';
import IssuesCard from './cards/Issues.vue';
import TrainingsCard from './cards/Trainings.vue';
import CalendarCard from './cards/Calendar.vue';
import { GridStack } from 'gridstack';
import moment from 'moment';
import {
    IconAlertCircle,
    IconSchool,
    IconCalendar,
    IconPlus
} from '@tabler/icons-vue';

const props = defineProps({
    iam: {
        type: Object,
        required: true
    },
    auth: {
        type: Object,
        required: true
    }
});

const gridstack = useTemplateRef('gridstack');

const loading = ref(true);
const cards = ref([]);
let grid = null;

const allWidgets = [
    { name: 'Issues', label: 'Issues', icon: IconAlertCircle, desc: 'Track active missions and tasks.' },
    { name: 'Trainings', label: 'Trainings', icon: IconSchool, desc: 'View upcoming training events.' },
    { name: 'Calendar', label: 'Calendar', icon: IconCalendar, desc: 'View upcoming events on a calendar.' }
];

const missingWidgets = computed(() => {
    const currentNames = cards.value.map(c => c.name);
    return allWidgets.filter(w => !currentNames.includes(w.name));
});

const getPos = () => {
    let y = 0;
    while(true) {
        for (let x = 0; x <= 6; x++) {
             let hit = false;
             for (const card of cards.value) {
                 if (x < card.x + card.w && x + 6 > card.x && 
                     y < card.y + card.h && y + 4 > card.y) {
                     hit = true;
                     break;
                 }
             }
             if (!hit) return { x, y };
        }
        y++;
    }
}

const addCard = async (name) => {
    const pos = getPos();

    await window.std(`/api/user/${props.auth.id}/dashboard`, {
        method: 'POST',
        body: {
            name: name,
            x: pos.x,
            y: pos.y,
            w: 6,
            h: 4
        }
    });

    await loadCards();
}

const removeCard = async (id) => {
    await window.std(`/api/user/${props.auth.id}/dashboard/${id}`, {
        method: 'DELETE'
    });
    
    await loadCards();
}

const loadCards = async () => {
    if (grid) {
        grid.destroy(false);
    }

    const res = await window.std(`/api/user/${props.auth.id}/dashboard`);
    cards.value = res.items;

    await nextTick();

    if (cards.value.length) {
        grid = GridStack.init({
            column: 12,
            minRow: 1,
            margin: '10px',
            float: true,
            cellHeight: 200,
            disableOneColumnMode: true,
            resizable: {
                handles: 'e, se, s, sw, w'
            }
        }, gridstack.value);

        grid.on('change', async (event, items) => {
            for (const item of items) {
                await window.std(`/api/user/${props.auth.id}/dashboard/${item.id}`, {
                    method: 'PATCH',
                    body: {
                        x: item.x,
                        y: item.y,
                        w: item.w,
                        h: item.h
                    }
                })
            }
        });
    }
}

onMounted(async () => {
    await loadCards();
    loading.value = false;
});
</script>

<style>
.widget-preview {
    cursor: pointer;
    transition: transform 0.2s;
}
.widget-preview:hover {
    transform: translateY(-5px);
    border-color: #0d6efd;
}
</style>
