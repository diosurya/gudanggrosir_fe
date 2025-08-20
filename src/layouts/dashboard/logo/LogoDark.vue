<template>
  <div class="logo">
    <RouterLink to="/admin/dashboard" aria-label="logo">
      <img :src="logo" alt="Logo" class="h-9" style="max-width: 125px;" />
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

const logo = 'https://raw.githubusercontent.com/diosurya/assets/refs/heads/main/GG-logo.png';
</script>
