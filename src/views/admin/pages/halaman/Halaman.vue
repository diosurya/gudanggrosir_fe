<script setup lang="ts">
import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue"
import UiParentCard from "@/components/shared/UiParentCard.vue"
import PageList from "./components/ListData.vue"
import { useRouter } from "vue-router"

const router = useRouter()

const breadcrumbs = [
  { title: "Dashboard", disabled: false, href: "/admin/dashboard" },
  { title: "Pages", disabled: true, href: "#" }
]

const goToAdd = () => {
  router.push("/admin/pages/add")
}
</script>

<template>
  <BaseBreadcrumb title="Pages" :breadcrumbs="breadcrumbs" />

  <v-row>
    <v-col cols="12">
      <UiParentCard title="Page Management">
         <template #action>
          <v-btn color="primary" @click="goToAdd">
            Add Data
          </v-btn>
        </template>
        <PageList />
      </UiParentCard>
    </v-col>
  </v-row>
</template>