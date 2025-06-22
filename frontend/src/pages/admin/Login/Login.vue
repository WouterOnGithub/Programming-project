<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
// Firebase
import { auth, db } from '../../../firebase/config'
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

const toast = useToast()
const router = useRouter()

const email = ref('')
const password = ref('')
const showResetModal = ref(false)
const resetEmail = ref('')
const passwordResetSent = ref(false)

// E-mail login enkel voor admin
const handleLogin = async () => {
  if (!email.value || !password.value) {
    toast.error('Vul alle velden in.')
    return
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
    const user = userCredential.user

    const userDoc = await getDoc(doc(db, 'admin', user.uid))
    if (userDoc.exists()) {
      toast.success('Welkom administrator!')
      setTimeout(() => router.push('/admin/dashboard'), 1000)
    } else {
      toast.error('Geen adminrechten gevonden.')
      await auth.signOut()
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
        toast.error('Er is iets misgegaan. Probeer opnieuw.')
        console.error(e)
    }
  }
}

// Reset wachtwoord
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
        toast.error('Geen account gevonden.')
        break
      case 'auth/invalid-email':
        toast.error('Ongeldig e-mailadres.')
        break
      default:
        toast.error('Fout bij resetten. Probeer opnieuw.')
        console.error(error)
    }
  }
}
</script>

<template>
      <header class="admin-header">
    <div class="admin-header-content">
      <h1 class="admin-title">Admin Portaal</h1>
    </div>
  </header>
  <div class="login-container">
    <div class="login-card">

      <div class="login-header">
  <div class="logo">
    <img src="/Images/ehb-logo.png" alt="Erasmus Hogeschool Brussel" class="ehb-login-logo" />
  </div>

        <h1>Welkom terug</h1>
        <p>Log in op uw administrator account</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <input 
            v-model="email" 
            type="email" 
            placeholder="E-mailadres"
            class="input" 
          />
        </div>

        <div class="input-group">
          <input 
            v-model="password" 
            type="password" 
            placeholder="Wachtwoord"
            class="input" 
          />
        </div>

        <button type="submit" class="primary-btn">
          Log in
        </button>
      </form>

      <button @click="openResetModal" class="link-btn">
        Wachtwoord vergeten?
      </button>
    </div>
  </div>


  <div v-if="showResetModal" class="modal-overlay" @click="closeResetModal">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>Wachtwoord vergeten</h2>
        <p>Voer uw e-mailadres in en we sturen u een link om uw wachtwoord opnieuw in te stellen.</p>
      </div>
      
      <form @submit.prevent="handlePasswordReset">
        <div class="input-group">
          <input
            v-model="resetEmail"
            type="email"
            placeholder="E-mailadres"
            class="input"
            :disabled="passwordResetSent"
          />
        </div>

        <div class="modal-actions">
          <button type="button" @click="closeResetModal" class="secondary-btn">
            Annuleren
          </button>
          <button type="submit" class="primary-btn" :disabled="passwordResetSent">
            {{ passwordResetSent ? 'Verzonden' : 'Verstuur' }}
          </button>
        </div>
      </form>
    </div>
    </div>
    <footer class="admin-footer">
      <div class="admin-footer-content">
        <p>© 2025 Erasmus Hogeschool Brussel.</p>
      </div>
    </footer>
</template>

<style scoped>
.admin-footer {
  background-color: #ffffff;
  border-top: 1px solid #e5e7eb;
  padding: 16px 24px;
  text-align: center;
  font-size: 14px;
  color: #6b7280;
  margin-top: auto;
}

.login-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.login-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}


.admin-header {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.admin-header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.login-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 48px 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
}
.ehb-login-logo {
  height: 60px;
  object-fit: contain;
  display: block;
  margin: 0 auto 20px auto;
}

.login-header h1 {
  font-size: 32px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.login-header p {
  font-size: 17px;
  color: #86868b;
  font-weight: 400;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.input-group {
  position: relative;
}

.input {
  width: 100%;
  padding: 16px 20px;
  font-size: 17px;
  border: 1.5px solid #d1d1d6;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
  font-family: inherit;
  color: #1d1d1f;
}

.input:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
  background: white;
}

.input::placeholder {
  color: #86868b;
}

.primary-btn {
  width: 100%;
  padding: 16px;
  font-size: 17px;
  font-weight: 600;
  color: white;
  background: #007aff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  margin-top: 8px;
}

.primary-btn:hover:not(:disabled) {
  background: #0056cc;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.primary-btn:active {
  transform: translateY(0);
}

.primary-btn:disabled {
  background: #d1d1d6;
  cursor: not-allowed;
}

.link-btn {
  width: 100%;
  padding: 12px;
  font-size: 17px;
  color: #007aff;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
  font-family: inherit;
}

.ink-btn:hover {
  opacity: 0.7;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 20px;
  padding: 32px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  text-align: center;
  margin-bottom: 32px;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 8px;
  letter-spacing: -0.3px;
}

.modal-header p {
  font-size: 15px;
  color: #86868b;
  line-height: 1.4;
  margin: 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.secondary-btn {
  flex: 1;
  padding: 14px;
  font-size: 17px;
  font-weight: 500;
  color: #007aff;
  background: transparent;
  border: 1.5px solid #d1d1d6;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.secondary-btn:hover {
  background: #f5f5f7;
  border-color: #007aff;
}

.primary-btn {
  flex: 1;
}

/* Responsive Design */
@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
    margin: 20px;
  }
  
  .login-header h1 {
    font-size: 28px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .secondary-btn,
  .primary-btn {
    flex: none;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .login-container {
    background: linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%);
  }
  
  .login-card {
    background: rgba(28, 28, 30, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .login-header h1 {
    color: #f2f2f7;
  }
  
  .input {
    background: rgba(44, 44, 46, 0.8);
    border-color: #38383a;
    color: #f2f2f7;
  }
  
  .input:focus {
    background: #44444a;
  }
  
  .secondary-btn {
    border-color: #38383a;
    color: #007aff;
  }
  
  .secondary-btn:hover {
    background: #2c2c2e;
  }
  
  .modal {
    background: #1c1c1e;
  }
  
  .modal-header h2 {
    color: #f2f2f7;
  }
}</style>