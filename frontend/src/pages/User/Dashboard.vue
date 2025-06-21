<template>
  <StudentDashboardLayout>
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
        <h1 class="welcome-title">Welkom, {{ studentData.name }}!</h1>
        <p class="welcome-subtitle">Hier is je dashboard overzicht</p>
      </div>
      <div class="welcome-avatar" @click="handleAvatarClick">
        <img v-if="studentData.foto" :src="studentData.foto" alt="Profielfoto" class="avatar-img" />
        <span v-else>{{ studentData.name ? studentData.name.charAt(0) : 'S' }}</span>
      </div>
      <div v-if="showDropdown" id="mobile-profile-dropdown" class="profile-dropdown-mobile">
          <button class="dropdown-item" @click="goToProfile">Profiel</button>
          <button class="dropdown-item" @click="handleLogout">Uitloggen</button>
      </div>
    </section>

    <!-- Alleen de main content van de dashboardpagina, zonder sidebar/header -->
    <main class="dashboard-main">
      <!-- Stats Grid -->
      <section class="dashboard-stats">
        <div v-for="(stat, index) in statsData" :key="index" class="stat-card">
          <div v-if="loading.stats" class="stat-card-loading">
            <div class="loading-spinner"></div>
          </div>
          <div v-else-if="error.stats" class="stat-card-error">
            {{ error.stats }}
          </div>
          <template v-else>
            <div class="stat-card-top">
              <div>
                <p class="stat-label">{{ stat.title }}</p>
                <p class="stat-value">{{ stat.value }}</p>
              </div>
              <div :class="['stat-icon', stat.color]">
                <i :class="stat.icon"></i>
              </div>
            </div>
          </template>
        </div>
      </section>
      <!-- Appointments & Activity -->
      <section class="dashboard-2col">
        <div class="dashboard-card">
          <div class="dashboard-card-header">
            <h3>Komende Afspraken</h3>
            <i class="fas fa-calendar"></i>
          </div>
          <div v-if="loading.appointments" class="dashboard-loading">
            <div class="loading-spinner"></div>
          </div>
          <div v-else-if="error.appointments" class="dashboard-error">
            {{ error.appointments }}
          </div>
          <div v-else class="dashboard-appointments">
            <div v-if="appointments.length === 0" class="no-data">
              Geen komende afspraken
            </div>
            <div v-else v-for="appointment in appointments" :key="appointment.id" class="appointment-row">
              <div class="appointment-icon"><i class="fas fa-building"></i></div>
              <div class="appointment-info">
                <h4>{{ appointment.company }}</h4>
                <p>{{ appointment.type }}</p>
                <div class="appointment-meta">
                  <span><i class="fas fa-clock"></i> {{ appointment.date }} om {{ appointment.time }}</span>
                  <span><i class="fas fa-map-marker-alt"></i> {{ appointment.location }}</span>
                </div>
              </div>
              <div :class="['status-badge', appointment.status]">
                {{ getStatusText(appointment.status) }}
              </div>
            </div>
          </div>
        </div>
        <div class="dashboard-card">
          <div class="dashboard-card-header">
            <h3>Recente Activiteit</h3>
            <i class="fas fa-chart-line"></i>
          </div>
          <div v-if="loading.activity" class="dashboard-loading">
            <div class="loading-spinner"></div>
          </div>
          <div v-else-if="error.activity" class="dashboard-error">
            {{ error.activity }}
          </div>
          <div v-else class="dashboard-activity">
            <div v-if="recentActivity.length === 0" class="no-data">
              Geen recente activiteit
            </div>
            <div v-else v-for="(activity, index) in recentActivity" :key="index" class="activity-row">
              <div :class="['activity-dot', activity.type]"></div>
              <div>
                <p class="activity-action">{{ activity.action }}</p>
                <p class="activity-time">{{ activity.time }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <!-- Quick Actions -->
      <section class="dashboard-card dashboard-actions">
        <h3>Snelle Acties</h3>
        <div class="dashboard-actions-grid">
          <router-link to="/swipe" class="dashboard-action-btn bg-primary text-white" style="text-decoration: none;">
            <i class="fas fa-heart"></i> Start met Swipen
          </router-link>
          <button class="dashboard-action-btn bg-accent" @click="$router.push('/appointments')"><i class="fas fa-calendar"></i> Plan Afspraak</button>
          <router-link to="/stmatch" class="dashboard-action-btn bg-accent" style="text-decoration: none;">
            <i class="fas fa-users"></i> Bekijk Matches
          </router-link>
        </div>
      </section>
    </main>
  </StudentDashboardLayout>
  
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
          <p>Studentdashboard</p>
        </div>
      </div>
    </div>
    <nav class="mobile-nav">
      <router-link v-for="item in navigation" :key="item.name" :to="item.href" class="mobile-nav-link" :class="{ 'active-link': route.path === item.href }">
        <span>{{ item.name }}</span>
      </router-link>
    </nav>
  </aside>
  <div v-if="isMobileSidebarOpen" @click="toggleMobileSidebar" class="sidebar-overlay"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import StudentDashboardLayout from '../../components/StudentDashboardLayout.vue'
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const isMobileSidebarOpen = ref(false);
const showDropdown = ref(false);

const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value;
};

const handleAvatarClick = () => {
  showDropdown.value = !showDropdown.value;
};

const handleLogout = () => {
  router.push('/');
};

const goToProfile = () => {
    router.push('/WeergaveSt');
};

const handleClickOutside = (event) => {
  const dropdown = document.getElementById('mobile-profile-dropdown');
  const avatar = document.querySelector('.welcome-avatar');
  if (dropdown && !dropdown.contains(event.target) && avatar && !avatar.contains(event.target)) {
    showDropdown.value = false;
  }
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('mousedown', handleClickOutside);
  }
});

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: 'fas fa-chart-pie' },
  { name: 'Job Swiping', href: '/swipe', icon: 'fas fa-heart' },
  { name: 'Afspraken', href: '/appointments', icon: 'fas fa-calendar' },
  { name: 'Favorieten', href: '/Favorietenst', icon: 'fas fa-star' },
  { name: 'Matches', href: '/stmatch', icon: 'fas fa-check-double' },
  { name: 'Profiel', href: '/WeergaveSt', icon: 'fas fa-user' },
  { name: 'Instellingen', href: '/SettingsStu', icon: 'fas fa-cog' },
];

const loading = ref({
  stats: true,
  appointments: true,
  activity: true
});

const error = ref({
  stats: null,
  appointments: null,
  activity: null
});

const studentData = ref({
  name: 'Gebruiker',
  foto: null,
});
const statsData = ref([]);
const appointments = ref([]);
const recentActivity = ref([]);

const db = getFirestore();
const auth = getAuth();

const fetchDashboardData = async () => {
  const userId = auth.currentUser?.uid;
  console.log('StudentDashboard userId:', userId);
  if (!userId) {
    error.value.stats = 'Gebruiker niet ingelogd';
    error.value.appointments = 'Gebruiker niet ingelogd';
    error.value.activity = 'Gebruiker niet ingelogd';
    return;
  }

  try {
    // Fetch student data for mobile view
    const studentDocRef = doc(db, 'student', userId);
    const studentDocSnap = await getDoc(studentDocRef);
    if (studentDocSnap.exists()) {
      const data = studentDocSnap.data();
      studentData.value.name = data.voornaam ? `${data.voornaam} ${data.achternaam || ''}`.trim() : 'Gebruiker';
      studentData.value.foto = data.foto || null;
    }

    // Haal afspraken uit root-collectie 'afspraken'
    const afsprakenSnap = await getDocs(collection(db, 'afspraken'));
    const bedrijvenSnap = await getDocs(collection(db, 'bedrijf'));
    const bedrijvenMap = {};
    bedrijvenSnap.forEach(docu => { bedrijvenMap[docu.id] = docu.data(); });

    // Filter afspraken voor deze student en status upcoming
    const upcomingAppointments = afsprakenSnap.docs
      .map(docu => {
        const data = docu.data();
        const bedrijf = bedrijvenMap[data.bedrijfId] || {};
        return {
          id: docu.id,
          ...data,
          company: bedrijf.bedrijfsnaam || 'Onbekend',
          location: bedrijf.gesitueerdIn || '-',
          duration: bedrijf.gesprekDuur || '-',
          avatar: (bedrijf.bedrijfsnaam || '?')[0],
          status: data.status || '-',
          time: data.time || '-',
          type: data.type || 'Afspraak',
        };
      })
      .filter(a => a.studentUid === userId && a.status === 'upcoming');

    appointments.value = upcomingAppointments;
    loading.value.appointments = false;

    // Matches ophalen en tellen
    const matchesSnap = await getDocs(collection(db, 'student', userId, 'swipes'));
    const matchesCount = matchesSnap.docs.filter(docu => {
      const d = docu.data();
      return d.status === 'geaccepteerd' || d.status === 'gepland';
    });

    // Favorieten ophalen en tellen
    const favorietenSnap = await getDocs(collection(db, 'student', userId, 'favorieten'));
    const favorietenCount = favorietenSnap.size;

    statsData.value = [
      {
        title: 'Matches',
        value: matchesCount.length.toString(),
        change: '+0%',
        trend: 'neutral',
        icon: 'fas fa-users',
        color: 'text-green-600',
      },
      {
        title: 'Afspraken',
        value: upcomingAppointments.length.toString(),
        change: '0%',
        trend: 'neutral',
        icon: 'fas fa-calendar',
        color: 'text-purple-600',
      },
      {
        title: 'Favorieten',
        value: favorietenCount.toString(),
        change: '0%',
        trend: 'neutral',
        icon: 'fas fa-star',
        color: 'text-yellow-500',
      },
    ];
    loading.value.stats = false;
  } catch (err) {
    console.error('Error fetching stats:', err);
    error.value.stats = 'Er is een fout opgetreden bij het ophalen van de statistieken';
    loading.value.stats = false;
  }

  try {
    // Fetch activity
    const activityPromises = [
      // Matches
      getDocs(query(
        collection(db, 'matches'),
        where('studentId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(5)
      )),
      // Appointments
      getDocs(query(
        collection(db, 'appointments'),
        where('studentId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(5)
      ))
    ];

    const [matches, appointments] = await Promise.all(activityPromises);

    const activities = [
      ...matches.docs.map(doc => {
        const data = doc.data();
        return {
          type: 'match',
          action: `Match met ${data.companyName || 'een bedrijf'}`,
          time: data.createdAt ? data.createdAt.toDate() : new Date()
        };
      }),
      ...appointments.docs.map(doc => {
        const data = doc.data();
        return {
          type: 'appointment',
          action: `Afspraak met ${data.companyName || 'een bedrijf'}`,
          time: data.createdAt ? data.createdAt.toDate() : new Date()
        };
      })
    ];

    // Sort all activities by time and take the most recent 10
    recentActivity.value = activities
      .sort((a, b) => b.time - a.time)
      .slice(0, 10)
      .map(act => ({
        ...act,
        time: formatTimeAgo(act.time)
      }));

    loading.value.activity = false;
  } catch (err) {
    console.error('Error fetching activity:', err);
    error.value.activity = 'Er is een fout opgetreden bij het ophalen van de activiteit';
    loading.value.activity = false;
  }
};

const formatTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'zojuist';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minuten geleden`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} uur geleden`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} dagen geleden`;
  return date.toLocaleDateString('nl-NL');
};

function getStatusText(status) {
  return {
    upcoming: 'Komend',
    completed: 'Afgerond',
    geannuleerd: 'Geannuleerd'
  }[status] || status;
}

onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
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

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  /* Hide desktop-specific elements from the layout component */
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
    height: 42px;
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
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .stat-icon {
    display: block;
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
}

@media (min-width: 769px) {
  .mobile-header,
  .welcome-banner-mobile,
  .mobile-sidebar,
  .sidebar-overlay {
    display: none !important;
  }
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
.status-badge {
  display: inline-block;
  padding: 0.15em 0.7em;
  border-radius: 0.8em;
  font-size: 0.85rem;
  font-weight: 600;
  background: #e0fdf1;
  color: #065f46;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.status-badge.upcoming {
  background: #d1fae5;
  color: #065f46;
}
.status-badge.completed {
  background: #dbeafe;
  color: #1e40af;
}
.status-badge.geannuleerd {
  background: #fee2e2;
  color: #991b1b;
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
</style> 