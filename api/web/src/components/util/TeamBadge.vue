<template>
    <span
        class="badge"
        v-text='team.name'
        :style='{
            backgroundColor: team.colour_bg,
            color: team.colour_txt
        }'
    />
</template>

<script>
export default {
    name: 'TeamBadge',
    props: {
        team: {
            type: Object,
            required: true
        }
    }
}
</script>
