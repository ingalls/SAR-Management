<template>
    <span
        class='badge'
        style='height: 20px;'
        :style='{
            backgroundColor: team.colour_bg,
            color: team.colour_txt
        }'
        v-text='team.name'
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
