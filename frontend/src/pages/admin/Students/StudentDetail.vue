<template>
  <div class="student-detail">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Student Profiel</h1>
        <p class="page-subtitle">Gedetailleerde informatie over de student</p>
      </div>
      <div class="header-actions">
        <router-link v-if="student" :to="'/admin/students/' + student.id + '/edit'" class="btn btn-primary">
          <span class="btn-icon">✏️</span>
          Bewerken
        </router-link>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="student" class="profile-content">
      <!-- Basic Information -->
      <div class="profile-section">
        <div class="profile-header">
          <div class="student-avatar">
            <img v-if="student.photo" :src="student.photo" :alt="student.firstName">
            <span v-else>{{ student.firstName.charAt(0) }}{{ student.lastName.charAt(0) }}</span>
          </div>
          <div class="student-info">
            <h2>{{ student.firstName }} {{ student.lastName }}</h2>
            <p class="student-title">{{ student.domain }} - {{ student.studyYear }}</p>
            <div class="contact-info">
              <p><span class="icon">📧</span> {{ student.email }}</p>
              <p><span class="icon">📱</span> {{ student.phone }}</p>
            </div>
          </div>
          <div class="opportunity-badge" :class="student.opportunity.toLowerCase().replace(' ', '-')">
            {{ student.opportunity }}
          </div>
        </div>
      </div>

      <!-- Skills & Languages -->
      <div class="profile-grid">
        <div class="profile-section">
          <h3>Vaardigheden</h3>
          <div class="skills-list">
            <div v-for="skill in student.skills" :key="skill.name" class="skill-item">
              <span class="skill-name">{{ skill.name }}</span>
              <span class="skill-level">{{ skill.level }}</span>
            </div>
          </div>
        </div>

        <div class="profile-section">
          <h3>Talen</h3>
          <div class="languages-list">
            <div v-for="language in student.languages" :key="language.name" class="language-item">
              <span class="language-name">{{ language.name }}</span>
              <span class="language-level">{{ language.level }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Education & Experience -->
      <div class="profile-grid">
        <div class="profile-section">
          <h3>Opleiding</h3>
          <div class="timeline">
            <div v-for="edu in student.education" :key="edu.degree" class="timeline-item">
              <div class="timeline-content">
                <h4>{{ edu.degree }}</h4>
                <p class="institution">{{ edu.school }}</p>
                <p class="date">{{ formatDate(edu.startDate) }} - {{ formatDate(edu.endDate) }}</p>
                <span class="status-badge">{{ edu.status }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="profile-section">
          <h3>Ervaring</h3>
          <div class="timeline">
            <div v-for="exp in student.experience" :key="exp.title" class="timeline-item">
              <div class="timeline-content">
                <h4>{{ exp.title }}</h4>
                <p class="institution">{{ exp.company }}</p>
                <p class="date">{{ formatDate(exp.startDate) }} - {{ formatDate(exp.endDate) }}</p>
                <p class="description">{{ exp.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Projects -->
      <div class="profile-section">
        <h3>Projecten</h3>
        <div class="projects-grid">
          <div v-for="project in student.projects" :key="project.name" class="project-card">
            <h4>{{ project.name }}</h4>
            <p>{{ project.description }}</p>
            <div class="technologies">
              <span v-for="tech in project.technologies" :key="tech" class="tech-tag">
                {{ tech }}
              </span>
            </div>
            <a :href="project.link" target="_blank" class="project-link">Bekijk Project →</a>
          </div>
        </div>
      </div>

      <!-- Additional Information -->
      <div class="profile-grid">
        <div class="profile-section">
          <h3>Interesses</h3>
          <div class="interests-list">
            <span v-for="interest in student.interests" :key="interest" class="interest-tag">
              {{ interest }}
            </span>
          </div>
        </div>

        <div class="profile-section">
          <h3>Voorkeuren</h3>
          <div class="preferences">
            <p><strong>Locatie:</strong> {{ student.preferredLocation }}</p>
            <p><strong>Verplaatsing:</strong> {{ student.willingToRelocate ? 'Mogelijk' : 'Niet mogelijk' }}</p>
            <p><strong>Beschikbaarheid:</strong> {{ student.availability }}</p>
            <p><strong>Verwachte vergoeding:</strong> {{ student.expectedSalary }}</p>
          </div>
        </div>
      </div>

      <!-- Social Links -->
      <div class="profile-section">
        <h3>Sociale Media & Portfolio</h3>
        <div class="social-links">
          <a :href="student.linkedin" target="_blank" class="social-link linkedin">
            <span class="icon">🔗</span> LinkedIn
          </a>
          <a :href="student.github" target="_blank" class="social-link github">
            <span class="icon">📦</span> GitHub
          </a>
          <a :href="student.portfolio" target="_blank" class="social-link portfolio">
            <span class="icon">🎨</span> Portfolio
          </a>
        </div>
      </div>

      <!-- Notes -->
      <div class="profile-section">
        <h3>Notities</h3>
        <p class="notes">{{ student.notes }}</p>
      </div>
    </div>
    <div v-else class="loading-message">
      Laden...
    </div>
  </div>
</template>

<script>

export default {
  name: 'StudentDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const student = ref(null)
    const error = ref(null)

    const loadStudent = () => {
      try {
        const studentId = parseInt(route.params.id)
        console.log('Loading student with ID:', studentId)
        
        if (isNaN(studentId)) {
          throw new Error('Invalid student ID')
        }

        const foundStudent = getStudentById(studentId)
        console.log('Found student:', foundStudent)
        
        if (!foundStudent) {
          throw new Error('Student not found')
        }

        student.value = foundStudent
      } catch (err) {
        console.error('Error loading student:', err)
        error.value = err.message
        router.push('/admin/students')
      }
    }

    }
  }
}
</script>

<style scoped>
.student-detail {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 20px;
}

.header-content h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.header-content p {
  color: #666;
  margin: 0;
  font-size: 1.1rem;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
}

.student-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #666;
}

.student-info {
  flex: 1;
}

.student-info h2 {
  margin: 0 0 8px 0;
  font-size: 1.8rem;
  color: #1a1a1a;
}

.student-title {
  color: #666;
  margin: 0 0 12px 0;
}

.contact-info {
  display: flex;
  gap: 16px;
}

.contact-info p {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.opportunity-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.opportunity-badge.stage {
  background: #e3f2fd;
  color: #1976d2;
}

.skills-list, .languages-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.skill-item, .language-item {
  background: #f5f5f5;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.skill-level, .language-level {
  color: #666;
  font-size: 0.9rem;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline-item {
  position: relative;
  padding-left: 20px;
  border-left: 2px solid #e0e0e0;
}

.timeline-content {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
}

.timeline-content h4 {
  margin: 0 0 8px 0;
  color: #1a1a1a;
}

.institution {
  color: #666;
  margin: 0 0 4px 0;
}

.date {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 8px 0;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  background: #e8f5e9;
  color: #2e7d32;
  border-radius: 4px;
  font-size: 0.8rem;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.project-card {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
}

.project-card h4 {
  margin: 0 0 8px 0;
  color: #1a1a1a;
}

.technologies {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
}

.tech-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.project-link {
  color: #1976d2;
  text-decoration: none;
  font-weight: 600;
}

.interests-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.interest-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
}

.preferences p {
  margin: 8px 0;
}

.social-links {
  display: flex;
  gap: 16px;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: white;
  font-weight: 600;
}

.social-link.linkedin {
  background: #0077b5;
}

.social-link.github {
  background: #333;
}

.social-link.portfolio {
  background: #4CAF50;
}

.notes {
  color: #666;
  line-height: 1.6;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-icon {
  font-size: 1.2rem;
}

button:hover {
  opacity: 0.9;
}

.error-message {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.loading-message {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>

