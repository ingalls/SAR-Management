<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a @click='$router.push("/")' class="cursor-pointer">Home</a></li>
                            <li class="breadcrumb-item" aria-current="page"><a  @click='$router.push("/equipment")' class="cursor-pointer">Equipment</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="#">New</a></li>
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
                        <TablerLoading v-if='loading'/>
                        <div v-else class="card-body">
                            <div class='row row-cards'>
                                <div class="col-md-12">
                                    <label class="form-label">Equipment Name</label>
                                    <input v-model='equipment.name' type="text" class="form-control" placeholder="Equipment Name">

                                    <label class="form-label">Equipment Description</label>
                                    <textarea v-text='equipment.description' class="form-control" rows="6" placeholder="Equipment Description"></textarea>
                                </div>

                                <div class="col-md-12">
                                    <div class='d-flex'>
                                        <div class='ms-auto'>
                                            <a @click='create' class="cursor-pointer btn btn-primary">
                                                Create Equipment
                                            </a>
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
    name: 'EquipmentsNew',
    data: function() {
        return {
            loading: false,
            equipment: {
                name: '',
                description: ''
            }
        }
    },
    methods: {
        create: async function() {
            const equip = await window.std('/api/equipment', {
                method: 'POST',
                body: this.equipment
            })

            this.$router.push(`/equipment/${equip.id}`);
        }
    },
    components: {
        PageFooter,
    }
}
</script>
