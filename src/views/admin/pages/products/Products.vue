<script setup lang="ts">
import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue"
import UiParentCard from "@/components/shared/UiParentCard.vue"
import ProductList from "./components/ListData.vue"

const breadcrumbs = [
  { title: "Dashboard", disabled: false, href: "/" },
  { title: "Products", disabled: true, href: "#" },
]
</script>

<template>
  <BaseBreadcrumb title="Products" :breadcrumbs="breadcrumbs" />
  <v-row>
    <v-col cols="12">
      <UiParentCard title="Product Management">
        <ProductList />
      </UiParentCard>
    </v-col>
  </v-row>
</template>
