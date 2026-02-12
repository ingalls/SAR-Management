<template>
    <div class='card'>
        <div class='card-header'>
            <h3 class='card-title'>
                Heartbeats
            </h3>
        </div>
        <div class='table-responsive'>
            <table class='table card-table table-vcenter'>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th />
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Training Update Pulse</td>
                        <td>
                            <div class='d-flex justify-content-end'>
                                <TablerIconButton
                                    title='Trigger Heartbeat'
                                    @click='trigger("training")'
                                >
                                    <IconPlayerPlay />
                                </TablerIconButton>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import {
    TablerIconButton
} from '@tak-ps/vue-tabler';
import {
    IconPlayerPlay
} from '@tabler/icons-vue';

const trigger = async (type) => {
    await window.std(`/api/heartbeat/${type}`, {
        method: 'POST'
    });
}
</script>
