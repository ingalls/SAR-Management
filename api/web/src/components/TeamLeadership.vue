<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a @click='$router.push("/")' class='cursor-pointer'>Home</a></li>
                            <li class="breadcrumb-item" aria-current="page"><a @click='$router.push("/team")' class='cursor-pointer'>Team</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="#">Leadership</a></li>
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
                        <div class='card-header'>
                            <div class="col">
                                <div class="d-flex">
                                    <h3 class='card-title'>Leadership Team</h3>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="datagrid">
                                <div :key='position' v-for='position in Object.keys(leaders)' class="datagrid-item">
                                    <div class="datagrid-title" v-text='position'></div>
                                    <div class="datagrid-content">
                                        <div class="d-flex align-items-center">
                                            <span class="avatar avatar-xs me-2 avatar-rounded" style="background-image: url(./static/avatars/000m.jpg)"></span>
                                            <span v-text='"Nick Ingalls"'/>
                                        </div>
                                    </div>
                                </div>
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

export default {
    name: 'TeamLeadership',
    data: function() {
        return {
            leaders: {}
        }
    },
    mounted: async function() {
        await this.listLeaders();
    },
    methods: {
        listLeaders: async function() {
            const leaders = (await window.std('/api/leadership')).leadership;

            for (const lead of leaders) {
                if (!this.leaders[lead.name]) this.leaders[lead.name] = [];
                this.leaders[lead.name].push(lead.uid);
            }
        }
    },
    components: {
        PageFooter,
    }
}
</script>
