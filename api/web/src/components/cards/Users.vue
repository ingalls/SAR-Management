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
                                <div class='card'>
                                    <div class='card-header'>
                                        <div class='card-title'>Filter Options</div>
                                    </div>
                                    <div class='card-body row g-2'>
                                        <TablerToggle
                                            v-model='paging.disabled'
                                            label='Disabled Users'
                                        />
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

<script>
import Avatar from '../util/Avatar.vue';
import {
    IconList,
    IconFilter,
    IconPolaroid,
    IconAddressBook,
} from '@tabler/icons-vue';
import UserDropdownIcon from '../util/UserDropdownIcon.vue'
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

export default {
    name: 'CardUsers',
    components: {
        TablerNone,
        TablerEpoch,
        TablerInput,
        TablerDropdown,
        TablerDelete,
        TablerToggle,
        TablerLoading,
        UserDropdownIcon,
        Avatar,
        IconList,
        IconFilter,
        IconPolaroid,
        IconAddressBook,
        UserProfile,
        TableFooter,
        TableHeader
    },
    props: {
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
    },
    data: function() {
        return {
            mode: 'list',
            loading: {
                list: true,
            },
            header: [],
            paging: {
                filter: '',
                sort: 'Name',
                order: 'asc',
                limit: this.limit,
                disabled: false,
                page: 0
            },
            list: {
                total: 0,
                items: []
            },
        }
    },
    watch: {
        paging: {
            deep: true,
            handler: async function() {
                await this.listUsers();
            }
        }
    },
    mounted: async function() {
        await this.listUsersSchema();
        await this.listUsers();
    },
    methods: {
        removeUser: async function(user, user_it) {
            user._loading = true;
            await window.std(`${this.url}/${user.id}`, {
                method: 'DELETE',
            });
            user._loading = false;

            this.list.items.splice(user_it, 1);
            this.list.total--;
        },
        addUser: async function(user) {
            this.loading.add = true;
            await window.std(`${this.url}`, {
                method: 'POST',
                body: { uid: user.id }
            });

            this.list.items.splice(0, 0, user);
            this.list.total++;
            this.loading.add = false;
        },
        listUsersSchema: async function() {
            const schema = await window.std('/api/schema?method=GET&url=/user');
            this.header = ['name', 'email', 'last_login', 'phone'].map((h) => {
                return { name: h, display: true };
            });

            this.header.push(...schema.query.properties.sort.enum.map((h) => {
                return {
                    name: h,
                    display: false
                }
            }).filter((h) => {
                for (const hknown of this.header) {
                    if (hknown.name === h.name) return false;
                }
                return true;
            }));
        },
        listUsers: async function() {
            this.loading.list = true;
            const url = window.stdurl(this.url);
            if (this.team) url.searchParams.append('team', this.team);
            url.searchParams.append('limit', this.paging.limit);
            url.searchParams.append('page', this.paging.page);
            url.searchParams.append('filter', this.paging.filter);
            url.searchParams.append('disabled', this.paging.disabled);

            if (this.paging.sort.toLowerCase() === 'name') url.searchParams.append('sort', 'fname');
            else url.searchParams.append('sort', this.paging.sort.toLowerCase().replace(' ', '_'));
            url.searchParams.append('order', this.paging.order);

            this.list = await window.std(url);
            this.loading.list = false;
        },
        exportUsers: async function(format='vcard') {
            const url = window.stdurl(this.url);
            if (this.team) url.searchParams.append('team', this.team);
            url.searchParams.append('filter', this.paging.filter);
            url.searchParams.append('disabled', this.paging.disabled);
            url.searchParams.append('format', format);
            if (this.paging.sort.toLowerCase() === 'name') url.searchParams.append('sort', 'fname');

            if (format === 'csv') {
                const fields = [];
                this.header.filter((h) => {
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
        },
    }
}
</script>
