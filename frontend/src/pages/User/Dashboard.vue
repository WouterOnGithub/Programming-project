<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <aside class="sidebar-nav">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <i class="fas fa-graduation-cap"></i>
        </div>
        <div>
          <h1 class="sidebar-title">StudentMatch</h1>
          <p class="sidebar-subtitle">Student Dashboard</p>
        </div>
      </div>
      <nav class="sidebar-menu">
        <router-link v-for="item in navigation" :key="item.name" :to="item.href" :class="['sidebar-link', $route.path === item.href ? 'active' : '']">
          <i :class="item.icon"></i>
          {{ item.name }}
        </router-link>
      </nav>
      <div class="sidebar-user">
        <div class="sidebar-user-avatar">
          <i class="fas fa-user"></i>
        </div>
        <div>
          <p class="sidebar-user-name">{{ userData?.name || 'Gebruiker' }}</p>
          <p class="sidebar-user-role">Student</p>
        </div>
      </div>
    </aside>
    <!-- Main Content -->
    <main class="dashboard-main">
      <!-- Header -->
      <header class="dashboard-header">
        <div>
          <h1>Welkom terug, {{ userData?.name || 'Gebruiker' }}!</h1>
          <p>Hier is je dashboard overzicht</p>
        </div>
        <div class="dashboard-header-actions">
          <div class="dashboard-search">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="Zoeken..." />
          </div>
          <button class="dashboard-bell">
            <i class="fas fa-bell"></i>
            <span class="dashboard-bell-dot"></span>
          </button>
          <div class="dashboard-profile-avatar">{{ userData?.name?.[0] || 'G' }}</div>
        </div>
      </header>
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
              <div :class="['appointment-status', appointment.status]">
                {{ appointment.status === 'confirmed' ? 'Bevestigd' : 'In afwachting' }}
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
          <button class="dashboard-action-btn bg-primary text-white"><i class="fas fa-heart"></i> Start met Swipen</button>
          <button class="dashboard-action-btn bg-accent"><i class="fas fa-calendar"></i> Plan Afspraak</button>
          <button class="dashboard-action-btn bg-accent"><i class="fas fa-users"></i> Bekijk Matches</button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: 'fas fa-chart-pie' },
  { name: 'Job Swiping', href: '/swipe', icon: 'fas fa-heart' },
  { name: 'Afspraken', href: '/appointments', icon: 'fas fa-calendar' },
  { name: 'Profiel', href: '/profile', icon: 'fas fa-user' },
  { name: 'Instellingen', href: '/settings', icon: 'fas fa-cog' },
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

const statsData = ref([]);
const appointments = ref([]);
const recentActivity = ref([]);
const userData = ref(null);

const db = getFirestore();
const auth = getAuth();

const fetchDashboardData = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    error.value.stats = 'Gebruiker niet ingelogd';
    error.value.appointments = 'Gebruiker niet ingelogd';
    error.value.activity = 'Gebruiker niet ingelogd';
    return;
  }

  try {
    // Get user data
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      userData.value = userDoc.data();
    }

    // Fetch stats
    const [matches, appointmentsCount] = await Promise.all([
      getDocs(query(collection(db, 'matches'), where('studentId', '==', userId))),
      getDocs(query(collection(db, 'appointments'), where('studentId', '==', userId)))
    ]);

    statsData.value = [
      { 
        title: 'Matches', 
        value: matches.size.toString(), 
        change: '+25%', 
        trend: 'up', 
        icon: 'fas fa-users', 
        color: 'text-green-600' 
      },
      { 
        title: 'Afspraken', 
        value: appointmentsCount.size.toString(), 
        change: '0%', 
        trend: 'neutral', 
        icon: 'fas fa-calendar', 
        color: 'text-purple-600' 
      }
    ];
    loading.value.stats = false;
  } catch (err) {
    console.error('Error fetching stats:', err);
    error.value.stats = 'Er is een fout opgetreden bij het ophalen van de statistieken';
    loading.value.stats = false;
  }

  try {
    // Fetch appointments
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('studentId', '==', userId),
      orderBy('date', 'asc')
    );
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    
    const appointmentsPromises = appointmentsSnapshot.docs.map(async (doc) => {
      const appointment = doc.data();
      let companyName = 'Onbekend bedrijf';
      let location = 'Onbekende locatie';

      try {
        const companyDoc = await getDoc(doc(db, 'bedrijf', appointment.companyId));
        if (companyDoc.exists()) {
          const companyData = companyDoc.data();
          companyName = companyData.companyName || 'Onbekend bedrijf';
          location = companyData.location || 'Onbekende locatie';
        }
      } catch (err) {
        console.error('Error fetching company data:', err);
      }
      
      return {
        id: doc.id,
        company: companyName,
        type: appointment.type || 'Afspraak',
        date: appointment.date ? new Date(appointment.date.toDate()).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' }) : 'Geen datum',
        time: appointment.date ? new Date(appointment.date.toDate()).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) : 'Geen tijd',
        location: location,
        status: appointment.status || 'pending'
      };
    });

    appointments.value = await Promise.all(appointmentsPromises);
    loading.value.appointments = false;
  } catch (err) {
    console.error('Error fetching appointments:', err);
    error.value.appointments = 'Er is een fout opgetreden bij het ophalen van de afspraken';
    loading.value.appointments = false;
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

onMounted(() => {
  fetchDashboardData();
});
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
</style> 