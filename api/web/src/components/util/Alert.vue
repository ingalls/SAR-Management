<template>
    <div class='card'>
        <div class='card-body'>
            <div
                class='d-flex justify-content-center'
                :class='{
                    "mt-4 mb-2": !compact
                }'
            >
                <IconAlertTriangle
                    v-if='compact'
                    :size='32'
                    stroke='1'
                />
                <IconAlertTriangle
                    v-else
                    :size='48'
                    stroke='1'
                />
            </div>

            <div
                class='text-center'
                :class='{
                    "mb-4 mt-2": !compact
                }'
            >
                <div><span v-text='label' /></div>
            </div>
        </div>
    </div>
</template>

<script>
import {
    IconAlertTriangle
} from '@tabler/icons-vue'

export default {
    name: 'Alert',
    components: {
        IconAlertTriangle
    },
    props: {
        label: {
            type: String,
            default: 'Something is amiss'
        },
        compact: {
            type: Boolean,
            default: false
        },
    }
}
</script>
