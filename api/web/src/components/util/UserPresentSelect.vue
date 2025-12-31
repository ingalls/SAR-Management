<template>
    <div class='card'>
        <div class='card-body'>
            <div class='d-flex align-items-center mb-3'>
                <div
                    class='subheader'
                    v-text='label'
                />

                <div
                    v-if='!disabled'
                    class='ms-auto'
                >
                    <TablerDropdown>
                        <template #default>
                            <IconPlus
                                v-tooltip='"Add User"'
                                class='cursor-pointer dropdown-toggle'
                                :size='16'
                                :stroke='1'
                            />
                        </template>
                        <template #dropdown>
                            <div class='card'>
                                <div class='card-body'>
                                    <TablerInput
                                        v-model='filter'
                                        icon='search'
                                        placeholder='Filter Users'
                                    />

                                    <TablerNone
                                        v-if='list.items.length === 0'
                                        label='No Users'
                                        :create='false'
                                    />
                                    <template v-else>
                                        <div
                                            v-for='user in list.items'
                                            :key='user.id'
                                            class='py-2 px-2 rounded cursor-pointer hover-light'
                                            @click='push_assigned(user)'
                                        >
                                            <Avatar :user='user' />
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </template>
                    </TablerDropdown>
                </div>
            </div>

            <TablerLoading v-if='loading' />
            <TablerNone
                v-else-if='!assigned.length'
                label='No Users Assigned'
                :create='false'
            />
            <template v-else>
                <Draggable
                    v-model='assigned'
                    item-key='id'
                >
                    <template #item='{element}'>
                        <div class='d-flex align-items-center my-2 hover'>
                            <Avatar
                                :link='true'
                                :user='element'
                            />

                            <div
                                v-if='!disabled'
                                class='ms-auto'
                            >
                                <div class='btn-list'>
                                    <div
                                        v-if='!element.confirmed'
                                        class='btn btn--sm'
                                        @click='confirm_assigned(element)'
                                    >
                                        <IconCheck
                                            :size='16'
                                            :stroke='1'
                                        /> Confirm
                                    </div>

                                    <template v-if='disabled'>
                                        <span
                                            class='pt-1'
                                            v-text='element.role'
                                        />
                                    </template>
                                    <template v-else>
                                        <TablerSelect
                                            v-model='element.role'
                                            :options='roles'
                                            class='pt-2 mx-3'
                                            @update:model-value='saveRole(element)'
                                        />
                                    </template>

                                    <IconTrash
                                        v-tooltip='"Remove User"'
                                        class='cursor-pointer my-2'
                                        :size='20'
                                        :stroke='1'
                                        @click='delete_assigned(element)'
                                    />
                                </div>
                            </div>
                        </div>
                    </template>
                </Draggable>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import {
    IconPlus,
    IconTrash,
    IconCheck
} from '@tabler/icons-vue';
import {
    TablerNone,
    TablerInput,
    TablerLoading,
    TablerDropdown,
    TablerSelect
} from '@tak-ps/vue-tabler'
import Avatar from './Avatar.vue';
import Draggable from 'vuedraggable';

const props = defineProps({
    modelValue: {
        type: Array,
        required: true
    },
    disabled: {
        type: Boolean,
        default: false
    },
    label: {
        type: String,
        default: 'Mission Roster'
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    loading: {
        type: Boolean
    },
    limit: {
        type: Number,
        default: 10
    },
})

const emit = defineEmits([
    'patch',
    'delete',
    'push',
    'update:modelValue'
]);

const filter = ref('');
const list = reactive({
    total: 0,
    items: []
});
const assigned = ref([]);
const roles = ref([]);

watch(() => props.modelValue, () => {
    assigned.value = props.modelValue;
});

watch(filter, async () => {
    await listUsers();
});

watch(assigned, () => {
    emit('update:modelValue', assigned.value);
}, { deep: true });

onMounted(async () => {
    assigned.value = props.modelValue;
    await listUsers();
    await listRoles();
});

async function push_assigned(user) {
    if (props.confirmed) user.confirmed = true;
    user.role = 'Present';
    assigned.value.push(user);
    emit('push', user);
    filter.value = '';
}

async function delete_assigned(user) {
    assigned.value.splice(assigned.value.indexOf(user), 1);
    emit('delete', user);
    await listUsers();
}

async function confirm_assigned(user) {
    user.confirmed = true;
    emit('patch', user);
}

async function saveRole(role) {
    emit('patch', role);
}

async function listRoles() {
    const url = window.stdurl('/api/mission-role');
    const result = await window.std(url);
    roles.value = result.items.map((role) => {
        return role.name;
    });
}

async function listUsers() {
    const url = window.stdurl('/api/user');
    url.searchParams.append('filter', filter.value);
    url.searchParams.append('limit', props.limit + assigned.value.length);
    const result = await window.std(url);

    const ids = assigned.value.map((a) => a.uid);
    list.items = result.items.filter((user) => {
        return !ids.includes(user.id);
    }).splice(0, props.limit);
}
</script>
