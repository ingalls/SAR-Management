<template>
    <footer
        class='footer footer-transparent d-print-none'
        :class='{ "footer-fixed": isLoginPage }'
    >
        <div class='container-xl'>
            <div class='row text-center align-items-center flex-row-reverse'>
                <div class='col-lg-auto ms-lg-auto'>
                    <ul class='list-inline list-inline-dots mb-0'>
                        <li class='list-inline-item'>
                            <a
                                href='/docs/'
                                class='link-secondary'
                            >Documentation</a>
                        </li>
                        <li class='list-inline-item'>
                            <a
                                href='https://github.com/ingalls/SAR-Management'
                                target='_blank'
                                class='link-secondary'
                                rel='noopener'
                            >Source code</a>
                        </li>
                    </ul>
                </div>
                <div class='col-12 col-lg-auto mt-3 mt-lg-0'>
                    <ul class='list-inline list-inline-dots mb-0'>
                        <li class='list-inline-item'>
                            Copyright © 2026
                            <a
                                href='https://ingalls.ca'
                                class='link-secondary'
                            >Nick Ingalls</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </footer>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isLoginPage = computed(() => route.path.includes('/login'));
</script>

<style scoped>
.footer-fixed {
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    z-index: 1000 !important;
    background: transparent !important;
    background-color: transparent !important;
}

.footer-fixed :deep(.link-secondary) {
    color: rgba(255, 255, 255, 0.8) !important;
}

.footer-fixed :deep(.link-secondary:hover) {
    color: rgba(255, 255, 255, 1) !important;
}
</style>
