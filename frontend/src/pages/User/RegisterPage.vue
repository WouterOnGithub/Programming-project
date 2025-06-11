<script setup>
import { reactive, ref } from 'vue';
import axios from 'axios';
import '../../css/register.css'
import Navbar from '../../components/Navbar.vue'


// Simpele form state
const selectedType = ref('student')

// Student form
const studentData = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// Bedrijf form
const companyData = ref({
  companyName: '',
  sector: '',
  address: '',
  phone: '',
  email: '',
  btwNumber: '',
  contactName: '',
  contactEmail: '',
  linkedinUrl: '',
  password: '',
  confirmPassword: ''
})

const error = ref('')

const sectors = [
  'IT & Software',
  'Marketing & Communicatie',
  'Finance & Banking',
  'Healthcare',
  'Engineering',
  'Education',
  'Retail',
  'Manufacturing',
  'Consulting',
  'Non-profit',
  'Government',
  'Other'
]

const isStudent = () => selectedType.value === 'student'
const isBedrijf = () => selectedType.value === 'bedrijf'

const selectType = (type) => {
  selectedType.value = type
  clearForms()
}

const clearForms = () => {
  studentData.value = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  }

  companyData.value = {
    companyName: '',
    sector: '',
    address: '',
    phone: '',
    email: '',
    btwNumber: '',
    contactName: '',
    contactEmail: '',
    linkedinUrl: '',
    password: '',
    confirmPassword: ''
  }

  error.value = ''
}

const handleRegister = () => {
  error.value = ''

  if (isStudent()) {
    const data = studentData.value

    if (!data.name || !data.email || !data.password || !data.confirmPassword) {
      error.value = 'Vul alle velden in'
      return
    }

    if (data.password !== data.confirmPassword) {
      error.value = 'Wachtwoorden komen niet overeen'
      return
    }

    if (data.password.length < 6) {
      error.value = 'Wachtwoord moet minimaal 6 karakters zijn'
      return
    }

    alert(`Student account aangemaakt voor ${data.name}!`)
  } else {
    const data = companyData.value

    if (!data.companyName || !data.sector || !data.address || !data.phone ||
      !data.email || !data.btwNumber || !data.contactName || !data.contactEmail ||
      !data.password || !data.confirmPassword) {
      error.value = 'Vul alle velden in'
      return
    }

    if (data.password !== data.confirmPassword) {
      error.value = 'Wachtwoorden komen niet overeen'
      return
    }

    if (data.password.length < 8) {
      error.value = 'Wachtwoord moet minimaal 8 karakters zijn'
      return
    }

    alert(`Bedrijf account aangemaakt voor ${data.companyName}!`)
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>

<Navbar />

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
        <div v-if="error" class="error-box">
          {{ error }}
        </div>

        <!-- Student Form -->
        <div v-if="isStudent()" class="form-section">
          <h4>👨‍🎓 Student Registratie</h4>

          <div>
            <label>Volledige Naam:</label>
            <input v-model="studentData.name" type="text" placeholder="Voor- en achternaam" />
          </div>

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

        <div v-if="isBedrijf()" class="form-section">
          <h4>🏢 Bedrijf Registratie</h4>

          <div>
            <label>Bedrijfsnaam:</label>
            <input v-model="companyData.companyName" type="text" placeholder="Naam van uw bedrijf" />
          </div>

          <div>
            <label>Sector:</label>
            <select v-model="companyData.sector">
              <option value="">Selecteer een sector</option>
              <option v-for="sector in sectors" :key="sector" :value="sector">
                {{ sector }}
              </option>
            </select>
          </div>

          <div>
            <label>Straat en nummer:</label>
            <input v-model="companyData.address" type="text" placeholder="Straatnaam 123, 1234 AB Plaats" />
          </div>

          <div>
            <label>Telefoonnummer:</label>
            <input v-model="companyData.phone" type="tel" placeholder="+32 6 12345678" />
          </div>

          <div>
            <label>E-mailadres:</label>
            <input v-model="companyData.email" type="email" placeholder="info@bedrijf.be" />
          </div>

          <div>
            <label>BTW-nummer:</label>
            <input v-model="companyData.btwNumber" type="text" placeholder="BE123456789B01" />
          </div>

          <div>
            <label>Naam contactpersoon vertegenwoordiger beurs:</label>
            <input v-model="companyData.contactName" type="text" placeholder="Voor- en achternaam contactpersoon" />
          </div>

          <div>
            <label>E-mailadres contactpersoon:</label>
            <input v-model="companyData.contactEmail" type="email" placeholder="contact@bedrijf.be" />
          </div>

          <div>
            <label>LinkedIn-URL van het bedrijf (optioneel):</label>
            <input v-model="companyData.linkedinUrl" type="url" placeholder="https://linkedin.com/bedrijfsnaam" />
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
      </form>

      <!-- Footer -->
      <div class="footer">
        <p>Heeft u al een account?</p>
        <router-link to="/Login"><button @click="goToLogin" class="login-btn">Inloggen</button></router-link>
      </div>
    </div>
  </div>
</template>