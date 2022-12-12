<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a @click='$router.push("/")' class='cursor-pointer'>Home</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="#">Calendar</a></li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div class="col-lg-12">
                    <div class="card">
                        <div class="card-body">
                            <div id='calendar' style='width: 100%; height: 500px;'></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <PageFooter/>
    <TablerError v-if='err' :err='err' @close='err = null'/>
</div>
</template>

<script>
import PageFooter from './PageFooter.vue';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import {
    TablerError
} from '@tak-ps/vue-tabler'

export default {
    name: 'Calendar',
    data: function() {
        return {
            err: false,
            calendar: null,
            sources: []
        }
    },
    components: {
        TablerError,
        PageFooter,
    },
    mounted: function() {
        this.calendar = new Calendar(document.getElementById('calendar'), {
            plugins: [dayGridPlugin, interactionPlugin, listPlugin],
            defaultView: 'dayGridMonth',
            selectable: true,
            unselectAuto: true,
            eventSources: []
        });
        this.calendar.render();

        this.fetchCalendars();
    },
    methods: {
        fetchCalendars: async function() {
            try {
                this.sources = await window.std('/api/calendar');
            } catch (err) {
                this.err = err;
            }
        }
    }
}
</script>

<style lang="scss">
#calendar {
    table {
        margin: 0px;
    }

    .fc-event{
        cursor: pointer;
    }

    table, tbody, tr {
        border-top: 0px;
    }
}
</style>
