<template>
<div class="card">
    <div class="card-header d-flex align-items-center">
        <h3 class="card-title">Mission Tags</h3>

        <div class='ms-auto btn-list'>
            <IconPlus @click='push()' class='cursor-pointer' size='32'/>
        </div>
    </div>

    <TablerNone v-if='!list.items.length' :create='false' label='Tags'/>
    <TablerLoading v-else-if='loading'/>
    <table v-else class="table card-table table-vcenter">
        <thead>
            <tr>
                <th>Role</th>
                <th>Created</th>
                <th>Updated</th>
            </tr>
        </thead>
        <tbody>
            <tr :key='tag.id' v-for='(tag, tagit) in list.items'>
                <td>
                    <template v-if='tag._edit'>
                        <TablerInput v-on:keyup.enter='saveTag(tag, tagit)' v-model='tag.name'/>
                    </template>
                    <template v-else>
                        <span v-text='tag.name'/>
                    </template>
                </td>
                <td><TablerEpoch :date='tag.created'/></td>
                <td>
                    <div class='d-flex align-items-center'>
                        <TablerEpoch :date='tag.updated'/>
                        <div v-if='tag._edit' class='ms-auto btn-list'>
                            <IconCheck @click='saveTag(tag, tagit)' class='cursor-pointer' size='32'/>
                            <IconTrash @click='deleteTag(tag, tagit)' class='cursor-pointer' size='32'/>
                        </div>
                        <div v-else class='ms-auto btn-list'>
                            <IconPencil @click='tag._edit = true' class='cursor-pointer' size='32'/>
                        </div>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</div>
</template>

<script>
import {
    IconPlus,
    IconPencil,
    IconCheck,
    IconTrash
} from '@tabler/icons-vue';
import {
    TablerEpoch,
    TablerLoading,
    TablerInput,
    TablerNone
} from '@tak-ps/vue-tabler';

export default {
    name: 'AdminRoleCard',
    data: function() {
        return {
            loading: true,
            list: {
                total: 0,
                items: []
            }
        }
    },
    mounted: async function() {
        await this.fetch();
    },
    methods: {
        fetch: async function() {
            this.loading = true;
            this.list = await window.std('/api/mission-tag');
            this.loading = false;
        },
        saveTag: async function(tag, tagit) {
            if (tag.id) {
                const newtag = await window.std(`/api/mission-tag/${tag.id}`, {
                    method: 'PATCH',
                    body: tag 
                });
                this.list.items.splice(tagit, 1, newtag);
            } else {
                const newtag = await window.std('/api/mission-tag', {
                    method: 'POST',
                    body: tag
                });
                this.list.items.splice(tagit, 1, newtag);
            }
        },
        deleteTag: async function(tag, tagit) {
            if (tag.id) {
                const newtag = await window.std(`/api/mission-tag/${tag.id}`, {
                    method: 'DELETE',
                });
            }

            this.list.items.splice(tagit, 1);
        },
        push: function() {
            this.list.items.splice(0, 0, {
                _edit: true,
                name: '',
                updated: +new Date(),
                created: +new Date()
            });
        }
    },
    components: {
        TablerNone,
        IconPlus,
        IconPencil,
        IconCheck,
        IconTrash,
        TablerEpoch,
        TablerLoading,
        TablerInput
    }
}
</script>
