<template>
<div>
    <span class="avatar avatar-xs me-2 avatar-rounded" :style='`background-image: url(${base}/api/user/${user.uid || user.id}/profile?token=${token}`'></span>
    <span v-if='user.name'>
        <a v-if='link' @click='$router.push(`/user/${user.uid || user.id}`)' class='cursor-pointer' v-text='user.name'></a>
        <span v-else v-text='user.name'/>
    </span>
    <span v-else>
        <a v-if='link' @click='$router.push(`/user/${user.uid || user.id}`)' class='cursor-pointer' v-text='`${user.fname} ${user.lname}`'></a>
        <span v-else v-text='`${user.fname} ${user.lname}`'/>
    </span>
</div>
</template>

<script>
export default {
    name: 'Avatar',
    props: {
        user: {
            type: Object,
            required: true
        },
        link: {
            type: Boolean,
            default: false
        }
    },
    data: function() {
        return {
            token: localStorage.token,
            base: window.stdurl('/').origin,
        }
    }
}
</script>
