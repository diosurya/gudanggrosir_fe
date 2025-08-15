<template>
  <div class="logo">
    <RouterLink to="/dashboard" aria-label="logo">
      <!-- Gunakan path langsung ke public -->
      <img :src="logo" alt="Logo" class="h-9" style="max-width: 125px;" />
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

// Bisa pakai path relatif dari public
const logo = 'https://raw.githubusercontent.com/diosurya/assets/refs/heads/main/GG-logo.png';
</script>
