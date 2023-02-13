<template>
<div class='card'>
    <div v-if='title' class='card-header' v-text='title'></div>
    <div class='card-body'>
        <div class='d-flex justify-content-center' :class='{
            "mt-4 mb-2": !compact
        }'>
            <EyeOffIcon v-if='compact' width='32' height='32' />
            <EyeOffIcon v-else width='48' height='48' />
        </div>

        <div class='text-center' :class='{
            "mb-4 mt-2": !compact
        }'>
            <div>Insufficient Access</div>
        </div>
    </div>
</div>
</template>

<script>
import {
    EyeOffIcon
} from 'vue-tabler-icons'

export default {
    name: 'NoAccess',
    props: {
        title: String,
        compact: {
            type: Boolean,
            default: false
        }
    },
    components: {
        EyeOffIcon
    }
}
</script>
