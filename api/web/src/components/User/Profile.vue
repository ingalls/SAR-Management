<template>
    <div>
        <template v-if='none'>
            <div />
        </template>
        <template v-else-if='bgstyle === "contain"'>
            <div
                :style='`background-image: url(${base}/api/user/${userid}/profile?token=${token}&cache=${cache});`'
                style='width: 100%; height: 400px; background-size: contain; background-repeat: no-repeat'
            />
        </template>
        <template v-else>
            <div
                :style='`background-image: url(${base}/api/user/${userid}/profile?token=${token}&cache=${cache});`'
                style='width: 100%; height: 400px; background-size: cover; background-position: center;'
            />
        </template>
    </div>
</template>

<script>
export default {
    name: 'UserProfile',
    props: {
        userid: Number,
        cache: {
            type: Number,
            default: +new Date()
        }, //for forcing refresh
        bgstyle: {
            type: String,
            default: 'contain' // or cover
        }
    },
    data: function() {
        return {
            none: false,
            token: localStorage.token,
            base: window.stdurl('/').origin,
        }
    },
    watch: {
        cache: function() {
            this.none = true;
            this.$nextTick(() => { this.none = false; });
        }
    },
}
</script>
