<script setup>
import { ref } from 'vue'
import { auth } from '../../firebase/config'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useRouter } from 'vue-router'
import '../../css/login.css'
import Navbar from '../../components/Navbar.vue'

// Form state
const selectedRole = ref('student')
const email = ref('')
const password = ref('')
const error = ref('')
const successMessage = ref('')

const router = useRouter()

const isStudent = () => selectedRole.value === 'student'
const isBedrijf = () => selectedRole.value === 'bedrijf'
const isAdmin = () => selectedRole.value === 'admin'

const selectRole = (role) => {
  selectedRole.value = role
  clearForm()
}

const clearForm = () => {
  email.value = ''
  password.value = ''
  error.value = ''
}

const showSuccessToast = (message) => {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

const handleLogin = async () => {
  error.value = ''

  if (!email.value || !password.value) {
    error.value = 'Vul alle velden in'
    return
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
    const user = userCredential.user

    if (isAdmin()) {
      const userDoc = await getDoc(doc(db, 'admin', user.uid))
      if (userDoc.exists()) {
        showSuccessToast('U bent succesvol ingelogd als admin!')
        setTimeout(() => {
          router.push('/admin/dashboard')
        }, 1000)
      } else {
        error.value = 'Geen admin rechten'
        await auth.signOut()
      }
      return
    }

    if (isStudent()) {
      showSuccessToast('U bent succesvol ingelogd als student!')
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } else if (isBedrijf()) {
      showSuccessToast('U bent succesvol ingelogd als bedrijf!')
      setTimeout(() => {
        router.push('/BedrijfDashboard')
      }, 1000)
    }
  } catch (e) {
    error.value = e.message
  }
}

const goToRegister = () => {
  window.location.href = '/register'
}
</script>

<template>
  <Navbar />

  <!-- Custom toast rechtsboven -->
  <div v-if="successMessage" class="floating-toast">
    {{ successMessage }}
  </div>

  <div class="login-page">
    <div class="login-card">
      <h1>Welkom Terug</h1>
      <p>Log in op het Student & Bedrijf Portal</p>

      <!-- Rol Selectie -->
      <div class="role-selection">
        <h3>Kies uw rol</h3>
        <div class="role-cards">
          <div :class="['role-card', { active: isStudent() }]" @click="selectRole('student')">
            <h4>👨‍🎓 Student</h4>
            <p>Zoek stages en vacatures</p>
          </div>

          <div :class="['role-card', { active: isBedrijf() }]" @click="selectRole('bedrijf')">
            <h4>🏢 Bedrijf</h4>
            <p>Vind stagiairs en werknemers</p>
          </div>

          <div :class="['role-card', { active: isAdmin() }]" @click="selectRole('admin')">
            <h4>⚙️ Administrator</h4>
            <p>Beheer het systeem</p>
          </div>
        </div>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div v-if="error" class="error-box">
          {{ error }}
        </div>

        <div>
          <label>Email:</label>
          <input v-model="email" type="email" placeholder="uw@email.com" />
        </div>

        <div>
          <label>Wachtwoord:</label>
          <input v-model="password" type="password" placeholder="Uw wachtwoord" />
        </div>

        <button type="submit" class="login-btn">
          Inloggen als {{ isStudent() ? 'Student' : isBedrijf() ? 'Bedrijf' : 'Administrator' }}
        </button>
      </form>

      <!-- Footer -->
      <div class="footer">
        <p>Nog geen account?</p>
        <router-link to="/register">
          <button @click="goToRegister" class="register-btn">Account aanmaken</button>
        </router-link>
      </div>
    </div>
  </div>
</template>

