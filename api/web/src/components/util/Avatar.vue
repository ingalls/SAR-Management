<template>
<div>
    <span class="avatar avatar-xs me-2 avatar-rounded" style="background-image: url(./static/avatars/000m.jpg)"></span>
    <span v-if='user.name' v-text='`${user.name}`'/>
    <span v-else v-text='`${user.fname} ${user.lname}`'/>
</div>
</template>

<script>
export default {
    name: 'Avatar',
    props: {
        user: {
            type: Object,
            required: true
        }
    }
}
</script>
