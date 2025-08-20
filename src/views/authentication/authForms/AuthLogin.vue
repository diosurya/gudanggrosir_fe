<script setup lang="ts">
import { ref } from 'vue';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons-vue';
import { useAuthStore } from '@/stores/auth';
import { Form } from 'vee-validate';

const checkbox = ref(false);
const valid = ref(false);
const show1 = ref(false);
const login = ref(''); // ini bisa email / username
const password = ref('');

// Rules
const loginRules = ref([
  (v: string) => !!v.trim() || 'Username atau Email wajib diisi'
]);
const passwordRules = ref([
  (v: string) => !!v || 'Password wajib diisi'
]);

/* eslint-disable @typescript-eslint/no-explicit-any */
function validate(values: any, { setErrors }: any) {
  const authStore = useAuthStore();
  return authStore.login(login.value.trim(), password.value)
    .catch((error) => setErrors({ apiError: error }));
}
</script>

<template>
  <div class="d-flex justify-space-between align-center">
    <h3 class="text-h3 text-center mb-0">Login</h3>
    <router-link to="/register" class="text-primary text-decoration-none">Don't Have an account?</router-link>
  </div>
  <Form @submit="validate" class="mt-7 loginForm" v-slot="{ errors, isSubmitting }">
    <div class="mb-6">
      <v-label>Username atau Email</v-label>
      <v-text-field
        aria-label="login"
        v-model="login"
        :rules="loginRules"
        class="mt-2"
        required
        hide-details="auto"
        variant="outlined"
        color="primary"
      ></v-text-field>
    </div>
    <div>
      <v-label>Password</v-label>
      <v-text-field
        aria-label="password"
        v-model="password"
        :rules="passwordRules"
        required
        variant="outlined"
        color="primary"
        hide-details="auto"
        :type="show1 ? 'text' : 'password'"
        class="mt-2"
      >
        <template v-slot:append-inner>
          <v-btn color="secondary" icon rounded variant="text">
            <EyeInvisibleOutlined v-if="!show1" @click="show1 = !show1" />
            <EyeOutlined v-if="show1" @click="show1 = !show1" />
          </v-btn>
        </template>
      </v-text-field>
    </div>

    <div class="d-flex align-center mt-4 mb-7 mb-sm-0">
      <v-checkbox
        v-model="checkbox"
        label="Keep me signed in"
        color="primary"
        class="ms-n2"
        hide-details
      ></v-checkbox>
      <div class="ml-auto">
        <router-link to="/forgot-password" class="text-darkText link-hover">Forgot Password?</router-link>
      </div>
    </div>
    <v-btn color="primary" :loading="isSubmitting" block class="mt-5" variant="flat" size="large" :disabled="valid" type="submit">
      Login
    </v-btn>
    <div v-if="errors.apiError" class="mt-2">
      <v-alert color="error">{{ errors.apiError }}</v-alert>
    </div>
  </Form>
</template>
