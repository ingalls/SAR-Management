<template>
    <div class='z2 fixed top right bottom left scroll-auto bg-darken50 shadow-darken25'>
        <div class='flex flex--center-main pt36'>
            <div class='flex-child bg-white round relative w600'>
                <button
                    class='absolute top right px12 py12'
                    @click='$emit("close")'
                >
                    <svg class='icon link color-darken50'><use xlink:href='#icon-close' /></svg>
                </button>

                <div class='col col--12 grid px12 py12'>
                    <slot />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Modal',
}
</script>
