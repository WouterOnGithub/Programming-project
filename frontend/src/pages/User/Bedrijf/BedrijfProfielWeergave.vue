<template>
  <BedrijfDashboardLayout>
    <main class="dashboard-main">
      <header class="dashboard-header">
        <div>
          <h1>Welkom terug, {{ userData.companyName }}!</h1>
          <p>Profieloverzicht van je bedrijf</p>
        </div>
        <div class="dashboard-header-actions">
          <div class="dashboard-profile-avatar">
            {{ userData.companyName[0] }}
          </div>
        </div>
      </header>
      <section class="dashboard-card">
        <div class="hero-banner">
          <div class="hero-photo">
            <img :src="bedrijf.fotoPreview || profielfoto" alt="Bedrijfslogo" />
          </div>
          <div class="hero-text">
            <h1>{{ bedrijf.naam }}</h1>
            <p>{{ bedrijf.locatie }}</p>
          </div>
          <router-link to="/WijzigBd" class="wijzig-knop">Wijzig</router-link>
        </div>
        <div class="section-card">
          <h2>Over ons</h2>
          <p class="intro-text">{{ bedrijf.beschrijving }}</p>
        </div>
        <div class="section-card">
          <h2>Informatie</h2>
          <ul class="info-list">
            <li><strong>Op zoek naar:</strong> {{ bedrijf.zoekprofiel }}</li>
            <li><strong>Gesprek duurt:</strong> {{ bedrijf.gesprekDuur }}</li>
            <li><strong>Aanwezig van:</strong> {{ bedrijf.startuur }} tot {{ bedrijf.einduur }}</li>
            <li><strong>Locatie stand:</strong> {{ bedrijf.locatie }}</li>
            <li>
              <strong>LinkedIn:</strong>
              <a :href="bedrijf.linkedin" target="_blank">Bekijk profiel</a>
            </li>
          </ul>
        </div>
      </section>
    </main>
  </BedrijfDashboardLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import profielfoto from '/Images/profielfoto.jpg'
import BedrijfDashboardLayout from '../../../components/BedrijfDashboardLayout.vue'

const $route = useRoute()

const userData = ref({
  companyName: 'Cronos'
})

const navigation = [
  { name: 'Dashboard', href: '/bedrijf/dashboard', icon: 'fas fa-chart-pie' },
  { name: 'Favorieten', href: '/bedrijf/favorieten', icon: 'fas fa-envelope' },
  { name: 'Gesprekken', href: '/GesprekkenBd', icon: 'fas fa-calendar' },
  { name: 'Profiel', href: '/bedrijf/profiel', icon: 'fas fa-user' }
]

const bedrijf = ref({
  naam: 'CoolCompany',
  locatie: 'Hal 3 – Stand 14',
  startuur: '13:00',
  einduur: '15:30',
  zoekprofiel: 'IT-studenten',
  linkedin: 'https://www.linkedin.com/company/coolcompany',
  gesprekDuur: '20 minuten',
  beschrijving: 'Wij zijn een innovatief bedrijf dat jong talent ondersteunt.',
  fotoPreview: null
})
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
</style>
  