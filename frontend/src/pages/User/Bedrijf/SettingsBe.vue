<template>
  <BedrijfDashboardLayout>
    <main class="dashboard-main">
      <section class="dashboard-2col">
        <!-- Kaart: Wachtwoord wijzigen -->
        <div class="dashboard-card">
          <div class="dashboard-card-header">
            <h3>Wachtwoord wijzigen</h3>
            <i class="fas fa-key"></i>
          </div>
          <input
            type="password"
            v-model="currentPassword"
            placeholder="Huidig wachtwoord"
            class="setting-input"
          />
          <input
            type="password"
            v-model="newPassword"
            placeholder="Nieuw wachtwoord"
            class="setting-input"
          />
          <p v-if="passwordError" class="text-error">{{ passwordError }}</p>
          <button class="dashboard-action-btn bg-primary text-white" @click="changePassword">
            <i class="fas fa-save"></i> Wijzig wachtwoord
          </button>
        </div>
        <!-- Kaart: Account verwijderen -->
        <div class="dashboard-card">
          <div class="dashboard-card-header">
            <h3>Account</h3>
            <i class="fas fa-user-slash"></i>
          </div>
          <button class="dashboard-action-btn bg-accent" @click="deleteAccount">
            <i class="fas fa-trash-alt"></i> Verwijder account
          </button>
        </div>
        <!-- Kaart: Uitloggen -->
        <div class="dashboard-card">
          <div class="dashboard-card-header">
            <h3>Uitloggen</h3>
            <i class="fas fa-sign-out-alt"></i>
          </div>
          <button class="dashboard-action-btn bg-accent" @click="logout">
            <i class="fas fa-door-open"></i> Log uit
          </button>
        </div>
        <div v-if="message" class="dashboard-message">{{ message }}</div>
      </section>
    </main>
  </BedrijfDashboardLayout>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import {
  getAuth,
  updatePassword,
  signOut,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { useToast } from 'vue-toastification'
import BedrijfDashboardLayout from '../../../components/BedrijfDashboardLayout.vue'

const toast = useToast()
const router = useRouter()
const currentPassword = ref('')
const newPassword = ref('')
const message = ref('')
const passwordError = ref('')
const showDropdown = ref(false)

function handleAvatarClick() {
  showDropdown.value = !showDropdown.value
}
function handleLogout() {
  router.push('/')
}
function handleClickOutside(event) {
  const dropdown = document.getElementById('bedrijf-profile-dropdown')
  const avatar = document.getElementById('bedrijf-profile-avatar')
  if (dropdown && !dropdown.contains(event.target) && avatar && !avatar.contains(event.target)) {
    showDropdown.value = false
  }
}
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

async function changePassword() {
  passwordError.value = ''
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user || !user.email) {
      passwordError.value = 'Er is iets misgegaan met je account. Probeer opnieuw in te loggen.';
      toast.error(passwordError.value)
      return;
    }
    if (user.providerData[0]?.providerId === 'google.com') {
      passwordError.value = 'Je kan je wachtwoord niet wijzigen als je met Google bent ingelogd.';
      toast.error(passwordError.value)
      return;
    }
    if (!currentPassword.value || !newPassword.value) {
      passwordError.value = 'Vul zowel je huidige als nieuwe wachtwoord in.';
      toast.error(passwordError.value)
      return;
    }
    const credential = EmailAuthProvider.credential(user.email, currentPassword.value);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword.value);
    currentPassword.value = '';
    newPassword.value = '';
    toast.success('Je wachtwoord is succesvol gewijzigd.')
  } catch (error) {
    if (error.code === 'auth/invalid-credential') {
      passwordError.value = 'Het huidige wachtwoord klopt niet.';
    } else if (error.code === 'auth/too-many-requests') {
      passwordError.value = 'Te veel pogingen. Wacht even en probeer opnieuw.';
    } else if (error.code === 'auth/weak-password') {
      passwordError.value = 'Je nieuwe wachtwoord is te zwak.';
    } else {
      passwordError.value = 'Er is een fout opgetreden. Probeer het opnieuw.';
    }
    toast.error(passwordError.value)
  }
}

async function deleteAccount() {
  if (!confirm('Weet je zeker dat je je account wilt verwijderen?')) return;
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    message.value = 'Je bent niet ingelogd. Log opnieuw in en probeer het opnieuw.';
    toast.error(message.value)
    return;
  }
  if (user.providerData[0]?.providerId === 'google.com') {
    message.value = 'Je kan je account niet verwijderen als je bent ingelogd via Google.';
    toast.error(message.value)
    return;
  }
  try {
    await deleteUser(user);
    await auth.signOut();
    toast.success('Je account is succesvol verwijderd.')
    router.push('/login');
  } catch (error) {
    console.error('Fout bij verwijderen account:', error);
    if (error.code === 'auth/requires-recent-login') {
      message.value = 'Log opnieuw in om je account te kunnen verwijderen.';
    } else {
      message.value = 'Fout bij verwijderen account. Probeer opnieuw.';
    }
    toast.error(message.value)
  }
}

async function logout() {
  const auth = getAuth();
  await signOut(auth);
  toast.info('Je bent uitgelogd.')
  router.push('/login');
}
</script>


<style scoped>
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
}
.sidebar-nav {
  width: 16rem;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 1rem 1rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}
.sidebar-logo {
  width: 2rem;
  height: 2rem;
  background: #c20000;
  color: #fff;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}
.sidebar-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
}
.sidebar-subtitle {
  font-size: 0.8rem;
  color: #6b7280;
}
.sidebar-menu {
  flex: 1;
  padding: 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  color: #6b7280;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
}
.sidebar-link.active, .sidebar-link:hover {
  background: #f3f4f6;
  color: #c20000;
}
.sidebar-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}
.sidebar-user-avatar {
  width: 2rem;
  height: 2rem;
  background: #c20000;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}
.sidebar-user-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
}
.sidebar-user-role {
  font-size: 0.8rem;
  color: #6b7280;
}
.dashboard-main {
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
}
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem 2rem 1.5rem 2rem;
}
.dashboard-header h1 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #c20000;
}
.dashboard-header p {
  color: #6b7280;
  font-size: 0.95rem;
}
.dashboard-header-actions {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}
.dashboard-search {
  position: relative;
  display: flex;
  align-items: center;
  background: #f3f4f6;
  border-radius: 0.5rem;
  padding: 0.2rem 0.7rem;
}
.dashboard-search i {
  color: #6b7280;
  margin-right: 0.5rem;
}
.dashboard-search input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.95rem;
  color: #111827;
  width: 8rem;
}
.dashboard-bell {
  background: #f3f4f6;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem;
  position: relative;
  cursor: pointer;
}
.dashboard-bell-dot {
  position: absolute;
  top: 0.3rem;
  right: 0.3rem;
  width: 0.6rem;
  height: 0.6rem;
  background: #ef4444;
  border-radius: 50%;
}
.dashboard-profile-avatar {
  width: 2rem;
  height: 2rem;
  background: #c20000;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
  transition: transform 0.18s cubic-bezier(0.4,0,0.2,1), box-shadow 0.18s cubic-bezier(0.4,0,0.2,1);
  cursor: pointer;
}
.dashboard-profile-avatar:hover {
  transform: scale(1.12);
  box-shadow: 0 4px 16px rgba(194,0,0,0.18);
}
.profile-dropdown {
  position: absolute;
  top: 3.5rem;
  right: 0.5rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  z-index: 10;
  min-width: 120px;
  padding: 0.5rem 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.dropdown-item {
  background: none;
  border: none;
  color: #c20000;
  font-weight: 500;
  text-align: left;
  padding: 0.7rem 1.2rem;
  cursor: pointer;
  transition: background 0.2s;
}
.dropdown-item:hover {
  background: #f3f4f6;
}
.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
  margin: 2rem 2rem 0 2rem;
}
@media (min-width: 768px) {
  .dashboard-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .dashboard-stats {
    grid-template-columns: repeat(4, 1fr);
  }
}
.stat-card {
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.stat-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.stat-label {
  color: #6b7280;
  font-size: 0.9rem;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}
.stat-icon {
  background: #f3f4f6;
  border-radius: 0.5rem;
  padding: 0.7rem;
  font-size: 1.2rem;
}
.text-blue-600 { color: #2563eb; }
.text-green-600 { color: #16a34a; }
.text-purple-600 { color: #7c3aed; }
.text-orange-600 { color: #ea580c; }
.stat-card-bottom {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.95rem;
}
.text-muted { color: #9ca3af; }
.dashboard-2col {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin: 2rem 2rem 0 2rem;
}
@media (min-width: 1024px) {
  .dashboard-2col {
    grid-template-columns: 1fr 1fr;
  }
}
.dashboard-card {
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
  padding: 1.5rem;
}
.dashboard-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.dashboard-activity .activity-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.7rem;
}
.activity-dot {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
}
.activity-dot.match { background: #16a34a; }
.activity-dot.view { background: #2563eb; }
.activity-dot.appointment { background: #7c3aed; }
.activity-dot.like { background: #ea580c; }
.activity-action {
  font-size: 0.95rem;
  font-weight: 500;
  color: #111827;
}
.activity-time {
  font-size: 0.8rem;
  color: #6b7280;
}
.dashboard-actions {
  margin: 2rem 2rem 0 2rem;
}
.dashboard-actions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
@media (min-width: 768px) {
  .dashboard-actions-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
.dashboard-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  height: 3rem;
  width: 100%;
  text-align: center;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  background: #f3f4f6;
  color: #374151;
  transition: background 0.2s, color 0.2s;
}

.dashboard-action-btn i {
  display: flex;
  align-items: center;
  justify-content: center;
}


.dashboard-action-btn.bg-primary {
  background: #c20000;
  color: #fff;
  margin-top: 1.5rem;;
}
.dashboard-action-btn.bg-accent {
  background: #f3f4f6;
  color: #374151;
}
.dashboard-action-btn:hover {
  background: #e5e7eb;
}
.dashboard-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}
.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #c20000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.dashboard-error {
  color: #ef4444;
  font-size: 0.85rem;
  text-align: center;
  padding: 1rem;
}
.no-data {
  text-align: center;
  color: #6b7280;
  font-size: 0.85rem;
  padding: 1rem;
}

.popup-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.popup-content {
  background: #fff;
  padding: 2rem;
  border-radius: 1rem;
  max-width: 90%;
  width: 320px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  text-align: center;
}
.popup-button {
  margin-top: 1rem;
  background: #c20000; 
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}
.popup-button:hover {
  background: #a80000; 
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.popup-box {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  text-align: center;
  max-width: 300px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}
.popup-box p {
  margin-bottom: 1rem;
  font-size: 1rem;
  font-weight: 500;
}
.popup-ok-button {
  background-color: #c20000;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 0.4rem;
  cursor: pointer;
  font-size: 0.95rem;
}
.popup-ok-button:hover {
  background-color: #a40000;
}

.text-error {
  color: #dc2626; 
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.setting-input {
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  color: #111827;
  background-color: #f9fafb;
  transition: border-color 0.2s;
}

.setting-input:focus {
  outline: none;
  border-color: #c20000;
  background-color: #fff;
}

/* Enhanced Mobile Responsive Styles */
@media (max-width: 768px) {
  .dashboard-main {
    padding: 0;
  }

  .dashboard-2col {
    margin: 1rem 1rem 0 1rem;
    gap: 1rem;
  }

  .dashboard-card {
    padding: 1.2rem;
  }

  .dashboard-card-header {
    margin-bottom: 0.8rem;
  }

  .dashboard-card-header h3 {
    font-size: 1.1rem;
  }

  .setting-input {
    padding: 0.8rem 0.9rem;
    margin-bottom: 0.8rem;
    font-size: 0.95rem;
  }

  .dashboard-action-btn {
    padding: 0.8rem 1rem;
    height: auto;
    min-height: 2.8rem;
    font-size: 0.95rem;
  }

  .dashboard-action-btn.bg-primary {
    margin-top: 1rem;
  }

  .dashboard-message {
    margin: 1rem;
    padding: 1rem;
    border-radius: 0.5rem;
    background: #f3f4f6;
    color: #374151;
    text-align: center;
  }

  .text-error {
    font-size: 0.8rem;
    margin-top: 0.4rem;
  }
}
</style> 