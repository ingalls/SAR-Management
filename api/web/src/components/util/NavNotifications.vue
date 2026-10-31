<template>
    <TablerDropdown :width='340'>
        <template #default>
            <button
                type='button'
                class='nav-icon-btn'
                :class='{ "nav-icon-btn--active": list.total }'
                title='Notifications'
                aria-label='Notifications'
            >
                <IconBell
                    :size='22'
                    :stroke='1.5'
                />
                <span
                    v-if='list.total'
                    class='nav-icon-btn__count'
                    v-text='list.total > 99 ? "99+" : list.total'
                />
            </button>
        </template>
        <template #dropdown>
            <div class='nav-menu'>
                <div class='nav-menu__header'>
                    <span class='nav-menu__title'>Notifications</span>
                    <span
                        v-if='list.total'
                        class='nav-menu__pill'
                        v-text='list.total'
                    />
                    <button
                        type='button'
                        class='nav-menu__icon ms-auto'
                        title='Notification Settings'
                        @click='router.push("/notification/settings")'
                    >
                        <IconSettings
                            :size='18'
                            :stroke='1.5'
                        />
                    </button>
                </div>

                <div
                    v-if='loading'
                    class='nav-menu__empty'
                >
                    <div class='spinner-border spinner-border-sm text-secondary' />
                </div>
                <div
                    v-else-if='!list.total'
                    class='nav-menu__empty'
                >
                    <IconBellOff
                        :size='28'
                        :stroke='1.25'
                        class='text-secondary'
                    />
                    <span class='text-secondary small'>You're all caught up</span>
                </div>
                <div
                    v-else
                    class='nav-menu__list'
                >
                    <div
                        v-for='notify in visible'
                        :key='notify.id'
                        class='nav-notify'
                        @click='open(notify)'
                    >
                        <span class='nav-notify__dot' />
                        <div class='nav-notify__body'>
                            <div
                                class='nav-notify__text'
                                v-text='notify.text'
                            />
                            <div
                                class='nav-notify__time'
                                v-text='fromNow(notify.created)'
                            />
                        </div>
                        <button
                            type='button'
                            class='nav-menu__icon nav-notify__dismiss'
                            title='Dismiss'
                            @click.stop='dismiss(notify)'
                        >
                            <IconX
                                :size='16'
                                :stroke='1.5'
                            />
                        </button>
                    </div>
                    <div
                        v-if='list.total > visible.length'
                        class='nav-notify__more'
                        v-text='`${list.total - visible.length} more`'
                    />
                </div>

                <div class='nav-menu__footer'>
                    <button
                        type='button'
                        class='nav-menu__link'
                        @click='router.push("/notification")'
                    >
                        View all
                    </button>
                    <button
                        v-if='list.total'
                        type='button'
                        class='nav-menu__link text-secondary ms-auto'
                        @click.stop='clear'
                    >
                        Clear all
                    </button>
                </div>
            </div>
        </template>
    </TablerDropdown>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { TablerDropdown } from '@tak-ps/vue-tabler';
import {
    IconBell,
    IconBellOff,
    IconSettings,
    IconX
} from '@tabler/icons-vue';
import { fromNow } from '../../base/time.js';

const LIMIT = 6;

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const list = reactive({
    total: 0,
    items: []
});

const visible = computed(() => list.items.slice(0, LIMIT));

async function refresh() {
    try {
        const result = await window.std('/api/notification');
        list.total = result.total;
        list.items = result.items;
    } catch {
        list.total = 0;
        list.items = [];
    }
}

function open(notify) {
    if (!notify.url) return router.push('/notification');

    const url = new URL(notify.url, window.location.origin);
    if (url.origin === window.location.origin) {
        router.push(url.pathname + url.search + url.hash);
    } else {
        window.open(url.href, '_blank', 'noreferrer');
    }
}

async function dismiss(notify) {
    list.items = list.items.filter((n) => n.id !== notify.id);
    list.total = Math.max(0, list.total - 1);
    await window.std(`/api/notification/${notify.id}`, { method: 'DELETE' });
    await refresh();
}

async function clear() {
    loading.value = true;
    await window.std('/api/notification', { method: 'DELETE' });
    await refresh();
    loading.value = false;
}

watch(() => route.path, refresh);

onMounted(async () => {
    loading.value = true;
    await refresh();
    loading.value = false;
});

defineExpose({ refresh });
</script>

<style>
.nav-icon-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0;
    border: 1px solid transparent;
    border-radius: 999px;
    background: transparent;
    color: rgba(255, 255, 255, 0.75);
    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.nav-icon-btn:hover,
.nav-icon-btn:focus-visible,
[aria-expanded='true'] > .nav-icon-btn {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.12);
    color: #fff;
    outline: none;
}

.nav-icon-btn--active {
    color: #fff;
}

.nav-icon-btn__count {
    position: absolute;
    top: 4px;
    right: 2px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 999px;
    background: var(--tblr-red);
    color: #fff;
    font-size: 0.65rem;
    font-weight: 600;
    line-height: 18px;
    text-align: center;
    box-shadow: 0 0 0 2px var(--tblr-navbar-bg, #182433);
}

.nav-menu {
    display: flex;
    flex-direction: column;
    max-height: inherit;
}

.nav-menu__header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem 0.5rem;
}

.nav-menu__title {
    font-weight: 600;
    font-size: 0.9375rem;
}

.nav-menu__pill {
    display: inline-flex;
    align-items: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 999px;
    justify-content: center;
    background: rgba(var(--tblr-primary-rgb), 0.12);
    color: var(--tblr-primary);
    font-size: 0.7rem;
    font-weight: 600;
}

.nav-menu__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--tblr-secondary-color);
    transition: background 0.1s ease, color 0.1s ease;
}

.nav-menu__icon:hover {
    background: rgba(var(--tblr-primary-rgb), 0.08);
    color: var(--tblr-body-color);
}

.nav-menu__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.75rem 1rem;
}

.nav-menu__list {
    padding: 0 0.5rem;
    overflow-y: auto;
}

.nav-menu__footer {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    margin-top: 0.25rem;
    border-top: 1px solid rgba(var(--tblr-primary-rgb), 0.1);
}

.nav-menu__link {
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--tblr-primary);
    font-size: 0.8125rem;
    font-weight: 500;
}

.nav-menu__link:hover {
    text-decoration: underline;
}

.nav-notify {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    padding: 0.5rem 0.5rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.1s ease;
}

.nav-notify:hover {
    background: rgba(var(--tblr-primary-rgb), 0.08);
}

.nav-notify__dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    margin-top: 6px;
    border-radius: 999px;
    background: var(--tblr-primary);
}

.nav-notify__body {
    flex: 1;
    min-width: 0;
}

.nav-notify__text {
    font-size: 0.8125rem;
    line-height: 1.35;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.nav-notify__time {
    margin-top: 2px;
    font-size: 0.7rem;
    color: var(--tblr-secondary-color);
}

.nav-notify__dismiss {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    opacity: 0;
}

.nav-notify:hover .nav-notify__dismiss,
.nav-notify__dismiss:focus-visible {
    opacity: 1;
}

.nav-notify__more {
    padding: 0.25rem 0.5rem 0.5rem;
    font-size: 0.75rem;
    color: var(--tblr-secondary-color);
}
</style>
