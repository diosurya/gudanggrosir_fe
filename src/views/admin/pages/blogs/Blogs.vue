<script setup lang="ts">
import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue"
import UiParentCard from "@/components/shared/UiParentCard.vue"
import BlogList from "./components/ListData.vue"

const breadcrumbs = [
  { title: "Dashboard", disabled: false, href: "/" },
  { title: "Blogs", disabled: true, href: "#" }
]
</script>

<template>
  <BaseBreadcrumb title="Blogs" :breadcrumbs="breadcrumbs" />

  <v-row>
    <v-col cols="12">
      <UiParentCard title="Blog Management">
        <BlogList />
      </UiParentCard>
    </v-col>
  </v-row>
</template>
