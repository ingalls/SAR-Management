<template>
<div>
    <span class="avatar avatar-xs me-2 avatar-rounded" style="background-image: url(./static/avatars/000m.jpg)"></span>
    <span v-if='user.name'><a @click='$router.push(`/user/${user.uid || user.id}`)' class='cursor-pointer' v-text='user.name'></a></span>
    <span v-else><a @click='$router.push(`/user/${user.uid || user.id}`)' class='cursor-pointer' v-text='`${user.fname} ${user.lname}`'></a></span>
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
