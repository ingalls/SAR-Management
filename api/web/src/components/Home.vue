<template>
<div>
    <div class='page-body'>
        <div class='container-xl'>
            <Draggable v-model="cards" itemKey='id' class='row row-cards'>
                <template #item="{element}">
                    <div :class='`col-12 col-lg-${element.size}`' v-if='element.name === "Issues"'>
                        <IssuesCard
                            v-if='is_iam("Issue:View")'
                            :limit='5'
                            :iam='iam'
                            :auth='auth'
                            :drag='true'
                        />
                        <NoAccess title='Recent Issues' v-else/>
                    </div>
                    <div :class='`col-12 col-lg-${element.size}`' v-else-if='element.name === "Trainings"'>
                        <TrainingsCard v-if='is_iam("Training:View")' :limit='5'/>
                        <NoAccess title='Upcoming Trainings' v-else/>
                    </div>
                    <div :class='`col-12 col-lg-${element.size}`' v-else-if='element.name === "Calendar"'>
                        <CalendarCard
                            v-if='is_iam("Training:View")' :limit='5'
                            :iam='iam'
                            :auth='auth'
                        />
                    </div>
                </template>
            </Draggable>
        </div>
    </div>
</div>
</template>

<script>
import iam from '../iam.js';
import IssuesCard from './cards/Issues.vue';
import TrainingsCard from './cards/Trainings.vue';
import CalendarCard from './cards/Calendar.vue';
import NoAccess from './util/NoAccess.vue';
import Draggable from 'vuedraggable';

export default {
    name: 'Home',
    props: {
        iam: {
            type: Object,
            required: true
        },
        auth: {
            type: Object,
            required: true
        }
    },
    data: function() {
        return {
            cards: [{
                id: 1,
                size: 6,
                name: 'Issues'
            },{
                id: 2,
                size: 6,
                name: 'Trainings'
            }]
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) }
    },
    components: {
        Draggable,
        IssuesCard,
        CalendarCard,
        TrainingsCard,
        NoAccess
    }
}
</script>
