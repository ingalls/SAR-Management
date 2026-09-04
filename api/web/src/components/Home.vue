<template>
    <div>
        <div class='page-body'>
            <div
                class='container-xl'
            >
                <div
                    v-if='!loading && !cards.length'
                    class='empty-state py-5 text-center'
                >
                    <h1 class='mb-3'>
                        Welcome to your Dashboard
                    </h1>
                    <p class='lead text-muted mb-4'>
                        Your dashboard is empty. Browse the widget explorer to build your personal view.
                    </p>
                    <button
                        class='btn btn-primary btn-lg'
                        @click='explorer = true'
                    >
                        <IconLayoutGridAdd
                            class='me-2'
                            :size='24'
                            :stroke='1.5'
                        />
                        Browse Widgets
                    </button>
                </div>

                <div
                    v-if='!loading && cards.length > 0'
                    class='d-flex justify-content-end mb-3'
                >
                    <button
                        class='btn btn-outline-primary'
                        type='button'
                        :disabled='!missingWidgets.length'
                        @click='explorer = true'
                    >
                        <IconLayoutGridAdd
                            class='me-2'
                            :size='20'
                            :stroke='1.5'
                        />
                        Add Widget
                    </button>
                </div>

                <div
                    ref='gridstack'
                    class='d-flex grid-stack'
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
                            <template v-else-if='card.name === "OnCall"'>
                                <OnCallCard
                                    :iam='props.iam'
                                    :auth='props.auth'
                                    :drag-handle='true'
                                    :menu='true'
                                    @remove='removeCard(card.id)'
                                />
                            </template>
                            <template v-else-if='card.name === "MissionRate"'>
                                <MissionMiniCard
                                    :iam='props.iam'
                                    :auth='props.auth'
                                    :assigned='props.auth.id'
                                    label='My Mission Rate'
                                    :drag-handle='true'
                                    :menu='true'
                                    @remove='removeCard(card.id)'
                                />
                            </template>
                            <template v-else-if='card.name === "TrainingRate"'>
                                <TrainingMiniCard
                                    :iam='props.iam'
                                    :auth='props.auth'
                                    :assigned='props.auth.id'
                                    label='My Training Rate'
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

        <WidgetExplorer
            v-if='explorer'
            :added='cards.map(c => c.name)'
            @add='addCard($event)'
            @close='explorer = false'
        />
    </div>
</template>

<script setup>
import { ref, onMounted, useTemplateRef, nextTick, computed } from 'vue';
import 'gridstack/dist/gridstack.min.css';
import IssuesCard from './cards/Issues.vue';
import TrainingsCard from './cards/Trainings.vue';
import CalendarCard from './cards/Calendar.vue';
import OnCallCard from './cards/OnCall.vue';
import MissionMiniCard from './cards/MissionsMini.vue';
import TrainingMiniCard from './cards/TrainingMini.vue';
import WidgetExplorer from './Home/WidgetExplorer.vue';
import widgets from './Home/widgets.js';
import { GridStack } from 'gridstack';
import moment from 'moment';
import { IconLayoutGridAdd } from '@tabler/icons-vue';

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
const explorer = ref(false);
const cards = ref([]);
let grid = null;

const missingWidgets = computed(() => {
    const currentNames = cards.value.map(c => c.name);
    return widgets.filter(w => !currentNames.includes(w.name));
});

const addCard = async (widget) => {
    const w = widget.w || 6;
    const h = widget.h || 4;
    let x = 0;
    let y = 0;

    if (grid) {
        let found = false;
        for (let checkY = 0; checkY < 100; checkY++) {
            for (let checkX = 0; checkX <= 12 - w; checkX++) {
                if (grid.isAreaEmpty(checkX, checkY, w, h)) {
                    x = checkX;
                    y = checkY;
                    found = true;
                    break;
                }
            }
            if (found) break;
        }
    }

    await window.std(`/api/user/${props.auth.id}/dashboard`, {
        method: 'POST',
        body: {
            name: widget.name,
            x: x,
            y: y,
            w: w,
            h: h
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
    const res = await window.std(`/api/user/${props.auth.id}/dashboard`);
    cards.value = res.items;

    await nextTick();

    if (grid) {
        grid.destroy(false);
        grid = null;
    }

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
