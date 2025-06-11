<script setup>
import { reactive, ref } from 'vue';
import { auth, db } from '../../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import '../../css/login.css'
import Navbar from '../../components/Navbar.vue'


// Simpele form state
const selectedRole = ref('student')
const email = ref('')
const password = ref('')
const name = ref('')
const companyName = ref('')

// Simpele validatie
const error = ref('')

const router = useRouter();

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
  name.value = ''
  companyName.value = ''
  error.value = ''
}

const handleLogin = async () => {
  error.value = ''

  // Basis validatie
  if (!email.value || !password.value) {
    error.value = 'Vul alle velden in'
    return
  }

  if (isStudent() && !name.value) {
    error.value = 'Vul uw naam in'
    return
  }

  if (isBedrijf() && !companyName.value) {
    error.value = 'Vul uw bedrijfsnaam in'
    return
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;
    
    // Check if user is admin
    if (isAdmin()) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        router.push('/admin/dashboard');
        return;
      } else {
        error.value = 'Geen admin rechten';
        await auth.signOut();
        return;
      }
    }

    let welcomeName = ''
    if (isStudent()) welcomeName = name.value
    else if (isBedrijf()) welcomeName = companyName.value
    
    alert(`Welkom ${welcomeName}!`);
    router.push('/');
  } catch (e) {
    error.value = e.message;
  }
}

const goToRegister = () => {
  window.location.href = '/register';
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

        <!-- Student velden -->
        <div v-if="isStudent()">
          <label>Naam:</label>
          <input v-model="name" type="text" placeholder="Uw volledige naam" />
        </div>

        <!-- Bedrijf velden -->
        <div v-if="isBedrijf()">
          <label>Bedrijfsnaam:</label>
          <input v-model="companyName" type="text" placeholder="Uw bedrijfsnaam" />
        </div>

        <!-- Algemene velden -->
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
        <router-link to="/register"> <button @click="goToRegister" class="register-btn"> Account aanmaken </button> </router-link>
      </div>
    </div>
  </div>
</template>