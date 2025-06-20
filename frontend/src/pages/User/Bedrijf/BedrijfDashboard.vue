<template>
  <BedrijfDashboardLayout>
    <main class="dashboard-main">
      <!-- Mobile-only header -->
      <header class="mobile-header">
        <img src="/Images/ehb-logo.png" alt="EhB Logo" class="mobile-logo" />
        <button @click="toggleMobileSidebar" class="hamburger-menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      <!-- Mobile-only welcome banner -->
      <section class="welcome-banner-mobile">
        <div class="welcome-text">
          <h1 class="welcome-title">Welkom terug, {{ userData.companyName }}!</h1>
          <p class="welcome-subtitle">Hier is je bedrijfsdashboard overzicht</p>
        </div>
        <div class="welcome-avatar" @click="handleAvatarClick">{{ userData.companyName.charAt(0) }}</div>
        <div v-if="showDropdown" id="mobile-profile-dropdown" class="profile-dropdown-mobile">
            <button class="dropdown-item" @click="goToProfile">Profiel</button>
            <button class="dropdown-item" @click="handleLogout">Uitloggen</button>
        </div>
      </section>

      <!-- Main content -->
      <!-- Statistieken -->
      <section class="dashboard-stats">
        <div v-for="(stat, index) in statsData" :key="index" class="stat-card">
          <div class="stat-card-top">
            <div>
              <p class="stat-label">{{ stat.title }}</p>
              <p class="stat-value">{{ stat.value }}</p>
            </div>
            <div :class="['stat-icon', stat.color]">
              <i :class="stat.icon"></i>
            </div>
          </div>
          <div class="stat-card-bottom">
            <i v-if="stat.trend === 'up'" class="fas fa-arrow-up text-green-600"></i>
            <i v-else-if="stat.trend === 'down'" class="fas fa-arrow-down text-red-600"></i>
            <span :class="{
              'text-green-600': stat.trend === 'up',
              'text-red-600': stat.trend === 'down',
              'text-muted': stat.trend === 'neutral'
            }">{{ stat.change }}</span>
            <span class="text-muted">vs vorige week</span>
          </div>
        </div>
      </section>
      <!-- 2 kolommen: studenten + activiteit -->
      <section class="dashboard-2col">
        <div class="dashboard-card">
          <div class="dashboard-card-header">
            <h3>Geïnteresseerde Studenten</h3>
            <i class="fas fa-user-graduate"></i>
          </div>
          <ul class="dashboard-todos">
            <li v-for="student in interestedStudents" :key="student.id" class="todo-item">
              {{ student.name }} – {{ student.study }} – {{ student.campus }}
            </li>
          </ul>
        </div>
        <div class="dashboard-card">
          <div class="dashboard-card-header">
            <h3>Recente Activiteit</h3>
            <i class="fas fa-chart-line"></i>
          </div>

          <ul class="dashboard-activity">
            <li v-for="activity in recentActivity" :key="activity.id" class="activity-row">
              <span class="activity-dot" :class="activity.type"></span>
              <span>{{ activity.text }}</span>
            </li>
          </ul>

          <div class="dashboard-activity">
            <div v-if="recentActivity.length === 0" class="no-data">
              Geen recente activiteit
            </div>
            <div
              v-else
              v-for="(activity, index) in recentActivity"
              :key="index"
              class="activity-row"
            >
              <div :class="['activity-dot', activity.type]"></div>
              <div>
                <p class="activity-action">{{ activity.action }}</p>
                <p class="activity-time">{{ activity.time }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Snelle acties -->
      <section class="dashboard-card dashboard-actions">
        <h3>Snelle Acties</h3>
        <div class="dashboard-actions-grid">
          <button class="dashboard-action-btn bg-primary text-white" @click="toast.info('Open de planner om een gesprek in te plannen')">
            <i class="fas fa-calendar-plus"></i> Plan Gesprek
          </button>
          <button class="dashboard-action-btn bg-accent" @click="toast.success('Je standlocatie wordt geladen...')">
            <i class="fas fa-map-marker-alt"></i> Bekijk Standlocatie
          </button>

        </div>
      </section>
    </main>
  </BedrijfDashboardLayout>

  <!-- Mobile-only sidebar -->
  <aside class="mobile-sidebar" :class="{ 'is-open': isMobileSidebarOpen }">
    <div class="mobile-sidebar-header">
      <button @click="toggleMobileSidebar" class="close-sidebar-btn">
        <span></span>
        <span></span>
      </button>
      <div class="sidebar-header-content">
        <img src="/Images/ehb-logo.png" alt="EhB Logo" class="sidebar-header-logo" />
        <div class="sidebar-header-text">
          <h3>StudentMatch</h3>
          <p>Bedrijfsdashboard</p>
        </div>
      </div>
    </div>
    <nav class="mobile-nav">
      <a v-for="item in navigation" :key="item.name" :href="item.href" class="mobile-nav-link" :class="{ 'active-link': route.path === item.href }">
        <span>{{ item.name }}</span>
      </a>
    </nav>
  </aside>
  <div v-if="isMobileSidebarOpen" @click="toggleMobileSidebar" class="sidebar-overlay"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BedrijfDashboardLayout from '../../../components/BedrijfDashboardLayout.vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

const toast = useToast()
const route = useRoute()
const isMobileSidebarOpen = ref(false)

const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value
}

const interestedStudents = ref([
  { id: 1, name: 'Lina V.', study: 'Toegepaste Informatica', campus: 'Campus Kaai' },
  { id: 2, name: 'Joris D.', study: 'Multimedia & Creatieve Technologie', campus: 'Campus Kanal' },
  { id: 3, name: 'Anas K.', study: 'Netwerkbeheer', campus: 'Campus Bloemenhof' },
])

onMounted(() => {
  toast.success('Welkom terug op je bedrijfsdashboard!')
})

const navigation = [
  { name: 'Dashboard', href: '/BedrijfDashboard' },
  { name: 'Afspraken', href: '/GesprekkenBd' },
  { name: 'Matches', href: '/bedrijfmatch'},
  { name: 'Profiel', href: '/bedrijf/profiel' },
  { name: 'Instellingen', href: '/SettingsBe' },
]



const userData = ref({ companyName: 'Bedrijf' })

const statsData = ref([
  {
    title: 'Eventdatum',
    value: '24 oktober 2025',
    change: '',
    trend: 'neutral',
    icon: 'fas fa-calendar-day',
    color: 'text-red-600',
  },
  {
    title: 'Geplande Afspraken',
    value: '5',
    change: '+1',
    trend: 'up',
    icon: 'fas fa-calendar-check',
    color: 'text-orange-600',
  },
  {
    title: 'Bezoekers Vandaag',
    value: '24',
    change: '+3',
    trend: 'up',
    icon: 'fas fa-user-friends',
    color: 'text-green-600',
  },
  {
    title: 'Locatie (Aula)',
    value: 'Aula B – Stand 14',
    change: '',
    trend: 'neutral',
    icon: 'fas fa-map-marker-alt',
    color: 'text-purple-600',
  },
])

const recentActivity = ref([
  { type: 'interview', action: 'Gesprek gepland met L. Vanhoutte', time: '1 dag geleden' },
  { type: 'match', action: 'Nieuwe match met R. De Wilde', time: '2 dagen geleden' },
])


const showDropdown = ref(false)
const router = useRouter()
function handleAvatarClick() {
  showDropdown.value = !showDropdown.value
}
function handleLogout() {
  router.push('/')
}
function goToProfile() {
    router.push('/bedrijf/profiel');
}
function handleClickOutside(event) {
  const dropdown = document.getElementById('mobile-profile-dropdown')
  const avatar = document.querySelector('.welcome-avatar')
  if (dropdown && !dropdown.contains(event.target) && avatar && !avatar.contains(event.target)) {
    showDropdown.value = false
  }
}
if (typeof window !== 'undefined') {
  window.addEventListener('mousedown', handleClickOutside)
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
.dashboard-appointments .appointment-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 0.7rem;
}
.appointment-icon {
  width: 3rem;
  height: 3rem;
  background: #c20000;
  color: #fff;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}
.appointment-info h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.2rem;
}
.appointment-info p {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 0.2rem;
}
.appointment-meta {
  display: flex;
  gap: 1.2rem;
  font-size: 0.85rem;
  color: #6b7280;
}
.appointment-status {
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
}
.appointment-status.confirmed {
  background: #dcfce7;
  color: #166534;
}
.appointment-status.pending {
  background: #fef9c3;
  color: #854d0e;
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
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  background: #f3f4f6;
  color: #374151;
  transition: background 0.2s, color 0.2s;
}
.dashboard-action-btn.bg-primary {
  background: #c20000;
  color: #fff;
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

/* =================================== */
/* === MOBILE RESPONSIVE STYLES === */
/* =================================== */

/* Hide mobile elements on desktop by default */
.mobile-header,
.welcome-banner-mobile,
.mobile-sidebar,
.sidebar-overlay {
  display: none;
}

.welcome-avatar {
  width: 2.5rem; /* 40px */
  height: 2.5rem; /* 40px */
  background: rgba(255,255,255,0.6);
  color: #c20000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 600;
  transition: transform 0.18s cubic-bezier(0.4,0,0.2,1), box-shadow 0.18s cubic-bezier(0.4,0,0.2,1);
  cursor: pointer;
  overflow: hidden;
  border: 1.5px solid #222;
  margin-top: -0.625rem;
}

.welcome-avatar:hover {
  transform: scale(1.12);
  box-shadow: 0 4px 16px rgba(194,0,0,0.18);
}

@media (max-width: 768px) {
  /* Hide desktop-specific elements */
  :deep(.sidebar-nav),
  :deep(.dashboard-header) {
    display: none !important;
  }

  /* Show mobile-specific elements */
  .mobile-header,
  .welcome-banner-mobile {
    display: flex;
  }

  /* Mobile Header */
  .mobile-header {
    background: #fff;
    padding: 1rem 1.5rem;
    justify-content: space-between;
    align-items: center;
    margin: 1.5rem 1.5rem 0;
    border-radius: 0.75rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }

  .mobile-logo {
    height: 32px;
  }

  .hamburger-menu {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 28px;
    height: 21px;
    z-index: 1002;
  }

  .hamburger-menu span {
    display: block;
    width: 100%;
    height: 3px;
    background-color: #c20000;
    border-radius: 2px;
  }

  /* Mobile Sidebar */
  .mobile-sidebar {
    position: fixed;
    top: 0;
    left: -280px;
    width: 280px;
    height: 100%;
    background: #fff;
    z-index: 1001;
    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid #e5e7eb;
  }

  .mobile-sidebar.is-open {
    left: 0;
  }

  .mobile-sidebar-header {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .sidebar-header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .sidebar-header-logo {
    height: 36px;
  }
  
  .sidebar-header-text h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #111827;
  }
  
  .sidebar-header-text p {
    font-size: 0.9rem;
    color: #6b7280;
  }

  .close-sidebar-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    position: relative;
    align-self: flex-end;
    margin-bottom: 1rem;
  }

  .close-sidebar-btn span {
    display: block;
    position: absolute;
    width: 100%;
    height: 3px;
    background-color: #c20000;
    border-radius: 2px;
    top: 50%;
    left: 0;
  }

  .close-sidebar-btn span:first-child {
    transform: translateY(-50%) rotate(45deg);
  }

  .close-sidebar-btn span:last-child {
    transform: translateY(-50%) rotate(-45deg);
  }

  .mobile-nav {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .mobile-nav-link {
    padding: 0.8rem 1.2rem;
    border-radius: 0.5rem;
    color: #6b7280;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.2s, background-color 0.2s;
  }

  .mobile-nav-link:hover {
    color: #c20000;
  }

  .mobile-nav-link.active-link {
    background: #f3f4f6;
    color: #c20000;
  }

  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }

  /* Welcome Banner */
  .welcome-banner-mobile {
    background: #fff;
    padding: 1.5rem;
    justify-content: space-between;
    align-items: center;
    margin: 1rem 1.5rem;
    border-radius: 0.75rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    position: relative;
  }

  .welcome-title {
    color: #c20000;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .welcome-subtitle {
    color: #6b7280;
    font-size: 0.9rem;
  }

  /* Main Dashboard Content */
  .dashboard-main {
    padding: 0;
    background-color: #f8f9fa;
  }

  .dashboard-stats {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0 1.5rem 1.5rem;
    margin: 0;
    grid-template-columns: 1fr; /* Override grid */
  }

  .stat-card {
    background: #fff;
    border-radius: 0.75rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .stat-card-top {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
  }

  .stat-icon {
    display: none;
  }

  .stat-label {
    color: #6b7280;
    font-size: 0.9rem;
  }

  .stat-value {
    color: #111827;
    font-size: 1.75rem;
    font-weight: 600;
  }

  .stat-card-bottom {
    font-size: 0.8rem;
    padding-top: 0.5rem;
  }
  
  .stat-card-bottom .fas {
    font-size: 0.8rem;
  }

  /* Adjust other sections for mobile */
  .dashboard-2col, .dashboard-actions {
    padding: 0 1.5rem 1.5rem 1.5rem;
    margin: 0;
    grid-template-columns: 1fr;
  }

  .profile-dropdown-mobile {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
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
}

@media (min-width: 769px) {
  .mobile-header,
  .welcome-banner-mobile,
  .mobile-sidebar,
  .sidebar-overlay {
    display: none !important;
  }
}
</style>
  