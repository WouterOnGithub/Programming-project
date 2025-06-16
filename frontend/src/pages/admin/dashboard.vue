<template>
  <div class="dashboard">
    <!-- Dashboard Header -->
    <div class="dashboard-header">
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">Welkom terug! Hier is een overzicht van je systeem.</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon students">👥</div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.totalStudents }}</h3>
          <p class="stat-label">Totaal Studenten</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon companies">🏢</div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.totalCompanies }}</h3>
          <p class="stat-label">Totaal bedrijven</p>
        </div>
      </div>
    </div>  


    <!-- Dashboard Content Grid -->
    <div class="dashboard-grid">
      <!-- Recent Students -->
      <div class="dashboard-card">
        <div class="card-header">
          <h2 class="card-title">Recente Studenten</h2>
          <router-link to="/admin/students" class="view-all-link">Bekijk alle</router-link>
        </div>
        <div class="card-content">
          <div class="student-list">
            <div 
              v-for="student in recentStudents" 
              :key="student.id"
              class="student-item"
            >
              <div class="student-avatar">{{ student.name.charAt(0) }}</div>
              <div class="student-info">
                <h4 class="student-name">{{ student.name }}</h4>
                <p class="student-email">{{ student.email }}</p>
              </div>
              <div class="student-status">
                <span :class="['status-badge', student.status]">
                  {{ student.status === 'active' ? 'Actief' : 'Inactief' }}
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
            <router-link to="/admin/students/new" class="action-button secondary">
              <span class="action-icon">➕</span>
              <span class="action-text">Nieuwe Bedrijf</span>
            </router-link>
            
            <router-link to="/admin/reports" class="action-button secondary">
              <span class="action-icon">📊</span>
              <span class="action-text">Rapporten Bekijken</span>
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
export default {
  name: 'Dashboard',
  data() {
    return {
      stats: {
        totalStudents: 1247,
        totalCompanies: 50,
      },
<<<<<<< Updated upstream
      recentStudents: [
        {
          id: 1,
          name: 'Emma van der Berg',
          email: 'emma.vandenberg@email.com',
          status: 'active'
        },
        {
          id: 2,
          name: 'Lucas Janssen',
          email: 'lucas.janssen@email.com',
          status: 'active'
        },
        {
          id: 3,
          name: 'Sophie de Vries',
          email: 'sophie.devries@email.com',
          status: 'inactive'
        },
        {
          id: 4,
          name: 'Daan Bakker',
          email: 'daan.bakker@email.com',
          status: 'active'
        }
      ],
      recentActivity: [
        {
          id: 1,
          icon: '👤',
          text: 'Nieuwe student Emma van der Berg is toegevoegd',
          time: '12:34'
        },
        
        {
          id: 3,
          icon: '✅',
          text: 'Lucas Janssen wijzigd profiel',
          time: '11:56'
        },
      ]
=======
      recentStudents: [],
      recentActivity: [],
      loading: {
        stats: true,
        students: true,
        activity: true
      },
      error: {
        stats: null,
        students: null,
        activity: null
      },
      unsubscribeStudents: null,
      unsubscribeCompanies: null
    }
  },
  async mounted() {
    await Promise.all([
      this.loadStats(),
      this.loadRecentStudents(),
      this.loadRecentActivity()
    ])
  },
  methods: {
    async loadStats() {
      try {
        this.loading.stats = true
        const studentsRef = collection(db, 'student')
        // Live teller met onSnapshot
        this.unsubscribeStudents && this.unsubscribeStudents();
        this.unsubscribeStudents = onSnapshot(studentsRef, (snapshot) => {
          this.stats.totalStudents = snapshot.size;
        })
        // Live teller bedrijven
        const companiesRef = collection(db, 'bedrijf')
        this.unsubscribeCompanies && this.unsubscribeCompanies();
        this.unsubscribeCompanies = onSnapshot(companiesRef, (snapshot) => {
          this.stats.totalCompanies = snapshot.size;
        })
      } catch (err) {
        console.error('Error loading stats:', err)
        this.error.stats = 'Er is een fout opgetreden bij het laden van de statistieken.'
      } finally {
        this.loading.stats = false
      }
    },
    beforeUnmount() {
      this.unsubscribeStudents && this.unsubscribeStudents();
      this.unsubscribeCompanies && this.unsubscribeCompanies();
    },
    async loadRecentStudents() {
      try {
        this.loading.students = true
        const usersRef = collection(db, 'users')
        const q = query(
          usersRef,
          where('type', '==', 'student'),
          orderBy('createdAt', 'desc'),
          limit(4)
        )
        const snap = await getDocs(q)
        this.recentStudents = snap.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || 'Naamloos',
          email: doc.data().email,
          status: 'active',
          createdAt: doc.data().createdAt
        }))
      } catch (err) {
        console.error('Error loading recent students:', err)
        this.error.students = 'Er is een fout opgetreden bij het laden van recente studenten.'
      } finally {
        this.loading.students = false
      }
    },
   
    async loadRecentActivity() {
      try {
        this.loading.activity = true
        const activities = []
       
        // Get recent student registrations
        const usersRef = collection(db, 'users')
        const recentUsersQuery = query(
          usersRef,
          orderBy('createdAt', 'desc'),
          limit(5)
        )
        const recentUsersSnap = await getDocs(recentUsersQuery)
       
        recentUsersSnap.forEach(doc => {
          const userData = doc.data()
          activities.push({
            id: doc.id,
            icon: userData.type === 'student' ? '👨‍🎓' : '🏢',
            text: `${userData.type === 'student' ? 'Nieuwe student' : 'Nieuw bedrijf'} geregistreerd: ${userData.name || userData.companyName}`,
            time: this.formatTimeAgo(userData.createdAt)
          })
        })
       
        // Sort activities by time
        activities.sort((a, b) => b.time.localeCompare(a.time))
        this.recentActivity = activities
      } catch (err) {
        console.error('Error loading recent activity:', err)
        this.error.activity = 'Er is een fout opgetreden bij het laden van recente activiteit.'
      } finally {
        this.loading.activity = false
      }
    },
   
    formatTimeAgo(timestamp) {
      if (!timestamp) return 'Onbekende tijd'
     
      const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp)
      const now = new Date()
      const seconds = Math.floor((now - date) / 1000)
     
      if (seconds < 60) return 'Zojuist'
     
      const minutes = Math.floor(seconds / 60)
      if (minutes < 60) return `${minutes} minuten geleden`
     
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours} uur geleden`
     
      const days = Math.floor(hours / 24)
      if (days < 7) return `${days} dagen geleden`
     
      return date.toLocaleDateString('nl-NL')
>>>>>>> Stashed changes
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

.action-button.primary {
  background: #007bff;
  color: white;
}

.action-button.primary:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.action-button.secondary {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #e9ecef;
}

.action-button.secondary:hover {
  background: #e9ecef;
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
</style>

