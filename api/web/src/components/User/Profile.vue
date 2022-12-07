<template>
    <img v-if='user.profile_id' :src='`${base}/api/asset/${user.profile_id}/raw?token=${token}`' style='width: 100%;'/>
    <img v-else src='/user.webp' class='width: 100%;'/>
</template>

<script>
export default {
    name: 'UserProfile',
    props: {
        user: Object
    },
    data: function() {
        return {
            token: localStorage.token,
            base: window.stdurl('/').origin,
        }
    },
}
</script>
