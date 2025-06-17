<template>
  <div class="dashboard">
    <!-- Dashboard Header -->
    <div class="dashboard-header">
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">Welkom terug! Hier is een overzicht van je systeem.</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <router-link to="/admin/students" class="stat-card" style="text-decoration: none; color: inherit;">
        <div class="stat-icon students">👥</div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.totalStudents }}</h3>
          <p class="stat-label">Totaal Studenten</p>
        </div>
      </router-link>

      <router-link to="/admin/companies" class="stat-card" style="text-decoration: none; color: inherit;">
        <div class="stat-icon companies">🏢</div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.totalCompanies }}</h3>
          <p class="stat-label">Totaal bedrijven</p>
        </div>
      </router-link>

      <router-link to="/admin/matches" class="stat-card" style="text-decoration: none; color: inherit;">
        <div class="stat-icon matches">💫</div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.totalMatches }}</h3>
          <p class="stat-label">Totaal Matches</p>
        </div>
      </router-link>

      <router-link to="/admin/appointments" class="stat-card" style="text-decoration: none; color: inherit;">
        <div class="stat-icon appointments">📅</div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.totalAppointments }}</h3>
          <p class="stat-label">Totaal Afspraken</p>
        </div>
      </router-link>
    </div>  


    <!-- Dashboard Content Grid -->
    <div class="dashboard-grid">
      <!-- Recent Matches -->
      <div class="dashboard-card">
        <div class="card-header">
          <h2 class="card-title">Recente Matches</h2>
          <router-link to="/admin/matches" class="view-all-link">Bekijk alle</router-link>
        </div>
        <div class="card-content">
          <div class="match-list">
            <div 
              v-for="match in recentMatches" 
              :key="match.id"
              class="match-item"
            >
              <div class="match-info">
                <div class="match-parties">
                  <span class="student-name">{{ match.studentName }}</span>
                  <span class="match-arrow">↔️</span>
                  <span class="company-name">{{ match.companyName }}</span>
                </div>
                <p class="match-date">{{ formatDate(match.createdAt) }}</p>
              </div>
              <div class="match-status">
                <span :class="['status-badge', match.status]">
                  {{ getMatchStatus(match.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Appointments -->
      <div class="dashboard-card">
        <div class="card-header">
          <h2 class="card-title">Aankomende Afspraken</h2>
          <router-link to="/admin/appointments" class="view-all-link">Bekijk alle</router-link>
        </div>
        <div class="card-content">
          <div class="appointment-list">
            <div 
              v-for="appointment in upcomingAppointments" 
              :key="appointment.id"
              class="appointment-item"
            >
              <div class="appointment-time">
                <span class="time">{{ formatTime(appointment.startTime) }}</span>
                <span class="date">{{ formatDate(appointment.startTime) }}</span>
              </div>
              <div class="appointment-info">
                <h4 class="appointment-title">{{ appointment.title }}</h4>
                <p class="appointment-participants">
                  {{ appointment.studentName }} & {{ appointment.companyName }}
                </p>
              </div>
              <div class="appointment-status">
                <span :class="['status-badge', appointment.status]">
                  {{ getAppointmentStatus(appointment.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="dashboard-card">
        <div class="card-header">
          <h2 class="card-title">Snelle Acties</h2>
        </div>
        <div class="card-content">
          <div class="quick-actions">
            <router-link to="/admin/students/new" class="action-button primary">
              <span class="action-icon">➕</span>
              <span class="action-text">Nieuwe Student</span>
            </router-link>
            <router-link to="/admin/companies/new" class="action-button secondary">
              <span class="action-icon">➕</span>
              <span class="action-text">Nieuw Bedrijf</span>
            </router-link>
            <router-link to="/admin/matches" class="action-button secondary">
              <span class="action-icon">💫</span>
              <span class="action-text">Matches Beheren</span>
            </router-link>
            <router-link to="/admin/appointments" class="action-button secondary">
              <span class="action-icon">📅</span>
              <span class="action-text">Afspraken Beheren</span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Activity Feed -->
      <div class="dashboard-card full-width">
        <div class="card-header">
          <h2 class="card-title">Recente Activiteit</h2>
        </div>
        <div class="card-content">
          <div class="activity-feed">
            <div 
              v-for="activity in recentActivity" 
              :key="activity.id"
              class="activity-item"
            >
              <div class="activity-icon">{{ activity.icon }}</div>
              <div class="activity-content">
                <p class="activity-text">{{ activity.text }}</p>
                <span class="activity-time">{{ activity.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { db } from '../../firebase/config'
import { collection, query, where, orderBy, limit, getDocs, onSnapshot, getDoc, doc } from 'firebase/firestore'

export default {
  name: 'Dashboard',
  setup() {
    const stats = ref({
      totalStudents: 0,
      totalCompanies: 0,
      totalMatches: 0,
      totalAppointments: 0
    })
    const recentStudents = ref([])
    const recentMatches = ref([])
    const upcomingAppointments = ref([])
    const recentActivity = ref([])
    const loading = ref({
      stats: true,
      students: true,
      matches: true,
      appointments: true,
      activity: true
    })
    const error = ref({
      stats: null,
      students: null,
      matches: null,
      appointments: null,
      activity: null
    })
    let unsubscribeStudents = null
    let unsubscribeCompanies = null
    let unsubscribeMatches = null
    let unsubscribeAppointments = null

    const loadStats = async () => {
      try {
        loading.value.stats = true
        // Students count
        const studentsRef = collection(db, 'student')
        unsubscribeStudents && unsubscribeStudents()
        unsubscribeStudents = onSnapshot(studentsRef, (snapshot) => {
          stats.value.totalStudents = snapshot.size
        })

        // Companies count
        const companiesRef = collection(db, 'bedrijf')
        unsubscribeCompanies && unsubscribeCompanies()
        unsubscribeCompanies = onSnapshot(companiesRef, (snapshot) => {
          stats.value.totalCompanies = snapshot.size
        })

        // Matches count
        const matchesRef = collection(db, 'matches')
        unsubscribeMatches && unsubscribeMatches()
        unsubscribeMatches = onSnapshot(matchesRef, (snapshot) => {
          stats.value.totalMatches = snapshot.size
        })

        // Appointments count
        const appointmentsRef = collection(db, 'appointments')
        unsubscribeAppointments && unsubscribeAppointments()
        unsubscribeAppointments = onSnapshot(appointmentsRef, (snapshot) => {
          stats.value.totalAppointments = snapshot.size
        })
      } catch (err) {
        console.error('Error loading stats:', err)
        error.value.stats = 'Er is een fout opgetreden bij het laden van de statistieken.'
      } finally {
        loading.value.stats = false
      }
    }

    const loadRecentMatches = async () => {
      try {
        loading.value.matches = true
        const matchesRef = collection(db, 'matches')
        const q = query(
          matchesRef,
          orderBy('createdAt', 'desc'),
          limit(5)
        )
        const snap = await getDocs(q)
        recentMatches.value = await Promise.all(snap.docs.map(async doc => {
          const data = doc.data()
          // Get student and company names
          const studentDoc = await getDoc(doc(db, 'student', data.studentId))
          const companyDoc = await getDoc(doc(db, 'bedrijf', data.companyId))
          return {
            id: doc.id,
            studentName: studentDoc.exists() ? `${studentDoc.data().firstName} ${studentDoc.data().lastName}` : 'Onbekende student',
            companyName: companyDoc.exists() ? companyDoc.data().bedrijfsnaam : 'Onbekend bedrijf',
            status: data.status,
            createdAt: data.createdAt
          }
        }))
      } catch (err) {
        console.error('Error loading recent matches:', err)
        error.value.matches = 'Er is een fout opgetreden bij het laden van recente matches.'
      } finally {
        loading.value.matches = false
      }
    }

    const loadUpcomingAppointments = async () => {
      try {
        loading.value.appointments = true
        const appointmentsRef = collection(db, 'appointments')
        const now = new Date()
        const q = query(
          appointmentsRef,
          where('startTime', '>=', now),
          orderBy('startTime', 'asc'),
          limit(5)
        )
        const snap = await getDocs(q)
        upcomingAppointments.value = await Promise.all(snap.docs.map(async doc => {
          const data = doc.data()
          // Get student and company names
          const studentDoc = await getDoc(doc(db, 'student', data.studentId))
          const companyDoc = await getDoc(doc(db, 'bedrijf', data.companyId))
          return {
            id: doc.id,
            title: data.title,
            startTime: data.startTime.toDate(),
            studentName: studentDoc.exists() ? `${studentDoc.data().firstName} ${studentDoc.data().lastName}` : 'Onbekende student',
            companyName: companyDoc.exists() ? companyDoc.data().bedrijfsnaam : 'Onbekend bedrijf',
            status: data.status
          }
        }))
      } catch (err) {
        console.error('Error loading upcoming appointments:', err)
        error.value.appointments = 'Er is een fout opgetreden bij het laden van aankomende afspraken.'
      } finally {
        loading.value.appointments = false
      }
    }

    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('nl-NL')
    }

    const formatTime = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
    }

    const getMatchStatus = (status) => {
      const statusMap = {
        pending: 'In afwachting',
        accepted: 'Geaccepteerd',
        rejected: 'Afgewezen',
        completed: 'Voltooid'
      }
      return statusMap[status] || status
    }

    const getAppointmentStatus = (status) => {
      const statusMap = {
        scheduled: 'Gepland',
        confirmed: 'Bevestigd',
        completed: 'Voltooid',
        cancelled: 'Geannuleerd'
      }
      return statusMap[status] || status
    }

    onMounted(async () => {
      await Promise.all([
        loadStats(),
        loadRecentStudents(),
        loadRecentMatches(),
        loadUpcomingAppointments(),
        loadRecentActivity()
      ])
    })

    onBeforeUnmount(() => {
      unsubscribeStudents && unsubscribeStudents()
      unsubscribeCompanies && unsubscribeCompanies()
      unsubscribeMatches && unsubscribeMatches()
      unsubscribeAppointments && unsubscribeAppointments()
    })

    return {
      stats,
      recentStudents,
      recentMatches,
      upcomingAppointments,
      recentActivity,
      loading,
      error,
      formatDate,
      formatTime,
      getMatchStatus,
      getAppointmentStatus
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.dashboard-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.page-subtitle {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.students { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon.courses { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-icon.enrollment { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.stat-icon.completion { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.stat-label {
  color: #666;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.stat-change {
  font-size: 0.875rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
}

.stat-change.positive {
  background: #e8f5e8;
  color: #2d7d32;
}

.stat-change.neutral {
  background: #f5f5f5;
  color: #666;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.dashboard-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.dashboard-card.full-width {
  grid-column: 1 / -1;
}

.card-header {
  padding: 24px 24px 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.view-all-link {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
}

.view-all-link:hover {
  text-decoration: underline;
}

.card-content {
  padding: 16px 24px 24px 24px;
}

/* Student List */
.student-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.student-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.student-item:hover {
  background-color: #f8f9fa;
}

.student-avatar {
  width: 40px;
  height: 40px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.student-info {
  flex: 1;
}

.student-name {
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
  font-size: 0.95rem;
}

.student-email {
  color: #666;
  margin: 0;
  font-size: 0.875rem;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: #e8f5e8;
  color: #2d7d32;
}

.status-badge.inactive {
  background: #fff3e0;
  color: #f57c00;
}

/* Quick Actions */
.quick-actions {
  display: grid;
  gap: 12px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-button.primary,
.action-button.secondary {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #e9ecef;
}

.action-button.primary:hover,
.action-button.secondary:hover {
  background: #007bff;
  color: white;
  transform: translateY(-1px);
}

.action-icon {
  font-size: 1.2rem;
}

/* Activity Feed */
.activity-feed {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.activity-item:hover {
  background-color: #f8f9fa;
}

.activity-icon {
  width: 36px;
  height: 36px;
  background: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-text {
  margin: 0 0 4px 0;
  color: #1a1a1a;
  font-weight: 500;
}

.activity-time {
  color: #666;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 1.3rem;
  }
  
  .stat-number {
    font-size: 1.75rem;
  }
}

.match-list,
.appointment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.match-item,
.appointment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.match-parties {
  display: flex;
  align-items: center;
  gap: 8px;
}

.match-arrow {
  color: #666;
}

.match-date,
.appointment-date {
  font-size: 0.875rem;
  color: #666;
  margin-top: 4px;
}

.appointment-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  min-width: 80px;
}

.appointment-time .time {
  font-weight: 600;
  color: #1a1a1a;
}

.appointment-time .date {
  font-size: 0.75rem;
  color: #666;
}

.appointment-info {
  flex: 1;
  margin: 0 16px;
}

.appointment-title {
  margin: 0 0 4px 0;
  font-size: 1rem;
}

.appointment-participants {
  margin: 0;
  font-size: 0.875rem;
  color: #666;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.accepted,
.status-badge.confirmed {
  background: #d4edda;
  color: #155724;
}

.status-badge.rejected,
.status-badge.cancelled {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.completed {
  background: #cce5ff;
  color: #004085;
}
</style>

