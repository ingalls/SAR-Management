<template>
    <div
        :class='{
            "card": title
        }'
    >
        <div
            v-if='title'
            class='card-header'
            v-text='title'
        />
        <div class='card-body'>
            <div
                class='d-flex justify-content-center'
                :class='{
                    "mt-4 mb-2": !compact
                }'
            >
                <IconEyeOff
                    v-if='compact'
                    :size='32'
                    stroke='1'
                />
                <IconEyeOff
                    v-else
                    :size='32'
                    stroke='1'
                />
            </div>

            <div
                class='text-center'
                :class='{
                    "mb-4 mt-2": !compact
                }'
            >
                <div>Insufficient Access</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {
    IconEyeOff
} from '@tabler/icons-vue'

defineProps({
    title: String,
    compact: {
        type: Boolean,
        default: false
    }
})
</script>
