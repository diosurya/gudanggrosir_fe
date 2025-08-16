<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  type?: "table" | "card" | "list",
  rows?: number
}>()

const skeletonRows = computed(() => Array.from({ length: props.rows || 5 }))
</script>

<template>
  <div>
    <!-- Table Skeleton -->
    <template v-if="type === 'table'">
      <v-skeleton-loader
        v-for="(_, i) in skeletonRows"
        :key="i"
        type="table-row"
        class="mb-2"
      />
    </template>

    <!-- Card Skeleton -->
    <template v-else-if="type === 'card'">
      <v-skeleton-loader
        v-for="(_, i) in skeletonRows"
        :key="i"
        type="card"
        class="mb-4"
      />
    </template>

    <!-- List Skeleton -->
    <template v-else>
      <v-skeleton-loader
        v-for="(_, i) in skeletonRows"
        :key="i"
        type="list-item"
        class="mb-2"
      />
    </template>
  </div>
</template>
