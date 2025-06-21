<script setup>
import { reactive, ref } from 'vue';
import { auth, db, GoogleAuthProvider, signInWithPopup } from '../../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, setDoc, query, where, getDocs, getDoc } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import '../../css/register.css'
import Navbar from '../../components/Navbar.vue'

const router = useRouter();
const error = ref('');

// Verwijderd: name
const studentData = reactive({
  email: '',
  password: '',
  confirmPassword: ''
});

const companyData = reactive({
  email: '',
  password: '',
  confirmPassword: ''
});

const selectedType = ref('student');

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

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', studentData.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        error.value = 'Dit e-mailadres is al in gebruik';
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        studentData.email,
        studentData.password
      );
      const user = userCredential.user;

      // Maak een document aan in de 'student' collectie
      await setDoc(doc(db, 'student', user.uid), {
        email: user.email,
        authUid: user.uid,
        createdAt: new Date() // Gebruik new Date() i.p.v. serverTimestamp
      });

      alert(`Student account aangemaakt!`);
      clearForms();
      router.push({ path: '/Stinvoer', query: { fromRegister: '1' } });

    } else {
      if (companyData.password !== companyData.confirmPassword) {
        error.value = 'Wachtwoorden komen niet overeen';
        return;
      }

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', companyData.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        error.value = 'Dit e-mailadres is al in gebruik';
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        companyData.email,
        companyData.password
      );
      const user = userCredential.user;

      // Maak een document aan in de 'bedrijf' collectie
      await setDoc(doc(db, 'bedrijf', user.uid), {
        email: user.email,
        authUid: user.uid,
        createdAt: new Date(),
        verificatieStatus: 'wachtend op verificatie'
      });

      alert(`Bedrijf account aangemaakt!`);
      clearForms();
      router.push({ path: '/InvoerenBd', query: { fromRegister: '1' } });
    }
  } catch (e) {
    error.value = e.message;
  }
};

const handleGoogleRegister = async () => {
  error.value = '';
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check of profiel al bestaat in Firestore
    let exists = false;
    let route = '/dashboard';

    if (isStudent()) {
      // Controleer in 'student' collectie
      const studentDocRef = doc(db, 'student', user.uid);
      const studentDocSnap = await getDoc(studentDocRef);
      if (studentDocSnap.exists()) {
        exists = true;
      } else {
        // Maak student document aan als het niet bestaat
        await setDoc(studentDocRef, {
          email: user.email,
          authUid: user.uid,
          createdAt: new Date(),
          naam: user.displayName || user.email.split('@')[0]
        });
      }
      route = exists ? '/dashboard' : '/Stinvoer';
    } else if (isBedrijf()) {
      // Controleer in 'bedrijf' collectie
      const bedrijfDocRef = doc(db, 'bedrijf', user.uid);
      const bedrijfDocSnap = await getDoc(bedrijfDocRef);
      if (bedrijfDocSnap.exists()) {
        exists = true;
      } else {
        // Maak bedrijf document aan als het niet bestaat
        await setDoc(bedrijfDocRef, {
          email: user.email,
          authUid: user.uid,
          bedrijfsnaam: user.displayName || user.email.split('@')[0],
          createdAt: new Date(),
          verificatieStatus: 'wachtend op verificatie'
        });
      }
      route = exists ? '/BedrijfDashboard' : '/InvoerenBd';
    }

    alert(`Welkom ${user.displayName || user.email}!`);
    router.push(route);
  } catch (e) {
    error.value = e.message;
  }
}

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

          <!-- Naam veld verwijderd -->

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
        <button type="button" class="google-login-btn" @click="handleGoogleRegister">
          <img src="/Images/google-logo.png" alt="Google logo" class="google-icon" />
          <span>Inloggen met Google</span>
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
