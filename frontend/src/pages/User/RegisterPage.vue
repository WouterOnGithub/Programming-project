<script setup lang="ts">
import '../../css/home.css'
import { reactive, ref } from 'vue'
import axios from 'axios'

const form = reactive({
  name: '',
  email: '',
  password: ''
})

const message = ref('')

async function submitForm() {
  try {
    const response = await axios.post('http://localhost:3000/api/register', form)
    message.value = response.data.message || 'Account created successfully!'
    
    // Reset form
    Object.keys(form).forEach(key => form[key] = '')
  } catch (error: any) {
    message.value = error.response?.data?.message || 'Error registering account'
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="header">
        <h2>Create an account</h2>
        <p>Sign up to get started</p>
      </div>

      <form @submit.prevent="submitForm" class="form">
        <div class="form-group">
          <label for="name">Name</label>
          <input
            id="name"
            type="text"
            v-model="form.name"
            required
            placeholder="Your name"
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            v-model="form.email"
            required
            placeholder="you@example.com"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            type="password"
            v-model="form.password"
            required
            placeholder="••••••••"
          />
        </div>

        <button type="submit" class="submit-btn">
          Sign up
        </button>
      </form>

      <div class="footer">
        <p>
          Already have an account?
          <router-link to="/login" class="link">Sign in</router-link>
        </p>
      </div>

      <p v-if="message" class="message">{{ message }}</p>
    </div>
  </div>
</template>

<style scoped>
/* Stijl kopiëren van jouw login-pagina */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  padding: 1rem;
}

.login-card {
  max-width: 28rem;
  width: 100%;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
              0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
}

.header p {
  color: #6b7280;
  margin: 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  font-size: 1rem;
}

.submit-btn {
  background-color: #2563eb;
  color: white;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.submit-btn:hover {
  background-color: #1d4ed8;
}

.footer {
  text-align: center;
  margin-top: 1.5rem;
}

.footer p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.link {
  font-weight: 500;
  color: #2563eb;
  text-decoration: none;
  transition: color 0.2s;
}

.link:hover {
  color: #1d4ed8;
}

.message {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: green;
  text-align: center;
}
</style>
