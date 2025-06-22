<template>
  <div class="dashboard-container">
    <!-- Mobile Header -->
    <header class="mobile-header">
      <div class="logo-container">
        <img src="/Images/ehb-logo.png" alt="EHB logo" class="mobile-logo-img" />
      </div>
      <button class="hamburger-btn" @click="toggleSidebar">
        <div class="hamburger-box">
          <div class="hamburger-inner"></div>
        </div>
      </button>
    </header>

    <!-- Sidebar -->
    <aside class="sidebar-nav" :class="{ 'is-open': isSidebarOpen }">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <img src="/Images/ehb-logo.png" alt="EHB logo" class="ehb-logo-img" />
        </div>
        <div>
          <h1 class="sidebar-title">Bedrijfsdashboard</h1>
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
      <!-- Desktop Header -->
      <header class="dashboard-header desktop-only">
        <div>
          <h1>Welkom {{ userData.companyName }}</h1>
          <p>{{ pageSubtitle }}</p>
        </div>
        <div class="dashboard-header-actions">
          <NotificationCenter 
            v-if="currentUser?.uid" 
            :companyId="currentUser.uid" 
            :key="currentUser.uid"
          />
          <div
            class="dashboard-profile-avatar"
            id="bedrijf-profile-avatar"
            @click="handleAvatarClick"
          >
            <img
              v-if="userFoto"
              :src="userFoto"
              alt="Bedrijfslogo"
              class="avatar-img"
            />
            <span v-else>
              {{ userData.companyName ? userData.companyName[0] : 'B' }}
            </span>
          </div>
          <div
            v-if="showDropdown"
            id="bedrijf-profile-dropdown"
            class="profile-dropdown"
          >
            <button class="dropdown-item" @click="goToProfile">Profiel</button>
            <button class="dropdown-item" @click="handleLogout">Uitloggen</button>
          </div>
        </div>
      </header>

      <!-- Mobile Welcome Card -->
      <div class="mobile-welcome-card mobile-only">
        <div class="welcome-text">
          <h1>Welkom {{ userData.companyName }}</h1>
          <p>{{ pageSubtitle }}</p>
        </div>
        <div class="mobile-actions">
          <NotificationCenter 
            v-if="currentUser?.uid" 
            :companyId="currentUser.uid" 
            :key="currentUser.uid"
          />
          <div
            class="dashboard-profile-avatar"
            id="bedrijf-profile-avatar-mobile"
            @click="handleAvatarClick"
          >
            <img
              v-if="userFoto"
              :src="userFoto"
              alt="Bedrijfslogo"
              class="avatar-img"
            />
            <span v-else>
              {{ userData.companyName ? userData.companyName[0] : 'B' }}
            </span>
          </div>
           <div
            v-if="showDropdown"
            id="bedrijf-profile-dropdown-mobile"
            class="profile-dropdown mobile"
          >
            <button class="dropdown-item" @click="goToProfile">Profiel</button>
            <button class="dropdown-item" @click="handleLogout">Uitloggen</button>
          </div>
        </div>
      </div>

      <slot />
    </main>

    <!-- Overlay for mobile sidebar -->
    <div v-if="isSidebarOpen" class="sidebar-overlay" @click="toggleSidebar"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'
import NotificationCenter from './NotificationCenter.vue'

const $route = useRoute()
const router = useRouter()

const userFoto = ref(null)
const userData = ref({ companyName: '' })
const currentUser = ref(null)
const showDropdown = ref(false)
const isSidebarOpen = ref(false)

const navigation = [
  { name: 'Dashboard', href: '/BedrijfDashboard', icon: 'fas fa-chart-pie' },
  { name: 'Afspraken', href: '/GesprekkenBd', icon: 'fas fa-calendar' },
  { name: 'Matches', href: '/bedrijfmatch', icon: 'fas fa-users' },
  { name: 'Profiel', href: '/WeergaveBd', icon: 'fas fa-user' },
  { name: 'Instellingen', href: '/SettingsBe', icon: 'fas fa-cog' }
]

const pageSubtitle = computed(() => {
  switch ($route.path) {
    case '/BedrijfDashboard':
      return 'Hier is je dashboard overzicht'
    case '/GesprekkenBd':
      return 'Hier is een overzicht van uw gesprekken'
    case '/bedrijfmatch':
      return 'Hier is een overzicht van uw matchs'
    case '/WeergaveBd':
    case '/WijzigBd':
      return 'Profieloverzicht'
    case '/SettingsBe':
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
  const desktopDropdown = document.getElementById('bedrijf-profile-dropdown')
  const desktopAvatar = document.getElementById('bedrijf-profile-avatar')
  const mobileDropdown = document.getElementById('bedrijf-profile-dropdown-mobile')
  const mobileAvatar = document.getElementById('bedrijf-profile-avatar-mobile')

  const isDesktopClick = (desktopDropdown && desktopDropdown.contains(event.target)) || (desktopAvatar && desktopAvatar.contains(event.target))
  const isMobileClick = (mobileDropdown && mobileDropdown.contains(event.target)) || (mobileAvatar && mobileAvatar.contains(event.target))

  if (!isDesktopClick && !isMobileClick) {
    showDropdown.value = false
  }
}

function goToProfile() {
  showDropdown.value = false
  router.push('/WeergaveBd')
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
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
      const q = query(collection(db, 'bedrijf'), where('authUid', '==', user.uid))
      const snapshot = await getDocs(q)

      if (!snapshot.empty) {
        const data = snapshot.docs[0].data()
        userData.value.companyName = data.bedrijfsnaam || 'Bedrijf'
        userFoto.value = data.foto || null
      }
    }
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

// Watch for route changes to close the sidebar on navigation
watch(
  () => $route.path,
  () => {
    isSidebarOpen.value = false
  }
)
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
.sidebar-link.active,
.sidebar-link:hover {
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
  padding: 1.5rem 2rem;
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
  background: rgba(255, 255, 255, 0.6);
  color: #c20000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
  transition: transform 0.18s, box-shadow 0.18s;
  cursor: pointer;
  overflow: hidden;
  border: 1.5px solid #222;
}
.dashboard-profile-avatar:hover {
  transform: scale(1.12);
  box-shadow: 0 4px 16px rgba(194, 0, 0, 0.18);
}
.profile-dropdown {
  position: absolute;
  top: 3.5rem;
  right: 0.5rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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

/* START: MOBILE-SPECIFIC STYLES */
.mobile-header {
  display: none; /* This will be overridden by the media query */
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  padding: 0.75rem 1.25rem;
  margin: 1rem 1rem 0 1rem;
}

.mobile-welcome-card {
  display: none; /* Hidden by default */
}

.mobile-only {
  display: none;
}

.desktop-only {
  display: flex;
}

.sidebar-overlay {
  display: none; /* Hidden by default */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040; /* Below sidebar, above content */
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: flex;
  }
  
  .mobile-header {
    display: flex;
  }

  .logo-container {
    height: 40px;
  }

  .mobile-logo-img {
    height: 100%;
    width: auto;
    object-fit: contain;
  }

  .hamburger-btn {
    background: none;
    border: none;
    color: #c20000;
    cursor: pointer;
    padding: 10px;
    display: inline-block;
  }

  .hamburger-box {
    width: 30px;
    height: 24px;
    position: relative;
  }

  .hamburger-inner,
  .hamburger-inner::before,
  .hamburger-inner::after {
    width: 30px;
    height: 3px;
    background-color: #c20000;
    border-radius: 4px;
    position: absolute;
    transition: transform 0.2s ease-in-out;
  }

  .hamburger-inner {
    top: 50%;
    transform: translateY(-50%);
  }

  .hamburger-inner::before,
  .hamburger-inner::after {
    content: '';
    display: block;
  }

  .hamburger-inner::before {
    top: -10px;
  }

  .hamburger-inner::after {
    bottom: -10px;
  }

  .dashboard-container {
    flex-direction: column;
  }
  
  .dashboard-main {
    padding-top: 0; /* Remove padding since header is no longer fixed */
  }

  .sidebar-nav {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
    z-index: 1050;
    width: 260px;
  }

  .sidebar-nav.is-open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block; /* Show overlay when sidebar is open */
  }

  .mobile-welcome-card {
    align-items: center;
    justify-content: space-between;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    padding: 1rem 1.25rem;
    margin: 1rem;
  }
  
  .welcome-text h1 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #c20000;
    margin: 0 0 0.25rem 0;
  }

  .welcome-text p {
    font-size: 0.9rem;
    color: #6b7280;
    margin: 0;
  }
  
  .mobile-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
    position: relative;
  }
  
  .profile-dropdown.mobile {
    top: 45px;
    right: 0;
  }
}
/* END: MOBILE-SPECIFIC STYLES */
</style>
