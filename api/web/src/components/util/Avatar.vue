<template>
    <div>
        <span
            class='avatar avatar-xs me-2 avatar-rounded'
            :style='`background-image: url(${base}/api/user/${user.uid || user.id}/profile?token=${token}`'
        />
        <span v-if='user.name'>
            <a
                v-if='link'
                class='cursor-pointer'
                @click='$router.push(`/user/${user.uid || user.id}`)'
                v-text='user.name'
            />
            <span
                v-else
                v-text='user.name'
            />
        </span>
        <span v-else>
            <a
                v-if='link'
                :style='{
                    color: color
                }'
                class='cursor-pointer'
                @click='$router.push(`/user/${user.uid || user.id}`)'
                v-text='`${user.fname} ${user.lname}`'
            />
            <span
                v-else
                v-text='`${user.fname} ${user.lname}`'
            />
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
        color: {
            type: String,
            default: 'rgb(0, 67, 133)'
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
