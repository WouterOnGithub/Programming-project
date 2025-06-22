<template>
  <div class="dashboard-container">
    <header class="mobile-header">
      <router-link to="/dashboard" class="mobile-logo">
        <img src="/Images/ehb-logo.png" alt="EHB logo" class="ehb-logo-img" />
      </router-link>
      <button class="hamburger-menu" @click="isSidebarOpen = !isSidebarOpen">
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
      </button>
    </header>

    <div class="sidebar-overlay" v-if="isSidebarOpen" @click="isSidebarOpen = false"></div>

    <!-- Sidebar -->
    <aside class="sidebar-nav" :class="{ open: isSidebarOpen }">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <img src="/Images/ehb-logo.png" alt="EHB logo" class="ehb-logo-img" />
        </div>
        <div>
          <h1 class="sidebar-title">Studentdashboard</h1>
        </div>
      </div>
      <nav class="sidebar-menu">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          :class="['sidebar-link', $route.path === item.href ? 'active' : '']"
          @click="isSidebarOpen = false"
        >
          <i :class="item.icon"></i>
          {{ item.name }}
        </router-link>
      </nav>
    </aside>
    <!-- Main Content -->
    <main class="dashboard-main">
      <header class="dashboard-header">
        <div class="header-content">
          <img src="/Images/ehb-logo.png" alt="EHB logo" class="ehb-logo-img-header" />
          <div>
            <h1>Welkom {{ userData.name }}</h1>
            <p>{{ pageSubtitle }}</p>
          </div>
        </div>
        <div class="dashboard-header-actions">
          <NotificationCenter 
            v-if="currentUser?.uid" 
            :userId="currentUser.uid" 
            userType="student"
            :key="currentUser.uid"
          />
          <div class="dashboard-profile-avatar" id="student-profile-avatar" @click="handleAvatarClick">
            <img v-if="userFoto" :src="userFoto" alt="studenten foto" class="avatar-img" />
            <span v-else>{{ userData.companyName ? userData.companyName[0] : 'B' }}</span>
          </div>
          <div v-if="showDropdown" id="student-profile-dropdown" class="profile-dropdown">
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'

import NotificationCenter from './NotificationCenter.vue'

const isSidebarOpen = ref(false);

const $route = useRoute()
const router = useRouter()

const userFoto = ref(null)
const userData = ref({ name: '' })
const currentUser = ref(null)
const showDropdown = ref(false)

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: 'fas fa-chart-pie' },
  { name: 'Job Swiping', href: '/swipe', icon: 'fas fa-heart' },
  { name: 'Afspraken', href: '/appointments', icon: 'fas fa-calendar' },
  { name: 'Favorieten', href: '/Favorietenst', icon: 'fas fa-star' },
  { name: 'Matches', href: '/stmatch', icon: 'fas fa-users' },
  { name: 'Profiel', href: '/WeergaveSt', icon: 'fas fa-user' },
  { name: 'Instellingen', href: '/SettingsStu', icon: 'fas fa-cog' },
]

const pageSubtitle = computed(() => {
  switch ($route.path) {
    case '/dashboard':
      return 'Hier is je dashboard overzicht'
    case '/swipe':
      return 'Hier is je job swiping overzicht'
    case '/appointments':
      return 'Hier is je afspraken overzicht'
    case '/Favorietenst':
      return 'Overzicht van favoriete bedrijven'
    case '/stmatch':
      return 'Hier is een overzicht van uw matchs'
    case '/WeergaveSt':
      return 'Profieloverzicht'
    case '/SettingsStu':
      return 'Instellingen'
    default:
      return ''
  }
})

function handleAvatarClick() {
  showDropdown.value = !showDropdown.value
}

function handleLogout() {
  router.push('/')
}

function handleClickOutside(event) {
  const dropdown = document.getElementById('student-profile-dropdown')
  const avatar = document.getElementById('student-profile-avatar')

  if (
    dropdown && !dropdown.contains(event.target) &&
    avatar && !avatar.contains(event.target)
  ) {
    showDropdown.value = false
  }
}

function goToProfile() {
  showDropdown.value = false
  router.push('/WeergaveSt')
}

onMounted(() => {
  setTimeout(() => {
    document.addEventListener('mousedown', handleClickOutside)
  }, 100)

  const auth = getAuth()
  const db = getFirestore()

  onAuthStateChanged(auth, async (user) => {
    currentUser.value = user

    if (user) {
      try {
        const q = query(collection(db, 'student'), where('authUid', '==', user.uid))
        const snapshot = await getDocs(q)

        if (!snapshot.empty) {
          const data = snapshot.docs[0].data()
          userData.value.name = data.voornaam || 'Student'
          
          // Verbeterde foto logica - probeer verschillende velden
          if (data.foto) {
            userFoto.value = data.foto
          } else if (data.fotoUrl) {
            userFoto.value = data.fotoUrl
          } else if (data.photoUrl) {
            userFoto.value = data.photoUrl
          } else {
            userFoto.value = null
          }
          
          console.log('Student foto geladen:', userFoto.value)
        }
      } catch (error) {
        console.error('Fout bij ophalen student data:', error)
      }
    }
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style scoped>
.ehb-logo-img-header {
  height: 40px;
  margin-right: 20px;
}

.mobile-header {
  display: none;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 199;
}

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
}
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 1rem 1rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}
.sidebar-logo {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.2rem;
  background: none;
}
.ehb-logo-img {
  width: 2.2rem;
  height: 2.2rem;
  object-fit: contain;
  display: block;
}
.sidebar-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
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
  color: #222;
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
  display: flex;
  flex-direction: column;
}
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background-color: #fff;
  border-bottom: 1px solid #e5e7eb;
}
.header-content {
  display: flex;
  align-items: center;
}
.header-content h1 {
  font-size: 1.5rem;
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
  width: 2.5rem;
  height: 2.5rem;
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
  position: relative;
}
.dashboard-profile-avatar:hover {
  transform: scale(1.12);
  box-shadow: 0 4px 16px rgba(194,0,0,0.18);
}
.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
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

@media screen and (max-width: 1024px) {
  .dashboard-container {
    flex-direction: column;
  }

  .mobile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    padding: 1.2rem 1.5rem;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07);
    margin: 1rem 1rem 0 1rem;
  }

  .mobile-logo .ehb-logo-img {
    height: 2.2rem;
  }

  .hamburger-menu {
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    width: 2rem;
    height: 2rem;
    padding: 0.25rem;
  }
  
  .hamburger-menu .bar {
      height: 3px;
      width: 100%;
      background: #c20000;
      border-radius: 10px;
  }

  .sidebar-nav {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    z-index: 200;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    will-change: transform;
  }

  .sidebar-nav.open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block;
  }

  .dashboard-main {
    padding-top: 0;
  }

  .dashboard-header {
    margin: 1rem;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07);
    padding: 1.5rem 1rem;
  }
}
</style> 