<template>
    <div class='card'>
        <div class='card-header'>
            <div class='col'>
                <div class='d-flex'>
                    <h3 class='card-title user-select-none'>
                        Users
                    </h3>

                    <div class='ms-auto btn-list align-items-center'>
                        <TablerInput
                            v-model='paging.filter'
                            icon='search'
                            placeholder='Search…'
                        />

                        <TablerDropdown>
                            <button class='btn px-2 py-1'>
                                <IconFilter
                                    :size='32'
                                    stroke='1'
                                />
                            </button>

                            <template #dropdown>
                                <div
                                    class='card'
                                    @click.stop=''
                                >
                                    <div class='card-header'>
                                        <div class='card-title'>
                                            Filter Options
                                        </div>
                                    </div>
                                    <div class='card-body row g-2'>
                                        <div class='col-12'>
                                            <TablerToggle
                                                v-model='paging.disabled'
                                                label='Disabled Users'
                                            />
                                        </div>
                                        <div class='col-12'>
                                            <TeamSelect
                                                v-model='paging.teams'
                                                label='Teams'
                                                :autoclose='false'
                                            />
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </TablerDropdown>

                        <div class='btn-list'>
                            <div
                                class='btn-group'
                                role='group'
                            >
                                <input
                                    v-model='mode'
                                    type='radio'
                                    class='btn-check'
                                    name='btn-radio-toolbar'
                                    value='list'
                                >
                                <label
                                    class='btn btn-icon'
                                    @click='mode="list"'
                                ><IconList
                                    size='32'
                                    stroke='1'
                                /></label>
                                <input
                                    v-model='mode'
                                    type='radio'
                                    class='btn-check'
                                    name='btn-radio-toolbar'
                                    value='gallery'
                                >
                                <label
                                    class='btn btn-icon'
                                    @click='mode="gallery"'
                                ><IconPolaroid
                                    size='32'
                                    stroke='1'
                                /></label>
                            </div>

                            <button class='btn px-2'>
                                <IconAddressBook
                                    class='cursor-pointer'
                                    size='32'
                                    stroke='1'
                                    @click='exportUsers("vcard")'
                                />
                            </button>
                            <template v-if='edit'>
                                <TablerLoading
                                    v-if='loading.add'
                                    :inline='true'
                                />
                                <UserDropdownIcon
                                    v-else
                                    :button='true'
                                    @selected='addUser($event)'
                                />
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <TablerLoading
            v-if='loading.list'
            desc='Loading Users'
        />
        <TablerNone
            v-else-if='!list.items.length'
            label='Users'
            :create='false'
        />
        <template v-else-if='mode === "list"'>
            <div class='table-responsive'>
                <table class='table card-table table-hover table-vcenter datatable'>
                    <TableHeader
                        v-model:sort='paging.sort'
                        v-model:order='paging.order'
                        v-model:header='header'
                        :export='true'
                        @export='exportUsers("csv")'
                    />
                    <tbody>
                        <tr
                            v-for='(user, user_it) in list.items'
                            :key='user.id'
                        >
                            <template v-for='h in header'>
                                <template v-if='h.display'>
                                    <td
                                        v-if='h.name === "name"'
                                        @click='$router.push(`/user/${user.id}`)'
                                    >
                                        <div class='d-flex align-items-center'>
                                            <span
                                                v-if='user.disabled'
                                                class='badge bg-red text-white me-3'
                                                style='height: 20px;'
                                            >DISABLED</span>

                                            <Avatar
                                                :link='true'
                                                :user='user'
                                            />
                                        </div>
                                    </td>
                                    <td v-else-if='h.name === "email"'>
                                        <a
                                            :href='`mailto:${user.email}`'
                                            v-text='user.email'
                                        />
                                    </td>
                                    <td v-else-if='h.name === "phone"'>
                                        <div class='d-flex'>
                                            <a
                                                :href='`tel:${user.phone}`'
                                                v-text='user.phone'
                                            />
                                            <div
                                                v-if='edit'
                                                class='ms-auto'
                                            >
                                                <div
                                                    v-if='!user._loading'
                                                    class='btn-list'
                                                >
                                                    <TablerDelete
                                                        displaytype='icon'
                                                        @delete='removeUser(user, user_it)'
                                                    />
                                                </div>
                                                <div
                                                    v-else
                                                    class='btn-list'
                                                >
                                                    <TablerLoading :inline='true' />
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td v-else-if='["last_login", "updated", "created"].includes(h.name)'>
                                        <TablerEpoch
                                            v-if='user[h.name]'
                                            :date='user[h.name]'
                                        />
                                        <span v-else>Never</span>
                                    </td>
                                    <td v-else>
                                        <span v-text='user[h.name]' />
                                    </td>
                                </template>
                            </template>
                        </tr>
                    </tbody>
                </table>
            </div>
        </template>
        <template v-else>
            <div class='row row-cards'>
                <div
                    v-for='user in list.items'
                    :key='user.id'
                    class='col-sm-6 col-lg-4'
                >
                    <div class='card card-sm'>
                        <a
                            class='d-block cursor-pointer'
                            @click='$router.push(`/user/${user.id}`)'
                        >
                            <UserProfile
                                bgstyle='cover'
                                :userid='user.id'
                            />
                        </a>
                        <div class='card-body'>
                            <div class='d-flex align-items-center'>
                                <div>
                                    <div
                                        class='cursor-pointer'
                                        @click='$router.push(`/user/${user.id}`)'
                                        v-text='`${user.fname} ${user.lname}`'
                                    />
                                    <a
                                        class='text-muted cursor-pointer'
                                        :href='`mailto:${user.email}`'
                                        v-text='user.email'
                                    />
                                    <br>
                                    <a
                                        class='text-muted cursor-pointer'
                                        :href='`tel:${user.phone}`'
                                        v-text='user.phone'
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <TableFooter
            :limit='paging.limit'
            :total='list.total'
            @page='paging.page = $event'
        />
    </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import Avatar from '../util/Avatar.vue';
import {
    IconList,
    IconFilter,
    IconPolaroid,
    IconAddressBook,
} from '@tabler/icons-vue';
import UserDropdownIcon from '../util/UserDropdownIcon.vue'
import TeamSelect from '../util/TeamSelect.vue'
import TableHeader from '../util/TableHeader.vue';
import TableFooter from '../util/TableFooter.vue';
import {
    TablerNone,
    TablerInput,
    TablerDropdown,
    TablerDelete,
    TablerEpoch,
    TablerLoading,
    TablerToggle,
} from '@tak-ps/vue-tabler'
import UserProfile from '../User/Profile.vue';

const props = defineProps({
    dropdown: {
        type: Boolean,
        default: true
    },
    limit: {
        type: Number,
        default: 10
    },
    url: {
        type: String,
        default: '/api/user'
    },
    edit: {
        type: Boolean,
        default: false,
    },
    team: Number
})

const mode = ref('list')
const loading = reactive({
    list: true,
})
const header = ref([])
const paging = reactive({
    filter: '',
    sort: 'Name',
    order: 'asc',
    teams: [],
    limit: props.limit,
    disabled: false,
    page: 0
})
const list = reactive({
    total: 0,
    items: []
})

const removeUser = async (user, user_it) => {
    user._loading = true;
    await window.std(`${props.url}/${user.id}`, {
        method: 'DELETE',
    });
    user._loading = false;

    list.items.splice(user_it, 1);
    list.total--;
}

const addUser = async (user) => {
    loading.add = true;
    await window.std(`${props.url}`, {
        method: 'POST',
        body: { uid: user.id }
    });

    list.items.splice(0, 0, user);
    list.total++;
    loading.add = false;
}

const listUsersSchema = async () => {
    const schema = await window.std('/api/schema?method=GET&url=/user');
    header.value = ['name', 'email', 'last_login', 'phone'].map((h) => {
        return { name: h, display: true };
    });

    header.value.push(...schema.query.properties.sort.enum.map((h) => {
        return {
            name: h,
            display: false
        }
    }).filter((h) => {
        for (const hknown of header.value) {
            if (hknown.name === h.name) return false;
        }
        return true;
    }));
}

const listUsers = async () => {
    loading.list = true;
    const url = window.stdurl(props.url);
    if (props.team) url.searchParams.append('team', props.team);
    url.searchParams.append('limit', paging.limit);
    url.searchParams.append('page', paging.page);
    url.searchParams.append('filter', paging.filter);
    url.searchParams.append('disabled', paging.disabled);
    if (paging.teams.length) {
        url.searchParams.append('teams', paging.teams.map(t => t.id).join(','));
    }

    if (paging.sort.toLowerCase() === 'name') url.searchParams.append('sort', 'fname');
    else url.searchParams.append('sort', paging.sort.toLowerCase().replace(' ', '_'));
    url.searchParams.append('order', paging.order);

    const result = await window.std(url);
    list.total = result.total;
    list.items = result.items;
    loading.list = false;
}

const exportUsers = async (format='vcard') => {
    const url = window.stdurl(props.url);
    if (props.team) url.searchParams.append('team', props.team);
    url.searchParams.append('filter', paging.filter);
    url.searchParams.append('disabled', paging.disabled);
    url.searchParams.append('format', format);
    if (paging.sort.toLowerCase() === 'name') url.searchParams.append('sort', 'fname');

    if (format === 'csv') {
        const fields = [];
        header.value.filter((h) => {
            return h.display;
        }).forEach((h) => {
            if (h.name === 'name') {
                fields.push('fname', 'lname');
            } else {
                fields.push(h.name);
            }
        });

        for (const field of fields) {
            url.searchParams.append('fields', field)
        }
    }

    const res = await window.std(url);
    const blob = await res.blob()

    const durl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = durl;
    a.download = `sar-users.${format === 'vcard' ? 'vcf' : format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

// Watch for changes in paging to reload users
watch(paging, async () => {
    await listUsers();
}, { deep: true })

onMounted(async () => {
    await listUsersSchema();
    await listUsers();
})
</script>
