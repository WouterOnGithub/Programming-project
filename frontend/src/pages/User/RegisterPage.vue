<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { auth, db } from '../../firebase/config'
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { collection, doc, setDoc, query, where, getDocs, getDoc } from 'firebase/firestore'
import '../../css/register.css'

const router = useRouter()
const toast = useToast()

const selectedType = ref('student')

const studentData = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

const companyData = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

const isStudent = () => selectedType.value === 'student'
const isBedrijf = () => selectedType.value === 'bedrijf'

const selectType = (type) => {
  selectedType.value = type
}

const clearForms = () => {
  Object.keys(studentData).forEach(key => studentData[key] = '')
  Object.keys(companyData).forEach(key => companyData[key] = '')
}

const handleRegister = async () => {
  try {
    const data = isStudent() ? studentData : companyData

    if (data.password !== data.confirmPassword) {
      toast.error('Wachtwoorden komen niet overeen')
      return
    }

    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', data.email))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      toast.error('Dit e-mailadres is al in gebruik')
      return
    }

    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
    const user = userCredential.user

    if (isStudent()) {
      await setDoc(doc(db, 'student', user.uid), {
        email: user.email,
        authUid: user.uid,
        createdAt: new Date()
      })
      toast.success('Student account succesvol aangemaakt!')
      clearForms()
      router.push({ path: '/Stinvoer', query: { fromRegister: '1' } })
    } else {
      await setDoc(doc(db, 'bedrijf', user.uid), {
        email: user.email,
        authUid: user.uid,
        createdAt: new Date(),
        verificatieStatus: 'wachtend op verificatie'
      })
      toast.success('Bedrijf account succesvol aangemaakt!')
      clearForms()
      router.push({ path: '/InvoerenBd', query: { fromRegister: '1' } })
    }
  } catch (e) {
    const message = e.message || 'Er is iets misgelopen.'
    if (message.includes('auth/weak-password')) {
      toast.error('Wachtwoord is te zwak (minimaal 6 tekens vereist).')
    } else if (message.includes('auth/invalid-email')) {
      toast.error('Voer een geldig e-mailadres in.')
    } else {
      toast.error('Registratie mislukt: ' + message)
    }
  }
}

const handleGoogleRegister = async () => {
  const provider = new GoogleAuthProvider()
  try {
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    let exists = false
    let route = '/dashboard'

    if (isStudent()) {
      const docRef = doc(db, 'student', user.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        exists = true
      } else {
        await setDoc(docRef, {
          email: user.email,
          authUid: user.uid,
          createdAt: new Date(),
          naam: user.displayName || user.email.split('@')[0]
        })
      }
      route = exists ? '/dashboard' : '/Stinvoer'
    } else if (isBedrijf()) {
      const docRef = doc(db, 'bedrijf', user.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        exists = true
      } else {
        await setDoc(docRef, {
          email: user.email,
          authUid: user.uid,
          bedrijfsnaam: user.displayName || user.email.split('@')[0],
          createdAt: new Date(),
          verificatieStatus: 'wachtend op verificatie'
        })
      }
      route = exists ? '/BedrijfDashboard' : '/InvoerenBd'
    }

    toast.success(`Welkom ${user.displayName || user.email}!`)
    router.push(route)
  } catch (e) {
    const message = e.message || 'Google-registratie mislukt.'
    if (message.includes('auth/popup-closed-by-user')) {
      toast.error('Google-popup is gesloten. Probeer opnieuw.')
    } else {
      toast.error('Google registratie mislukt: ' + message)
    }
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <nav class="navbar">
    <router-link to="/">
      <img src="/Images/ehb-logo.png" alt="Erasmus logo" class="logo" />
    </router-link>
    <div class="menu">
      <router-link to="/login" class="btn">Log In</router-link>
      <router-link to="/register" class="btn">Registratie</router-link>
    </div>
  </nav>

  <!-- Toast Container voor meldingen -->

  <div class="register-page">
    <div class="register-card">
      <h1>Account Aanmaken</h1>
      <p>Word onderdeel van het Student & Bedrijf Portal</p>

      <!-- Type Selectie -->
      <div class="type-selection">
        <h3>Kies uw account type</h3>
        <div class="type-cards">
          <div :class="['type-card', { active: isStudent() }]" @click="selectType('student')">
            <h4>👨‍🎓 Student</h4>
            <p>Vind stages en vacatures</p>
            <ul>
              <li>✓ Zoek stages</li>
              <li>✓ Maak profiel</li>
              <li>✓ Solliciteer direct</li>
            </ul>
          </div>

          <div :class="['type-card', { active: isBedrijf() }]" @click="selectType('bedrijf')">
            <h4>🏢 Bedrijf</h4>
            <p>Vind stagiairs en werknemers</p>
            <ul>
              <li>✓ Plaats vacatures</li>
              <li>✓ Beheer kandidaten</li>
              <li>✓ Bedrijfsprofiel</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Register Form -->
      <form @submit.prevent="handleRegister" class="register-form">
        <!-- Student Form -->
        <div v-if="isStudent()" class="form-section">
          <h4>👨‍🎓 Student Registratie</h4>

          <div>
            <label>Email:</label>
            <input v-model="studentData.email" type="email" placeholder="student@email.com" />
          </div>

          <div>
            <label>Wachtwoord:</label>
            <input v-model="studentData.password" type="password" placeholder="Minimaal 6 karakters" />
          </div>

          <div>
            <label>Bevestig Wachtwoord:</label>
            <input v-model="studentData.confirmPassword" type="password" placeholder="Herhaal wachtwoord" />
          </div>
        </div>

        <!-- Bedrijf Form -->
        <div v-if="isBedrijf()" class="form-section">
          <h4>🏢 Bedrijf Registratie</h4>

          <div>
            <label>E-mailadres:</label>
            <input v-model="companyData.email" type="email" placeholder="info@bedrijf.be" />
          </div>

          <div>
            <label>Wachtwoord:</label>
            <input v-model="companyData.password" type="password" placeholder="Minimaal 8 karakters" />
          </div>

          <div>
            <label>Bevestig Wachtwoord:</label>
            <input v-model="companyData.confirmPassword" type="password" placeholder="Herhaal wachtwoord" />
          </div>
        </div>

        <button type="submit" class="register-btn">
          {{ isStudent() ? 'Registreer als Student' : 'Registreer als Bedrijf' }}
        </button>

        <div class="divider">
          <span class="divider-text">OF</span>
        </div>

        <button type="button" class="google-login-btn" @click="handleGoogleRegister">
          <img src="/Images/google-logo.png" alt="Google logo" class="google-icon" />
          <span>Registreer met Google</span>
        </button>
      </form>

      <!-- Footer -->
      <div class="footer">
        <p>Heeft u al een account?</p>
        <router-link to="/Login">
          <button @click="goToLogin" class="login-btn">Inloggen</button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: white;
    padding: 1rem 2.5vw;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    border-radius: 16px;
    margin: 1.5rem auto 2.5rem auto;
    width: 97vw;
    max-width: 1200px;
    position: relative;
}

.logo {
    height: 45px;
}

.menu {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.btn {
    background-color: #c20000;
    color: white;
    padding: 0.6rem 1.5rem;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 500;
    font-size: 1rem;
    transition: background-color 0.2s;
    text-decoration: none;
}

.btn:hover {
    background-color: #a00000;
}

.menubar {
    font-size: 1.6rem;
    cursor: pointer;
}
</style>

