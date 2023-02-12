<template>
<div class="card-footer d-flex align-items-center">
    <p class="m-0 text-muted">Showing <span v-text='limit * page + 1'/> to <span v-text='total < limit ? total : limit'/> of <span v-text='total'/> entries</p>

    <Pager :total='total' :limit='limit'/>

    <!--
    <li class="page-item disabled">
        <a class="page-link" href="#" tabindex="-1" aria-disabled="true">prev</a>
    </li>
    <li class="page-item"><a class="page-link" href="#">1</a></li>
    <li class="page-item active"><a class="page-link" href="#">2</a></li>
    <li class="page-item"><a class="page-link" href="#">3</a></li>
    <li class="page-item"><a class="page-link" href="#">4</a></li>
    <li class="page-item"><a class="page-link" href="#">5</a></li>
    <li class="page-item">
        <a class="page-link" href="#">next</a>
    </li>
    -->
</div>
</template>

<script>
import Pager from './Pager.vue'

export default {
    name: 'TableFooter',
    props: {
        page: {
            type: Number,
            default: 0
        },
        limit: {
            type: Number,
            required: true
        },
        total: {
            type: Number,
            required: true
        }
    },
    components: {
        Pager
    }
}
</script>
