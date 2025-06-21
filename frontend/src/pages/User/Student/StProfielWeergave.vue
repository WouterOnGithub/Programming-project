<template>
  <StudentDashboardLayout>
    <main class="dashboard-main">
      <section v-if="loading" class="section-card">Laden...</section>
      <section v-else-if="error" class="section-card" style="color: #b80000;">{{ error }}</section>
      <template v-else>
        <!-- Alleen de main content van de profielpagina, zonder sidebar/header -->
        <section class="hero-banner">
          <div class="hero-photo">
            <img :src="student?.fotoUrl || profielfoto" alt="Profielfoto" />
          </div>
          <div class="hero-text">
            <h1>{{ student?.voornaam }} {{ student?.achternaam }}</h1>
            <p v-if="student?.domein" class="domein">
              {{ Array.isArray(student.domein) ? student.domein.join(', ') : student.domein }} - {{ student.studiejaar }}
            </p>
          </div>
          <router-link to="/WijzigenSt" class="wijzig-knop">Wijzig</router-link>
        </section>
    
        <section class="section-card">
          <h2>Introductie</h2>
          <p class="intro-text">{{ student.intro }}</p>
        </section>
    
        <section class="section-card">
          <h2>Informatie</h2>
          <ul class="info-list">
            <li><strong>Leeftijd:</strong> {{ student?.leeftijd }}</li>
            <li><strong>Beschikbaar vanaf:</strong> {{ student?.beschikbaarVanaf }}</li>
            <li><strong>Opportuniteit:</strong> {{ student?.opportuniteit }}</li>
            <li><strong>LinkedIn:</strong> <a :href="student?.linkedin" target="_blank">Bekijk profiel</a></li>
          </ul>
        </section>
    
        <section class="section-card">
          <h2>Vaardigheden</h2>
          <div class="chip-cloud">
            <span class="chip" v-for="skill in student?.skills || []" :key="skill">{{ skill }}</span>
          </div>
        </section>
    
        <section class="section-card">
          <h2>Talenkennis</h2>
          <div class="badge-row">
            <span class="badge" v-for="taal in student?.talenkennis || []" :key="taal">
              {{ taal }}<span v-if="taal === 'Andere'"> ({{ student?.andereTaal }})</span>
            </span>
          </div>
        </section>
    
        <section class="grid-2">
          <div class="section-card">
            <h2>CV</h2>
            <div v-if="student?.cv && (typeof student.cv === 'string' || student.cv.url || student.cv.CVUrl || student.cv.cvUrl)">
              <button type="button" class="download-cv-btn" @click="downloadCV">
                Download CV
              </button>
            </div>
            <p v-else>
              Geen CV geüpload
            </p>
          </div>
        </section>
      </template>
    </main>
  </StudentDashboardLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'
import profielfoto from '/Images/profielfoto.jpg'
import StudentDashboardLayout from '../../../components/StudentDashboardLayout.vue'

const router = useRouter()
const student = ref(null)
const loading = ref(true)
const error = ref(null)

const db = getFirestore()
const auth = getAuth()

onMounted(async () => {
  const user = auth.currentUser
  if (!user) {
    error.value = 'Niet ingelogd.'
    loading.value = false
    return
  }
  try {
    const q = query(collection(db, 'student'), where('authUid', '==', user.uid))
    const snapshot = await getDocs(q)
    if (!snapshot.empty) {
      student.value = snapshot.docs[0].data()
    } else {
      error.value = 'Geen studentprofiel gevonden.'
    }
  } catch (e) {
    error.value = 'Fout bij ophalen studentprofiel.'
  } finally {
    loading.value = false
  }
})

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: 'fas fa-chart-pie' },
  { name: 'Job Swiping', href: '/swipe', icon: 'fas fa-heart' },
  { name: 'Afspraken', href: '/appointments', icon: 'fas fa-calendar' },
  { name: 'Favorieten', href: '/Favorietenst', icon: 'fas fa-star' },
  { name: 'Profiel', href: '/WeergaveSt', icon: 'fas fa-user' },
  { name: 'Instellingen', href: '/settings', icon: 'fas fa-cog' },
]

function downloadCV() {
  const cv = student.value?.cv
  let url = ''
  if (typeof cv === 'string') url = cv
  else if (cv?.url) url = cv.url
  else if (cv?.CVUrl) url = cv.CVUrl
  else if (cv?.cvUrl) url = cv.cvUrl
  if (url) window.open(url, '_blank')
}
</script>

<!-- ✅ GLOBAAL (NIET-SCOPED): CSS-variabelen -->
<style>
:root {
  --rood: #c20000;
  --tekst-donker: #111827;
  --tekst-licht: #6b7280;
  --achtergrond-kaart: #fff;
  --achtergrond-pagina: #f5f5f7;
  --grens: #e5e7eb;
}
</style>

<!-- ✅ COMPONENT SCOPED STYLES -->
<style scoped>
.dashboard-container {
  display: flex;
  font-family: 'Segoe UI', sans-serif;
  background: var(--achtergrond-pagina);
  min-height: 100vh;
}

.sidebar-nav {
  width: 16rem;
  background: #fff;
  border-right: 1px solid var(--grens);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 1rem 1rem;
  border-bottom: 1px solid var(--grens);
}

.sidebar-logo {
  width: 2rem;
  height: 2rem;
  background: var(--rood);
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
}

.sidebar-subtitle {
  font-size: 0.8rem;
  color: var(--tekst-licht);
}

.sidebar-menu {
  padding: 1rem;
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
  color: var(--tekst-donker);
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
}

.sidebar-link.active,
.sidebar-link:hover {
  background: #f3f4f6;
  color: var(--rood);
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid var(--grens);
  background: #f9fafb;
}

.sidebar-user-avatar {
  width: 2rem;
  height: 2rem;
  background: var(--rood);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.sidebar-user-name {
  font-weight: 600;
}

.sidebar-user-role {
  font-size: 0.8rem;
  color: var(--tekst-licht);
}

.sidebar-footer {
  margin-top: auto;
  padding: 1rem;
  border-top: 1px solid var(--grens);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
  background: white;
  border-bottom: 1px solid var(--grens);
}

.dashboard-header h1 {
  color: var(--rood);
  font-size: 1.3rem;
  font-weight: 600;
}

.dashboard-header p {
  color: var(--tekst-licht);
}

.dashboard-profile-avatar {
  width: 2rem;
  height: 2rem;
  background: var(--rood);
  color: white;
  font-weight: bold;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-banner {
  display: flex;
  gap: 2rem;
  align-items: center;
  background: linear-gradient(135deg, #fafafa, #fff1f1);
  padding: 2rem;
  border-radius: 24px;
  margin: 2rem;
  position: relative;
}

.hero-photo img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--rood);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.section-card {
  background: white;
  margin: 1rem 2rem;
  border-left: 4px solid var(--rood);
  padding: 2rem;
  border-radius: 0.75rem;
}

.section-card h2 {
  color: var(--rood);
  margin-bottom: 1rem;
}

.intro-text {
  white-space: pre-wrap;
  word-break: break-word;
  color: #374151;
  line-height: 1.6;
  background: #fff3f3;
  padding: 1rem;
  border-left: 4px solid var(--rood);
  border-radius: 8px;
}

.info-list {
  list-style: none;
  padding: 0;
}

.info-list li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px dashed #ddd;
}

.chip-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  background: #f3f4f6;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
}

.badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.badge {
  background: #e5e7eb;
  padding: 0.3rem 0.7rem;
  border-radius: 12px;
}

.wijzig-knop {
  position: absolute;
  right: 2.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: #fff;
  color: var(--rood);
  border: 2px solid var(--rood);
  border-radius: 2rem;
  padding: 0.5rem 1.5rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
  z-index: 2;
}

.wijzig-knop:hover {
  background: var(--rood);
  color: #fff;
}

.download-cv-btn {
  background: #b80000;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
}

.download-cv-btn:hover {
  background: #990000;
}

.header-info .domein {
  margin: 0.25rem 0 0.5rem;
  font-style: italic;
  opacity: 0.9;
}

.linkedin-link a {
  color: white;
  text-decoration: underline;
}
</style>
  