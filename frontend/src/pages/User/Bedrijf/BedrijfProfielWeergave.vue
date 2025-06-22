<template>
  <BedrijfDashboardLayout>
    <main class="dashboard-main">
      <section class="dashboard-card">
        <div v-if="loading">Laden...</div>
        <div v-else-if="error" style="color: #b80000;">{{ error }}</div>
        <div v-else-if="bedrijf">
          <div class="hero-banner">
            <div class="hero-photo">
              <img :src="bedrijf.foto || profielfoto" alt="Bedrijfslogo" />
            </div>
            <div class="hero-text">
              <h1>{{ bedrijf.bedrijfsnaam || 'Bedrijfsnaam' }}</h1>
              <p>{{ bedrijf.gesitueerdIn || '-' }}</p>
            </div>
            <router-link to="/WijzigBd" class="wijzig-knop">Wijzig</router-link>
          </div>
          <div class="section-card">
            <h2>Over ons</h2>
            <p class="intro-text">{{ bedrijf.overOns || 'Geen informatie beschikbaar.' }}</p>
          </div>
          <div class="section-card">
            <h2>Informatie</h2>
            <ul class="info-list">
              <li><strong>Op zoek naar:</strong> {{ Array.isArray(bedrijf.opZoekNaar) ? bedrijf.opZoekNaar.join(', ') : bedrijf.opZoekNaar || '-' }}</li>
              <li><strong>Gesprek duurt:</strong> {{ bedrijf.gesprekDuur || '-' }}</li>
              <li><strong>Aanwezig van:</strong> {{ bedrijf.starttijd || '-' }} tot {{ bedrijf.eindtijd || '-' }}</li>
              <li><strong>Locatie stand:</strong> {{ bedrijf.gesitueerdIn || '-' }}</li>
              <li>
                <strong>LinkedIn:</strong>
                <a v-if="bedrijf.linkedin" :href="bedrijf.linkedin" target="_blank">Bekijk profiel</a>
                <span v-else>-</span>
              </li>
            </ul>
          </div>
          <div class="section-card">
            <h2>Contactinformatie</h2>
            <ul class="info-list">
              <li><strong>E-mail:</strong> {{ bedrijf.email || '-' }}</li>
              <li><strong>Website:</strong> {{ bedrijf.website || '-' }}</li>
              <li><strong>Telefoonnummer:</strong> {{ bedrijf.telefoonnummer || '-' }}</li>
            </ul>
          </div>
          <div class="section-card">
            <h2>Bedrijfsdetails</h2>
            <ul class="info-list">
              <li><strong>Branche:</strong> {{ bedrijf.branche || '-' }}</li>
              <li><strong>Bedrijfsgrootte:</strong> {{ bedrijf.bedrijfsgrootte || '-' }}</li>
              <li><strong>Opgericht in:</strong> {{ bedrijf.opgerichtIn || '-' }}</li>
            </ul>
          </div>
        </div>
        <div v-else>
          Geen bedrijfsgegevens gevonden.
        </div>
      </section>
    </main>
  </BedrijfDashboardLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'
import profielfoto from '/Images/profielfoto.jpg'
import BedrijfDashboardLayout from '../../../components/BedrijfDashboardLayout.vue'

const router = useRouter()
const showDropdown = ref(false)
const bedrijf = ref(null)
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
    const q = query(collection(db, 'bedrijf'), where('authUid', '==', user.uid))
    const snapshot = await getDocs(q)
    if (!snapshot.empty) {
      bedrijf.value = snapshot.docs[0].data()
    } else {
      error.value = 'Geen bedrijfsprofiel gevonden.'
    }
  } catch (e) {
    error.value = 'Fout bij ophalen bedrijfsprofiel.'
  } finally {
    loading.value = false
  }
})

const navigation = [
  { name: 'Dashboard', href: '/bedrijf/dashboard', icon: 'fas fa-chart-pie' },
  { name: 'Favorieten', href: '/bedrijf/favorieten', icon: 'fas fa-envelope' },
  { name: 'Gesprekken', href: '/GesprekkenBd', icon: 'fas fa-calendar' },
  { name: 'Profiel', href: '/bedrijf/profiel', icon: 'fas fa-user' }
]

function handleAvatarClick() {
  showDropdown.value = !showDropdown.value
}

function handleLogout() {
  router.push('/')
}

function handleClickOutside(event) {
  const dropdown = document.getElementById('bedrijf-profile-dropdown')
  const avatar = document.getElementById('bedrijf-profile-avatar')
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
  font-family: 'Segoe UI', sans-serif;
  background: #f5f5f7;
  min-height: 100vh;
}

/* Sidebar */
.sidebar-nav {
  width: 16rem;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.sidebar-top,
.sidebar-bottom {
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 1rem 1rem;
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
  transition: background 0.3s ease, color 0.3s ease, transform 0.2s ease;
  position: relative;
}

.sidebar-link:hover {
  background-color: #f9e7e7;
  color: #c20000;
  transform: translateX(4px);
}

.sidebar-link.active {
  background-color: #fff;
  color: #c20000;
  font-weight: bold;
  position: relative;
}

.sidebar-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background-color: #c20000;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-user {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
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

/* Main */
.dashboard-main {
  flex: 1;
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

.dashboard-card {
  padding: 2rem;
}

.hero-banner {
  display: flex;
  gap: 2rem;
  align-items: center;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #fafafa, #fff1f1);
  border-radius: 24px;
  padding: 2rem 3rem;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
  position: relative;
}

.hero-photo img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #c20000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.hero-text h1 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  color: #111827;
}

.hero-text p {
  color: #6b7280;
  font-size: 0.95rem;
}

.section-card {
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07);
  padding: 2rem;
  margin-top: 2rem;
  border-left: 4px solid #c20000;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.section-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.section-card h2 {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
  color: #c20000;
  border-bottom: 1px dashed #e0e0e0;
  padding-bottom: 0.5rem;
}

.intro-text {
  background: #fff3f3;
  padding: 1rem 1.2rem;
  border-left: 4px solid #c20000;
  border-radius: 10px;
  font-size: 1rem;
  line-height: 1.5;
  color: #374151;
  margin-top: 0.5rem;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  color: #374151;
  font-size: 0.95rem;
}

.info-list li {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px dashed #dcdce0;
  padding-bottom: 0.4rem;
}

.info-list a {
  color: #c20000;
  text-decoration: underline;
}

.wijzig-knop {
  position: absolute;
  right: 2.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: #fff;
  color: #c20000;
  border: 2px solid #c20000;
  border-radius: 2rem;
  padding: 0.5rem 1.5rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
  z-index: 2;
}

.wijzig-knop:hover {
  background: #c20000;
  color: #fff;
}

.contactinfo-fields {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.contactinfo-field label {
  display: block;
  font-size: 1.08rem;
  color: #222;
  margin-bottom: 0.5rem;
}

.contactinfo-field input {
  width: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.7rem;
  background: #fff;
  font-size: 1.08rem;
  color: #444;
  margin-bottom: 0.2rem;
  outline: none;
}

.contactinfo-field select {
  width: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.7rem;
  background: #fff;
  font-size: 1.08rem;
  color: #444;
  margin-bottom: 0.2rem;
  outline: none;
}

.contactinfo-field select:disabled {
  background: #fff;
  color: #444;
  opacity: 1;
  cursor: not-allowed;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .dashboard-card {
    padding: 1rem;
  }

  .hero-banner {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .hero-photo img {
    width: 100px;
    height: 100px;
  }

  .hero-text h1 {
    font-size: 1.3rem;
  }

  .wijzig-knop {
    position: static;
    transform: none;
    margin-top: 1rem;
    align-self: center;
  }

  .section-card {
    padding: 1.5rem;
    margin-top: 1.5rem;
  }

  .section-card h2 {
    font-size: 1.2rem;
  }

  .info-list li {
    flex-direction: column;
    gap: 0.3rem;
    align-items: flex-start;
  }

  .info-list li strong {
    font-weight: 600;
    color: #c20000;
  }

  .intro-text {
    padding: 0.8rem 1rem;
    font-size: 0.95rem;
  }
}
</style>
  