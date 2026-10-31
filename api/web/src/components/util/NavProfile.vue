<template>
    <TablerDropdown :width='260'>
        <template #default>
            <button
                type='button'
                class='nav-profile-btn'
                title='Account'
                aria-label='Account'
            >
                <span
                    class='nav-avatar'
                    :style='{ backgroundImage: `url(${avatar})` }'
                />
                <IconChevronDown
                    :size='16'
                    :stroke='2'
                    class='nav-profile-btn__chevron'
                />
            </button>
        </template>
        <template #dropdown>
            <div class='nav-menu'>
                <div class='nav-profile-head'>
                    <span
                        class='nav-avatar nav-avatar--lg'
                        :style='{ backgroundImage: `url(${avatar})` }'
                    />
                    <div class='nav-profile-head__text'>
                        <div
                            class='nav-profile-head__name'
                            v-text='name'
                        />
                        <div
                            class='nav-profile-head__email'
                            v-text='user.email'
                        />
                    </div>
                    <span
                        v-if='user.access === "admin"'
                        class='nav-menu__pill'
                    >Admin</span>
                </div>

                <div class='nav-menu__divider' />

                <a
                    class='dropdown-item nav-menu__item'
                    @click='navigate("/profile", $event)'
                >
                    <IconUser
                        :size='18'
                        :stroke='1.5'
                    />
                    <span>Profile</span>
                </a>
                <a
                    class='dropdown-item nav-menu__item'
                    @click='navigate("/notification/settings", $event)'
                >
                    <IconBellCog
                        :size='18'
                        :stroke='1.5'
                    />
                    <span>Notification Settings</span>
                </a>
                <a
                    v-if='user.access === "admin"'
                    class='dropdown-item nav-menu__item'
                    @click='navigate("/admin", $event)'
                >
                    <IconAdjustments
                        :size='18'
                        :stroke='1.5'
                    />
                    <span>Admin</span>
                </a>

                <div class='nav-menu__divider' />

                <a
                    class='dropdown-item nav-menu__item nav-menu__item--danger'
                    @click='navigate("/logout", $event)'
                >
                    <IconLogout
                        :size='18'
                        :stroke='1.5'
                    />
                    <span>Logout</span>
                </a>
            </div>
        </template>
    </TablerDropdown>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { TablerDropdown } from '@tak-ps/vue-tabler';
import {
    IconUser,
    IconBellCog,
    IconAdjustments,
    IconLogout,
    IconChevronDown
} from '@tabler/icons-vue';

const props = defineProps({
    user: {
        type: Object,
        required: true
    }
});

const router = useRouter();
const profile = ref(null);

const avatar = computed(() => {
    const url = window.stdurl(`/api/user/${props.user.id}/profile`);
    url.searchParams.set('size', 'mini');
    url.searchParams.set('token', localStorage.token);
    return url.href;
});

const name = computed(() => {
    if (profile.value) return `${profile.value.fname} ${profile.value.lname}`.trim();
    return props.user.email;
});

async function load() {
    try {
        profile.value = await window.std(`/api/user/${props.user.id}`);
    } catch {
        profile.value = null;
    }
}

function navigate(path, event) {
    if (event.ctrlKey || event.metaKey) {
        window.open(router.resolve(path).href, '_blank');
    } else {
        router.push(path);
    }
}

watch(() => props.user.id, load, { immediate: true });
</script>

<style>
.nav-profile-btn {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    height: 40px;
    padding: 0 6px 0 4px;
    border: 1px solid transparent;
    border-radius: 999px;
    background: transparent;
    color: rgba(255, 255, 255, 0.75);
    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.nav-profile-btn:hover,
.nav-profile-btn:focus-visible,
[aria-expanded='true'] > .nav-profile-btn {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.12);
    color: #fff;
    outline: none;
}

.nav-profile-btn__chevron {
    transition: transform 0.15s ease;
}

[aria-expanded='true'] > .nav-profile-btn .nav-profile-btn__chevron {
    transform: rotate(180deg);
}

.nav-avatar {
    display: inline-block;
    flex-shrink: 0;
    width: 30px;
    height: 30px;
    border-radius: 999px;
    background-color: rgba(255, 255, 255, 0.15);
    background-size: cover;
    background-position: center;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
}

.nav-avatar--lg {
    width: 40px;
    height: 40px;
    box-shadow: 0 0 0 1px rgba(var(--tblr-primary-rgb), 0.2);
}

.nav-profile-head {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem 0.75rem;
}

.nav-profile-head__text {
    flex: 1;
    min-width: 0;
}

.nav-profile-head__name {
    font-weight: 600;
    font-size: 0.9375rem;
    line-height: 1.25;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.nav-profile-head__email {
    font-size: 0.75rem;
    color: var(--tblr-secondary-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.nav-menu__divider {
    height: 1px;
    margin: 0.25rem 0;
    background: rgba(var(--tblr-primary-rgb), 0.1);
}

.nav-menu__item {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    margin: 0 0.5rem;
    padding: 0.5rem 0.625rem;
    width: auto;
    border-radius: 8px;
    font-size: 0.875rem;
}

.nav-menu__item svg {
    color: var(--tblr-secondary-color);
}

.nav-menu__item--danger,
.nav-menu__item--danger svg {
    color: var(--tblr-red) !important;
}

.nav-menu__item--danger:hover {
    background: rgba(var(--tblr-red-rgb), 0.08) !important;
}
</style>
