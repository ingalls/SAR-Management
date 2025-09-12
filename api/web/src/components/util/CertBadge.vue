<template>
    <span class='badge badge-outline text-blue'>
        <span v-text='cert.name' />
    </span>
</template>

<script>
export default {
    name: 'CertBadge',
    props: {
        cert: {
            type: Object,
            required: true
        }
    }
}
</script>