<script setup>
import { ref } from 'vue'
import { auth } from '../../firebase/config'
import { signInWithEmailAndPassword, getAuth, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useRouter } from 'vue-router'
import '../../css/login.css'
import Navbar from '../../components/Navbar.vue'
import { collection, getDocs, query, where } from 'firebase/firestore';

// Form state
const selectedRole = ref('student')
const email = ref('')
const password = ref('')
const error = ref('')
const successMessage = ref('')

// Password reset state
const showResetModal = ref(false)
const resetEmail = ref('')
const resetError = ref('')
const resetSuccess = ref('')
const passwordResetSent = ref(false)

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
      const q = query(collection(db, 'student'), where('authUid', '==', user.uid));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        error.value = 'U kunt niet inloggen als student, want u bent geen student.';
        await auth.signOut();
        return;
      }
      showSuccessToast('U bent succesvol ingelogd als student!')
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } else if (isBedrijf()) {
      const q = query(collection(db, 'bedrijf'), where('authUid', '==', user.uid));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        error.value = 'U kunt niet inloggen als bedrijf, want u bent geen bedrijf.';
        await auth.signOut();
        return;
      }
      showSuccessToast('U bent succesvol ingelogd als bedrijf!')
      setTimeout(() => {
        router.push('/BedrijfDashboard')
      }, 1000)
    }

    alert(`Welkom ${user.displayName || user.email}!`);
  } catch (e) {
    error.value = e.message
  }
}

const handleGoogleLogin = async () => {
  error.value = '';
  const provider = new GoogleAuthProvider();
  try {
    const authInstance = getAuth();
    const result = await signInWithPopup(authInstance, provider);
    const user = result.user;

    // Check of profiel al bestaat in Firestore
    let exists = false;
    let route = '/dashboard';

    if (isStudent()) {
      const q = query(collection(db, 'student'), where('authUid', '==', user.uid));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        error.value = 'U kunt niet inloggen als student, want u bent geen student.';
        await auth.signOut();
        return;
      }
      exists = !querySnapshot.empty;
      route = exists ? '/dashboard' : '/Stinvoer';
    } else if (isBedrijf()) {
      const q = query(collection(db, 'bedrijf'), where('authUid', '==', user.uid));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        error.value = 'U kunt niet inloggen als bedrijf, want u bent geen bedrijf.';
        await auth.signOut();
        return;
      }
      exists = !querySnapshot.empty;
      route = exists ? '/BedrijfDashboard' : '/InvoerenBd';
    }

    if (exists) {
      showSuccessToast('Succesvol ingelogd!');
    } else {
      showSuccessToast('Welkom! Maak je profiel af.');
    }
    setTimeout(() => {
      router.push(route);
    }, 1000);
  } catch (e) {
    error.value = 'Google login mislukt: ' + (e.message || e);
  }
}

const goToRegister = () => {
  window.location.href = '/register'
}

// Password reset functions
const openResetModal = () => {
  showResetModal.value = true
  resetEmail.value = ''
  resetError.value = ''
  resetSuccess.value = ''
  passwordResetSent.value = false
}

const closeResetModal = () => {
  showResetModal.value = false
  resetEmail.value = ''
  resetError.value = ''
  resetSuccess.value = ''
}

const handlePasswordReset = async () => {
  resetError.value = ''
  resetSuccess.value = ''

  if (!resetEmail.value) {
    resetError.value = 'Vul uw e-mailadres in'
    return
  }

  try {
    await sendPasswordResetEmail(auth, resetEmail.value)
    resetSuccess.value = 'Een wachtwoord reset e-mail is verzonden naar uw e-mailadres. Controleer uw inbox en spam folder.'
    passwordResetSent.value = true
    setTimeout(() => {
      closeResetModal()
    }, 3000)
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      resetError.value = 'U heeft geen account op deze site. Controleer uw e-mailadres of registreer u eerst.'
    } else if (error.code === 'auth/invalid-email') {
      resetError.value = 'Vul een geldig e-mailadres in.'
    } else {
      resetError.value = 'Er is een fout opgetreden. Probeer het later opnieuw.'
    }
  }
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
        <button type="button" class="google-login-btn" @click="handleGoogleLogin">
          <img src="/Images/google-logo.png" alt="Google logo" class="google-icon" />
          <span>Inloggen met Google</span>
        </button>
      </form>

      <!-- Wachtwoord vergeten link -->
      <div class="forgot-password">
        <button @click="openResetModal" class="forgot-password-btn">
          Wachtwoord vergeten?
        </button>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>Nog geen account?</p>
        <router-link to="/register">
          <button @click="goToRegister" class="register-btn">Account aanmaken</button>
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
        <p>Vul uw e-mailadres in om een wachtwoord reset link te ontvangen.</p>
        
        <div v-if="resetError" class="error-box">
          {{ resetError }}
        </div>
        
        <div v-if="resetSuccess" class="success-box">
          {{ resetSuccess }}
        </div>

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

