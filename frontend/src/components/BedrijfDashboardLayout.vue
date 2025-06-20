<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <aside class="sidebar-nav">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <img src="/Images/ehb-logo.png" alt="EHB logo" class="ehb-logo-img" />
        </div>
        <div>
          <h1 class="sidebar-title">StudentMatch</h1>
          <p class="sidebar-subtitle">Bedrijfsdashboard</p>
        </div>
      </div>
      <nav class="sidebar-menu">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          class="sidebar-link"
          :class="{ active: $route.path === item.href }"
        >
          <i :class="item.icon"></i>
          {{ item.name }}
        </router-link>
      </nav>
    </aside>
    <main class="dashboard-main">
      <header class="dashboard-header">
        <div>
          <h1>Welkom terug, {{ userData.companyName }}!</h1>
          <p>Hier is je bedrijfsdashboard overzicht</p>
        </div>
        <div class="dashboard-header-actions">
          <NotificationCenter 
            v-if="currentUser?.uid" 
            :companyId="currentUser.uid" 
            :key="currentUser.uid"
          />
          <div class="dashboard-profile-avatar" id="bedrijf-profile-avatar" @click="handleAvatarClick">
            <img v-if="userFoto" :src="userFoto" alt="Bedrijfslogo" class="avatar-img" />
            <span v-else>{{ userData.companyName ? userData.companyName[0] : 'B' }}</span>
          </div>
          <div v-if="showDropdown" id="bedrijf-profile-dropdown" class="profile-dropdown">
            <button class="dropdown-item" @click="goToProfile">Profiel</button>
            <button class="dropdown-item" @click="handleLogout">Uitloggen</button>
          </div>
        </div>
      </header>
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import NotificationCenter from './NotificationCenter.vue'
import profielfoto from '/Images/profielfoto.jpg'

const $route = useRoute()
const router = useRouter()
const userFoto = ref(null)
const userData = ref({ companyName: '' })
const currentUser = ref(null)
const navigation = [
  { name: 'Dashboard', href: '/BedrijfDashboard', icon: 'fas fa-chart-pie' },
  { name: 'Afspraken', href: '/GesprekkenBd', icon: 'fas fa-calendar' },
  { name: 'Matches', href: '/bedrijfmatch', icon: 'fas fa-users' },
  { name: 'Profiel', href: '/WeergaveBd', icon: 'fas fa-user' },
  { name: 'Instellingen', href: '/SettingsBe', icon: 'fas fa-cog' }
]

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
function goToProfile() {
  showDropdown.value = false;
  window.location.href = '/WeergaveBd';
}
onMounted(() => {
  setTimeout(() => {
    document.addEventListener('mousedown', handleClickOutside)
  }, 100)
  
  const auth = getAuth();
  const db = getFirestore();

  onAuthStateChanged(auth, async (user) => {
    currentUser.value = user
    if (user) {
      const docRef = doc(db, 'bedrijf', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        userData.value.companyName = data.bedrijfsnaam || 'Bedrijf';
        userFoto.value = data.foto || null;
      }
    }
  });
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
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
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  overflow: hidden;
}
.ehb-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
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
  position: relative;
}
.dashboard-profile-avatar {
  width: 2rem;
  height: 2rem;
  background: rgba(255,255,255,0.6);
  color: #c20000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
  transition: transform 0.18s cubic-bezier(0.4,0,0.2,1), box-shadow 0.18s cubic-bezier(0.4,0,0.2,1);
  cursor: pointer;
  overflow: hidden;
  border: 1.5px solid #222;
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
.avatar-img {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}
</style> 