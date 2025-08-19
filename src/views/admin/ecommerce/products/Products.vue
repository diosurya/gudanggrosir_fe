<script setup lang="ts">
import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue"
import UiParentCard from "@/components/shared/UiParentCard.vue"
import ProductList from "./components/ListData.vue"
import { useRouter } from "vue-router"

const router = useRouter()

const breadcrumbs = [
  { title: "Dashboard", disabled: false, href: "/" },
  { title: "Products", disabled: true, href: "#" },
]

const goToAdd = () => {
  router.push("/admin/ecommerce/products/add")
}
</script>

<template>
  <BaseBreadcrumb title="Products" :breadcrumbs="breadcrumbs" />
  <v-row>
    <v-col cols="12">
      <UiParentCard title="Product Management">
        <template #action>
          <v-btn color="primary" @click="goToAdd">
            + Add Product
          </v-btn>
        </template>

        <ProductList />
      </UiParentCard>
    </v-col>
  </v-row>
</template>
