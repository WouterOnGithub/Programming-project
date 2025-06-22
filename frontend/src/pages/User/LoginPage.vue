<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import Navbar from '../../components/Navbar.vue'
import '../../css/login.css'

import { auth, db } from '../../firebase/config'
import {
  signInWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth'
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore'

const toast = useToast()
const router = useRouter()

const selectedRole = ref('student')
const email = ref('')
const password = ref('')

const showResetModal = ref(false)
const resetEmail = ref('')
const passwordResetSent = ref(false)

const isStudent = () => selectedRole.value === 'student'
const isBedrijf = () => selectedRole.value === 'bedrijf'

const selectRole = (role) => {
  selectedRole.value = role
  email.value = ''
  password.value = ''
}

// ✅ E-mail login
const handleLogin = async () => {
  if (!email.value || !password.value) {
    toast.error('Vul alle velden in.')
    return
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
    const user = userCredential.user

    if (isStudent()) {
      const q = query(collection(db, 'student'), where('authUid', '==', user.uid))
      const querySnapshot = await getDocs(q)
      if (querySnapshot.empty) {
        toast.error('U bent geen student.')
        await auth.signOut()
        return
      }
      toast.success('Welkom student!')
      setTimeout(() => router.push('/dashboard'), 1000)
    } else if (isBedrijf()) {
      const q = query(collection(db, 'bedrijf'), where('authUid', '==', user.uid))
      const querySnapshot = await getDocs(q)
      if (querySnapshot.empty) {
        toast.error('U bent geen bedrijf.')
        await auth.signOut()
        return
      }
      toast.success('Welkom bedrijf!')
      setTimeout(() => router.push('/BedrijfDashboard'), 1000)
    }

  } catch (e) {
    const code = e.code
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
        toast.error('Ongeldige inloggegevens.')
        break
      case 'auth/wrong-password':
        toast.error('Verkeerd wachtwoord.')
        break
      case 'auth/too-many-requests':
        toast.error('Te veel pogingen. Probeer later opnieuw.')
        break
      case 'auth/invalid-email':
        toast.error('Ongeldig e-mailadres.')
        break
      default:
        toast.error('Er is iets misgegaan.')
        console.error(e)
    }
  }
}

// ✅ Google login
const handleGoogleLogin = async () => {
  const provider = new GoogleAuthProvider()
  try {
    const result = await signInWithPopup(getAuth(), provider)
    const user = result.user

    let exists = false
    let route = '/dashboard'

    if (isStudent()) {
      const q = query(collection(db, 'student'), where('authUid', '==', user.uid))
      const querySnapshot = await getDocs(q)
      if (querySnapshot.empty) {
        toast.error('U bent geen student.')
        await auth.signOut()
        return
      }
      exists = !querySnapshot.empty
      route = exists ? '/dashboard' : '/Stinvoer'
    } else if (isBedrijf()) {
      const q = query(collection(db, 'bedrijf'), where('authUid', '==', user.uid))
      const querySnapshot = await getDocs(q)
      if (querySnapshot.empty) {
        toast.error('U bent geen bedrijf.')
        await auth.signOut()
        return
      }
      exists = !querySnapshot.empty
      route = exists ? '/BedrijfDashboard' : '/InvoerenBd'
    }

    toast.success(exists ? 'Succesvol ingelogd!' : 'Welkom! Maak je profiel af.')
    setTimeout(() => router.push(route), 1000)
  } catch (e) {
    const code = e.code
    switch (code) {
      case 'auth/popup-closed-by-user':
        toast.error('Inloggen geannuleerd.')
        break
      case 'auth/account-exists-with-different-credential':
        toast.error('Er bestaat al een account met dit e-mailadres. Gebruik de juiste loginmethode.')
        break
      default:
        toast.error('Google login mislukt. Probeer opnieuw.')
        console.error(e)
    }
  }
}

// ✅ Reset wachtwoord
const openResetModal = () => {
  showResetModal.value = true
  resetEmail.value = ''
  passwordResetSent.value = false
}

const closeResetModal = () => {
  showResetModal.value = false
  resetEmail.value = ''
  passwordResetSent.value = false
}

const handlePasswordReset = async () => {
  if (!resetEmail.value) {
    toast.error('Vul uw e-mailadres in.')
    return
  }

  try {
    await sendPasswordResetEmail(auth, resetEmail.value)
    toast.success('Resetlink verzonden. Controleer uw inbox.')
    passwordResetSent.value = true
    setTimeout(() => closeResetModal(), 3000)
  } catch (error) {
    const code = error.code
    switch (code) {
      case 'auth/user-not-found':
        toast.error('Geen account gevonden. Registreer u eerst.')
        break
      case 'auth/invalid-email':
        toast.error('Vul een geldig e-mailadres in.')
        break
      default:
        toast.error('Er is iets misgegaan.')
        console.error(error)
    }
  }
}
</script>

<template>
  <Navbar />

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
        </div>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div>
          <label>Email:</label>
          <input v-model="email" type="email" placeholder="uw@email.com" />
        </div>

        <div>
          <label>Wachtwoord:</label>
          <input v-model="password" type="password" placeholder="Uw wachtwoord" />
        </div>

        <button type="submit" class="login-btn">Login</button>
      </form>

      <!-- Divider -->
      <div class="divider">
        <span class="divider-text">OF</span>
      </div>

      <!-- Google Login -->
      <button @click="handleGoogleLogin" class="google-login-btn">
        <img src="/Images/google-logo.png" alt="Google logo" />
        Log in met Google
      </button>

      <button @click="openResetModal" class="forgot-password-btn">
        🔑 Wachtwoord vergeten?
      </button>

      <!-- Footer -->
      <div class="footer">
        <p>Nog geen account?</p>
        <router-link to="/register">
          <button class="register-btn">Account aanmaken</button>
        </router-link>
      </div>
    </div>
  </div>

  <!-- Password Reset Modal -->
  <div v-if="showResetModal" class="modal-overlay" @click="closeResetModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Wachtwoord vergeten</h3>
        <button @click="closeResetModal" class="close-button">×</button>
      </div>
      <div class="modal-body">
        <p>Vul uw e-mailadres in om een resetlink te ontvangen.</p>

        <form @submit.prevent="handlePasswordReset" class="reset-form">
          <div>
            <label>E-mailadres:</label>
            <input
              v-model="resetEmail"
              type="email"
              placeholder="uw@email.com"
              :disabled="passwordResetSent"
            />
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeResetModal" class="cancel-btn">
              Annuleren
            </button>
            <button type="submit" class="reset-btn" :disabled="passwordResetSent">
              Reset wachtwoord
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
