<template>
    <div class='col-lg-6'>
        <div class='card'>
            <div class='card-header'>
                <h3 class='card-title'>
                    Subjects
                </h3>
                <div class='ms-auto'>
                    <TablerIconButton
                        v-if='is_iam("Mission:Manage")'
                        title='Add Subject'
                        @click='$router.push(`/mission/${mission.id}/person/new`)'
                    >
                        <IconPlus
                            size='24'
                            stroke='1'
                        />
                    </TablerIconButton>
                </div>
            </div>
            <div
                v-if='mission.people && mission.people.length'
                class='list-group list-group-flush'
            >
                <div
                    v-for='person in mission.people'
                    :key='person.id'
                    class='list-group-item list-group-item-action cursor-pointer'
                    @click='$router.push(`/mission/${mission.id}/person/${person.id}`)'
                >
                    <div class='row align-items-center'>
                        <div class='col text-truncate'>
                            <div class='text-reset d-block'>
                                {{ person.name }}
                            </div>
                            <div class='mt-1'>
                                <span
                                    class='badge text-white'
                                    :class='roleClass(person.role)'
                                >{{ person.role }}</span>
                            </div>
                        </div>
                        <div class='col-auto'>
                            <div class='d-flex flex-column align-items-end'>
                                <span v-if='person.phone'>{{ person.phone }}</span>
                                <span
                                    v-if='person.address'
                                    class='text-secondary'
                                >{{ person.address }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <TablerNone
                v-else
                label='Mission Subjects'
                :create='false'
            />
        </div>
    </div>
</template>

<script>
import {
    TablerIconButton,
    TablerNone
} from '@tak-ps/vue-tabler';
import {
    IconPlus
} from '@tabler/icons-vue';
import iam from '../../iam.js';

export default {
    name: 'MissionPeople',
    components: {
        TablerIconButton,
        TablerNone,
        IconPlus
    },
    props: {
        mission: {
            type: Object,
            required: true
        },
        iam: {
            type: Object,
            required: true
        },
        auth: {
            type: Object,
            required: true
        }
    },
    methods: {
        roleClass(role) {
            switch (role) {
                case 'Subject':
                    return 'bg-red';
                case 'Reporting Party':
                    return 'bg-blue';
                case 'Witness':
                    return 'bg-yellow';
                default:
                    return 'bg-secondary';
            }
        },
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
    }
}
</script>
