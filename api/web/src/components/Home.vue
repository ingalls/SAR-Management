<template>
    <div>
        <div class='page-body'>
            <div
                class='container-xl'
            >
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
                                />
                            </template>
                            <template v-else-if='card.name === "Calendar"'>
                                <CalendarCard
                                    :limit='5'
                                    :iam='iam'
                                    :auth='auth'
                                    :drag-handle='true'
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
import { ref, onMounted, useTemplateRef } from 'vue';
import 'gridstack/dist/gridstack.min.css';
import IssuesCard from './cards/Issues.vue';
import TrainingsCard from './cards/Trainings.vue';
import CalendarCard from './cards/Calendar.vue';
import { GridStack } from 'gridstack';
import moment from 'moment';

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

const cards = ref([{
    id: 1,
    name: 'Issues',
    x: 0,
    y: 0,
    w: 6,
    h: 2,
},{
    id: 2,
    name: 'Trainings',
    x: 6,
    y: 0,
    w: 6,
    h: 2
}]);

onMounted(() => {
    GridStack.init({
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
});
</script>
