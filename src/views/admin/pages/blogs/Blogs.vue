<script setup lang="ts">
import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue"
import UiParentCard from "@/components/shared/UiParentCard.vue"
import BlogList from "./components/ListData.vue"
import { useRouter } from "vue-router"

const router = useRouter()

const breadcrumbs = [
  { title: "Dashboard", disabled: false, href: "/admin/dashboard" },
  { title: "Blogs", disabled: true, href: "#" }
]

const goToAdd = () => {
  router.push("/admin/pages/blogs/add")
}
</script>

<template>
  <BaseBreadcrumb title="Blogs" :breadcrumbs="breadcrumbs" />

  <v-row>
    <v-col cols="12">
      <UiParentCard title="Blog Management">
         <template #action>
          <v-btn color="primary" @click="goToAdd">
            Add Data
          </v-btn>
        </template>
        <BlogList />
      </UiParentCard>
    </v-col>
  </v-row>
</template>
