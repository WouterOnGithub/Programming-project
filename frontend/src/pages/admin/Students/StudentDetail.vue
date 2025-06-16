<template>
  <div class="student-detail">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Student Details</h1>
        <p class="page-subtitle" v-if="student">Bekijk alle informatie van {{ student.firstName }} {{ student.lastName }}</p>
      </div>
      <div class="header-actions">
        <router-link to="/admin/students" class="btn btn-secondary">
          <span class="btn-icon">←</span>
          Terug naar lijst
        </router-link>
        <router-link v-if="student" :to="`/admin/students/${student.id}/edit`" class="btn btn-primary">
          <span class="btn-icon">✏️</span>
          Bewerken
        </router-link>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Student gegevens laden...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>

    <!-- Student Info Card -->
    <div v-else-if="student" class="detail-container">
      <div class="detail-grid">
        <!-- Profile Section -->
        <div class="detail-card profile-card">
          <div class="profile-header">
            <div class="profile-avatar">
              <img v-if="student.photo" :src="student.photo" :alt="student.firstName">
              <span v-else>{{ student.firstName?.charAt(0) }}{{ student.lastName?.charAt(0) }}</span>
            </div>
            <div class="profile-info">
              <h2 class="student-name">{{ student.firstName }} {{ student.lastName }}</h2>
              <p class="student-email">{{ student.email }}</p>
              <span class="status-badge active">Actief</span>
            </div>
          </div>
        </div>

        <!-- Basic Info -->
        <div class="detail-card">
          <h3 class="card-title">Basis Informatie</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Leeftijd</label>
              <span>{{ student.age }} jaar</span>
            </div>
            <div class="info-item">
              <label>Studiejaar</label>
              <span>{{ student.studyYear }}</span>
            </div>
            <div class="info-item">
              <label>Domein</label>
              <span>{{ student.domain }}</span>
            </div>
            <div class="info-item">
              <label>Gezochte Opportuniteit</label>
              <span>{{ student.opportunity }}</span>
            </div>
            <div class="info-item">
              <label>Beschikbaar vanaf</label>
              <span>{{ formatDate(student.availableFrom) }}</span>
            </div>
          </div>
        </div>

        <!-- Skills -->
        <div class="detail-card">
          <h3 class="card-title">Vaardigheden</h3>
          <div class="skills-list">
            <span v-for="skill in student.skills" :key="skill" class="skill-tag">
              {{ skill }}
            </span>
          </div>
        </div>

        <!-- Languages -->
        <div class="detail-card">
          <h3 class="card-title">Talenkennis</h3>
          <p class="languages-text">{{ student.languages }}</p>
        </div>

        <!-- Introduction -->
        <div class="detail-card full-width">
          <h3 class="card-title">Introductie</h3>
          <p class="introduction-text">{{ student.introduction }}</p>
        </div>

        <!-- Contact & Links -->
        <div class="detail-card">
          <h3 class="card-title">Contact & Links</h3>
          <div class="contact-links">
            <a v-if="student.linkedin" :href="student.linkedin" target="_blank" class="contact-link">
              <span class="link-icon">🔗</span>
              LinkedIn Profiel
            </a>
            <div v-if="student.cvFile" class="contact-link">
              <span class="link-icon">📄</span>
              CV Download
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from '../../../firebase/config'
import { doc, getDoc } from 'firebase/firestore'

export default {
  name: 'StudentDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const student = ref(null)
    const loading = ref(true)
    const error = ref(null)

    const loadStudent = async () => {
      try {
        const studentId = route.params.id
        if (!studentId) {
          throw new Error('Geen student ID gevonden')
        }

        const docRef = doc(db, 'student', studentId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          student.value = {
            id: docSnap.id,
            ...docSnap.data()
          }
        } else {
          throw new Error('Student niet gevonden')
        }
      } catch (err) {
        console.error('Error loading student:', err)
        error.value = err.message
        router.push('/admin/students')
      } finally {
        loading.value = false
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('nl-NL')
    }

    onMounted(loadStudent)

    return {
      student,
      loading,
      error,
      formatDate
    }
  }
}
</script>

<style scoped>
.student-detail {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 20px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.page-subtitle {
  color: #666;
  margin: 0;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.detail-container {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.detail-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e9ecef;
}

.detail-card.full-width {
  grid-column: 1 / -1;
}

.detail-card.profile-card {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #1a1a1a;
  overflow: hidden;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info {
  flex: 1;
}

.student-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.student-email {
  margin: 0 0 12px 0;
  opacity: 0.9;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-badge.active {
  background: rgba(255, 255, 255, 0.2);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-size: 0.875rem;
  color: #666;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  background: #e9ecef;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
}

.languages-text,
.introduction-text {
  margin: 0;
  line-height: 1.6;
}

.contact-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #007bff;
  text-decoration: none;
}

.contact-link:hover {
  text-decoration: underline;
}
</style>

