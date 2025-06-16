<template>
  <div class="student-detail">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Student Details</h1>
        <p class="page-subtitle">Bekijk alle informatie van {{ student?.name || 'Onbekend' }}</p>
      </div>
      <div class="header-actions">
        <router-link to="/admin/students" class="btn btn-secondary">
          <span class="btn-icon">←</span>
          Terug naar lijst
        </router-link>
        <router-link :to="`/admin/students/${route.params.id}/edit`" class="btn btn-primary">
          <span class="btn-icon">✏️</span>
          Bewerken
        </router-link>
      </div>
    </div>
 
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
 
    <div v-else-if="student" class="detail-container">
      <div class="detail-grid">
        <!-- Profielfoto -->
        <div class="detail-card profile-card">
          <div class="profile-header">
            <div class="profile-avatar">
              <img v-if="student.profilePicture" :src="student.profilePicture" alt="Profielfoto" />
              <span v-else>{{ student.name ? student.name.charAt(0) : '?' }}</span>
            </div>
            <div class="profile-info">
              <h2 class="student-name">{{ student.name || 'Onbekend' }}</h2>
              <p class="student-email">{{ student.email || 'Onbekend' }}</p>
              <span class="status-badge active">Actief</span>
            </div>
          </div>
        </div>
        <!-- Basis info -->
        <div class="detail-card">
          <h3 class="card-title">Basis Informatie</h3>
          <div class="info-grid">
            <div class="info-item"><label>Leeftijd</label><span>{{ student.age || 'Onbekend' }}</span></div>
            <div class="info-item"><label>Studiejaar</label><span>{{ student.studyYear || 'Onbekend' }}</span></div>
            <div class="info-item"><label>Domein</label><span>{{ student.domain || 'Onbekend' }}</span></div>
            <div class="info-item"><label>Gezochte Opportuniteit</label><span>{{ student.opportunityType || 'Onbekend' }}</span></div>
            <div class="info-item"><label>Beschikbaar vanaf</label><span>{{ formatDate(student.availableFrom) }}</span></div>
          </div>
        </div>
        <!-- Skills -->
        <div class="detail-card">
          <h3 class="card-title">Vaardigheden</h3>
          <div class="skills-list">
            <span v-for="skill in student.skills || []" :key="skill" class="skill-tag">{{ skill }}</span>
          </div>
        </div>
        <!-- Talen -->
        <div class="detail-card">
          <h3 class="card-title">Talenkennis</h3>
          <p class="languages-text">{{ student.languages || 'Onbekend' }}</p>
        </div>
        <!-- Introductie -->
        <div class="detail-card full-width">
          <h3 class="card-title">Introductie</h3>
          <p class="introduction-text">{{ student.bio || student.introduction || 'Onbekend' }}</p>
        </div>
        <!-- Contact & Links -->
        <div class="detail-card">
          <h3 class="card-title">Contact & Links</h3>
          <div class="contact-links">
            <a v-if="student.linkedin" :href="student.linkedin" target="_blank" class="contact-link">
              <span class="link-icon">🔗</span>
              LinkedIn Profiel
            </a>
            <a v-if="student.cv" :href="student.cv" target="_blank" class="contact-link">
              <span class="link-icon">📄</span>
              CV Download
            </a>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="loading-message">Laden...</div>
  </div>
</template>
 
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from '../../../firebase/config'
import { getDoc, doc } from 'firebase/firestore'
 
const route = useRoute()
const router = useRouter()
const student = ref(null)
const error = ref(null)
 
const loadStudent = async () => {
  try {
    const studentId = route.params.id
    const docSnap = await getDoc(doc(db, 'student', studentId))
    if (docSnap.exists()) {
      student.value = docSnap.data()
    } else {
      throw new Error('Student niet gevonden')
    }
  } catch (err) {
    error.value = err.message
    router.push('/admin/students')
  }
}
 
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('nl-NL')
}
 
onMounted(loadStudent)
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
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
}
 
.profile-card .card-title {
  color: white;
  border-bottom-color: rgba(255,255,255,0.3);
}
 
.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
}
 
.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  overflow: hidden;
  flex-shrink: 0;
}
 
.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
 
.student-name {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 8px 0;
}
 
.student-email {
  font-size: 1.1rem;
  margin: 0 0 12px 0;
  opacity: 0.9;
}
 
.status-badge {
  background: rgba(255,255,255,0.2);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  display: inline-block;
}
 
.info-grid {
  display: grid;
  gap: 16px;
}
 
.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
 
.info-item label {
  font-weight: 600;
  color: #666;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
 
.info-item span {
  font-size: 1rem;
  color: #1a1a1a;
  font-weight: 500;
}
 
.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
 
.skill-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}
 
.languages-text,
.introduction-text {
  color: #495057;
  line-height: 1.6;
  margin: 0;
}
 
.introduction-text {
  font-size: 1.05rem;
}
 
.contact-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
 
.contact-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  text-decoration: none;
  color: #495057;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid #e9ecef;
}
 
.contact-link:hover {
  background: #f8f9fa;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
 
.link-icon {
  font-size: 1.2rem;
}
 
/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
 
  .header-actions {
    justify-content: stretch;
  }
 
  .detail-grid {
    grid-template-columns: 1fr;
  }
 
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>
