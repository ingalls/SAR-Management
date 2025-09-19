<template>
    <div>
        <div class='page-body'>
            <div class='container-xl'>
                <Draggable
                    v-model='cards'
                    item-key='id'
                    handle='.drag-handle'
                    class='row row-cards'
                >
                    <template #item='{element}'>
                        <div
                            v-if='element.name === "Issues"'
                            :class='`col-12 col-lg-${element.size}`'
                        >
                            <IssuesCard
                                :limit='5'
                                :iam='iam'
                                :auth='auth'
                                :drag-handle='true'
                                :create='false'
                                :footer='false'
                            />
                        </div>
                        <div
                            v-else-if='element.name === "Trainings"'
                            :class='`col-12 col-lg-${element.size}`'
                        >
                            <TrainingsCard
                                :iam='iam'
                                :auth='auth'
                                :limit='5'
                                order='asc'
                                :attendance='false'
                                :start='moment().subtract(1, "day").format()'
                                :end='moment().add(1, "month").format()'
                                :drag-handle='true'
                                :create='false'
                                :footer='false'
                            />
                        </div>
                        <div
                            v-else-if='element.name === "Calendar"'
                            :class='`col-12 col-lg-${element.size}`'
                        >
                            <CalendarCard
                                v-if='is_iam("Training:View")'
                                :limit='5'
                                :iam='iam'
                                :auth='auth'
                                :drag-handle='true'
                            />
                        </div>
                    </template>
                </Draggable>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import iam from '../iam.js'
import IssuesCard from './cards/Issues.vue'
import TrainingsCard from './cards/Trainings.vue'
import CalendarCard from './cards/Calendar.vue'
import Draggable from 'vuedraggable'
import moment from 'moment'

const props = defineProps({
    iam: {
        type: Object,
        required: true
    },
    auth: {
        type: Object,
        required: true
    }
})

const cards = ref([{
    id: 1,
    size: 6,
    name: 'Issues'
},{
    id: 2,
    size: 6,
    name: 'Trainings'
}])

const is_iam = (permission) => iam(props.iam, props.auth, permission)
</script>
