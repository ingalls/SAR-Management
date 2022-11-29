<template>
<div class="card">
    <div class='card-header'>
        <div class="col">
            <div class="d-flex">
                <h3 class='card-title'>Leadership Team</h3>

                <div class='ms-auto'>
                    <div class="btn-list">
                        <button data-bs-toggle="dropdown" type="button" class="btn dropdown-toggle dropdown-toggle-split" aria-expanded="false"></button>
                        <div class="dropdown-menu dropdown-menu-end" style="">
                            <a @click='$router.push("/team/leadership")' class="dropdown-item cursor-pointer">Edit</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="card-body">
        <div class="datagrid">
            <div class="datagrid-item">
                <div class="datagrid-title">President</div>
                <div class="datagrid-content">
                    <div class="d-flex align-items-center">
                        <span class="avatar avatar-xs me-2 avatar-rounded" style="background-image: url(./static/avatars/000m.jpg)"></span>
                        Paweł Kuna
                    </div>
                </div>
            </div>
            <div class="datagrid-item">
                <div class="datagrid-title">Vice-President</div>
                <div class="datagrid-content">
                    <div class="d-flex align-items-center">
                        <span class="avatar avatar-xs me-2 avatar-rounded" style="background-image: url(./static/avatars/000m.jpg)"></span>
                        Paweł Kuna
                    </div>
                </div>
            </div>
            <div class="datagrid-item">
                <div class="datagrid-title">Standards</div>
                <div class="datagrid-content">
                    <div class="avatar-list avatar-list-stacked">
                        <span class="avatar avatar-xs avatar-rounded" style="background-image: url(./static/avatars/000m.jpg)"></span>
                        <span class="avatar avatar-xs avatar-rounded">JL</span>
                        <span class="avatar avatar-xs avatar-rounded" style="background-image: url(./static/avatars/002m.jpg)"></span>
                        <span class="avatar avatar-xs avatar-rounded" style="background-image: url(./static/avatars/003m.jpg)"></span>
                        <span class="avatar avatar-xs avatar-rounded" style="background-image: url(./static/avatars/000f.jpg)"></span>
                        <span class="avatar avatar-xs avatar-rounded">+3</span>
                    </div>
                </div>
            </div>
            <div class="datagrid-item">
                <div class="datagrid-title">Secretary</div>
                <div class="datagrid-content">
                    <div class="d-flex align-items-center">
                        <span class="avatar avatar-xs me-2 avatar-rounded" style="background-image: url(./static/avatars/000m.jpg)"></span>
                        Paweł Kuna
                    </div>
                </div>
            </div>
            <div class="datagrid-item">
                <div class="datagrid-title">Treasurer</div>
                <div class="datagrid-content">
                    <div class="d-flex align-items-center">
                        <span class="avatar avatar-xs me-2 avatar-rounded" style="background-image: url(./static/avatars/000m.jpg)"></span>
                        Paweł Kuna
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Err v-if='err' :err='err' @close='err = null'/>
</div>
</template>

<script>
import Err from '../Err.vue';

export default {
    name: 'CardLeadership',
    data: function() {
        return {
            err: false,
            leaders: []
        }
    },
    mounted: function() {
        this.listLeaders();
    },
    methods: {
        listUsers: async function() {
            try {
                this.leaders = await window.std('/api/user');
            } catch (err) {
                this.err = err;
            }
        },
    },
    components: {
        Err
    }
}
</script>
