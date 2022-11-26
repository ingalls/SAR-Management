<template>
<div class='mb-3'>
    <div class='row'>
        <div class="d-flex align-items-center">
            <div class="subheader" v-text='label'></div>
            <div class="ms-auto lh-1">
                <SettingsIcon
                    class='cursor-pointer'
                    height=16
                    width=16
                />
            </div>
        </div>
        <div class='row'>
            <div :key='a.id' v-for='a in assigned' class="d-flex align-items-center">
                <span class="avatar avatar-xs me-2 avatar-rounded" style="background-image: url(./static/avatars/000m.jpg)"></span>
                <span v-text='a.username'/>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import {
    SettingsIcon
} from 'vue-tabler-icons';

export default {
    name: 'UserSelect',
    props: {
        limit: {
            type: Number,
            default: 10
        },
        label: {
            type: String,
            default: 'Users'
        }
    },
    data: function() {
        return {
            assigned: [{
                id: 1,
                username: 'ingalls'
            }]
        }
    },
    components: {
        SettingsIcon
    }
}
</script>
