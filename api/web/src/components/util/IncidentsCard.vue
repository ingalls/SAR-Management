<template>
    <div class='col-lg-12'>
        <div class='card'>
            <div class='card-header'>
                <h3 class='card-title'>Related Incidents</h3>
            </div>
            <TablerNone
                v-if='!incidents.length'
                label='Incidents'
                :create='false'
            />
            <div
                v-else
                class='list-group list-group-flush list-group-hoverable'
            >
                <div
                    v-for='incident in incidents'
                    :key='incident.id'
                    class='list-group-item'
                >
                    <div class='row align-items-center'>
                        <div class='col text-truncate'>
                            <div
                                class='text-reset d-block'
                                v-text='incident.title'
                            />
                            <div
                                class='d-block text-secondary text-truncate mt-n1'
                                v-text='incident.body'
                            />
                        </div>
                        <div class='col-auto'>
                            <TablerEpoch :date='incident.date' />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { TablerNone, TablerEpoch } from '@tak-ps/vue-tabler';

export default {
    name: 'IncidentsCard',
    components: {
        TablerNone,
        TablerEpoch
    },
    props: {
        incidents: {
            type: Array,
            required: true
        }
    }
}
</script>
