<template>
    <div v-if='user.profile_id' :style='`background-image: url(${base}/api/asset/${user.profile_id}/raw?token=${token});`' style='width: 100%; height: 400px; background-size: cover;'></div>
    <div v-else style='background-image: url(/user.webp); width: 100%; height: 400px; background-size: contain; background-repeat: no-repeat;'></div>
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
