<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a @click='$router.push("/")' class='cursor-pointer'>Home</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="#">Team</a></li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div class="col-lg-12">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex">
                                <div class='ms-auto'>
                                    <div class="btn-list">
                                        <button data-bs-toggle="dropdown" type="button" class="btn dropdown-toggle dropdown-toggle-split" aria-expanded="false"></button>
                                        <div class="dropdown-menu dropdown-menu-end" style="">
                                            <a @click='getExport' class="dropdown-item" href="#">Edit</a>
                                        </div>
                                    </div>
                                </div>
                            </div>

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
                    </div>
                </div>
                <div class="col-lg-12">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex">
                                <div class='ms-auto'>
                                    <div class="btn-list">
                                        <TablerSelect
                                            default='Author'
                                            :values='["All"]'
                                        />

                                        <TablerSelect
                                            default='Label'
                                            :values='["All"]'
                                        />

                                        <TablerSelect
                                            default='Assignee'
                                            :values='["All"]'
                                        />

                                        <TablerSelect
                                            default='Sort'
                                            :values='["All"]'
                                        />

                                        <button data-bs-toggle="dropdown" type="button" class="btn dropdown-toggle dropdown-toggle-split" aria-expanded="false"></button>
                                        <div class="dropdown-menu dropdown-menu-end" style="">
                                            <a @click='getExport' class="dropdown-item" href="#">Export CSV</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <table class="table card-table table-vcenter">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr :key='issue.id' v-for='issue in issues'>
                                            <td v-text='a.name'></td>
                                            <td v-text='a.status'></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <PageFooter/>
</div>
</template>

<script>
import PageFooter from './PageFooter.vue';
import TablerSelect from './util/Select.vue';
import {
} from 'vue-tabler-icons';

export default {
    name: 'Issues',
    data: function() {
        return {
            err: false,
        }
    },
    components: {
        PageFooter,
        TablerSelect
    }
}
</script>
