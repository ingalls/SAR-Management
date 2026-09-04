<template>
    <div>
        <div class='card-header'>
            <h3 class='card-title'>
                Server Settings
            </h3>
        </div>
        <div class='card-body row'>
            <ConfigOrganisation />
            <ConfigBranding />
            <ConfigLogin />
            <ConfigSlack />
        </div>
    </div>
</template>

<script setup>
import ConfigOrganisation from './ServerConfig/ConfigOrganisation.vue';
import ConfigBranding from './ServerConfig/ConfigBranding.vue';
import ConfigLogin from './ServerConfig/ConfigLogin.vue';
import ConfigSlack from './ServerConfig/ConfigSlack.vue';
</script>
