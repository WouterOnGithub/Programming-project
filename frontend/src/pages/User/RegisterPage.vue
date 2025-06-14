<script setup>
import { reactive, ref } from 'vue';
import { auth, db } from '../../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, doc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import axios from 'axios';
import '../../css/register.css'
import Navbar from '../../components/Navbar.vue'

const router = useRouter();
const error = ref('');

const studentData = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const companyData = reactive({
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
});

const selectedType = ref('student');

const sectors = [
  'IT & Software',
  'Marketing & Communicatie',
  'Financiën & Administratie',
  'Onderwijs & Training',
  'Gezondheidszorg',
  'Retail & Verkoop',
  'Productie & Industrie',
  'Overig'
];

const isStudent = () => selectedType.value === 'student';
const isBedrijf = () => selectedType.value === 'bedrijf';

const selectType = (type) => {
  selectedType.value = type;
};

const clearForms = () => {
  Object.keys(studentData).forEach(key => {
    studentData[key] = '';
  });
  Object.keys(companyData).forEach(key => {
    companyData[key] = '';
  });
};

const handleRegister = async () => {
  try {
    if (isStudent()) {
      if (studentData.password !== studentData.confirmPassword) {
        error.value = 'Wachtwoorden komen niet overeen';
        return;
      }

      // Check if email already exists
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', studentData.email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        error.value = 'Dit e-mailadres is al in gebruik';
        return;
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        studentData.email,
        studentData.password
      );

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: studentData.name,
        email: studentData.email,
        type: 'student',
        createdAt: new Date()
      });

      alert(`Student account aangemaakt voor ${studentData.name}!`);
      clearForms();
      router.push('/dashboard');
    } else {
      if (companyData.password !== companyData.confirmPassword) {
        error.value = 'Wachtwoorden komen niet overeen';
        return;
      }

      // Check if email already exists
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', companyData.email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        error.value = 'Dit e-mailadres is al in gebruik';
        return;
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        companyData.email,
        companyData.password
      );

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        companyName: companyData.companyName,
        sector: companyData.sector,
        address: companyData.address,
        phone: companyData.phone,
        email: companyData.email,
        btwNumber: companyData.btwNumber,
        contactName: companyData.contactName,
        contactEmail: companyData.contactEmail,
        linkedinUrl: companyData.linkedinUrl,
        type: 'bedrijf',
        createdAt: new Date()
      });

      alert(`Bedrijf account aangemaakt voor ${companyData.companyName}!`);
      clearForms();
      router.push('/dashboard');
    }
  } catch (e) {
    error.value = e.message;
  }
};

const goToLogin = () => {
  router.push('/login');
};
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