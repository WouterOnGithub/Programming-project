<template>
    <div class="dashboard-container">
      <aside class="sidebar-nav">
        <div class="sidebar-header same-height">
          <div class="sidebar-logo">
            <Building class="icoon" />
          </div>
          <div>
            <h1 class="sidebar-title">StudentMatch</h1>
            <p class="sidebar-subtitle">Bedrijfsdashboard</p>
          </div>
        </div>
        <nav class="sidebar-menu">
          <a
            v-for="item in navigation"
            :key="item.name"
            :href="item.href"
            class="sidebar-link"
            :data-actief="item.name === 'Gesprekken'"
          >
            {{ item.name }}

          </a>
        </nav>
        <div class="sidebar-user">
          <div class="sidebar-user-avatar">
            <User class="icoon" />
          </div>
          <div>
            <p class="sidebar-user-name">{{ userData?.companyName || 'Bedrijf' }}</p>
            <p class="sidebar-user-role">Recruiter</p>
          </div>
        </div>
      </aside>
  
      <main class="dashboard-main">
        <header class="dashboard-header same-height">
          <div class="header-info">
            <h1>Welkom terug, {{ userData?.companyName || 'Bedrijf' }}!</h1>
            <p>Overzicht van geplande gesprekken</p>
            <p class="event-date-note">
              <CalendarDays class="icoon" />
              Career Launch vindt plaats op <strong>24 oktober 2025</strong>.
            </p>
          </div>
          <div class="dashboard-header-actions">
            <div class="dashboard-profile-avatar">{{ userData?.companyName?.[0] || 'B' }}</div>
          </div>
        </header>
  
        <section class="dashboard-card">
          <h2 class="subtitel">Geplande Gesprekken</h2>
          <p class="aantal-studenten">
            Aantal studenten ingepland: <strong>{{ gesorteerdeGesprekken.length }}</strong>
          </p>
          <div v-if="gesorteerdeGesprekken.length === 0" class="geen-gegevens">
            <p class="tekst-groot">Geen gesprekken gepland</p>
            <p class="subtekst">Er zijn momenteel geen gesprekken ingepland</p>
          </div>
  
          <div v-else class="lijst">
            <div v-for="gesprek in gesorteerdeGesprekken" :key="gesprek.id" class="kaart">
              <div class="rij ruimte-tussen">
                <div class="flex-1">
                  <div class="rij ruimte mb">
                    <div class="tijd-label">
                      {{ gesprek.tijd }}
                    </div>
                    <h3 class="naam">{{ gesprek.student }}</h3>
                    <span class="duur">{{ gesprek.duur }}</span>
                  </div>
                  <div class="mb">
                    <span class="richting">Domein: {{ gesprek.domein }}</span>
                  </div>
                  <div class="mb">
                    <span class="richting">Studiejaar: {{ gesprek.studiejaar }}</span>
                  </div>
                  <div class="rij locatie">
                    <MapPin class="icoon" />
                    <span>{{ gesprek.locatie }}</span>
                  </div>
                </div>
                <div>
                  <button @click="annuleerGesprek(gesprek.id)" class="annuleerknop">Annuleren</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { CalendarDays, MapPin, Building, User } from 'lucide-vue-next'
  
  const navigation = [
    { name: 'Dashboard', href: '/bedrijf/dashboard' },
    { name: 'Favorieten', href: '/bedrijf/favorieten' },
    { name: 'Matches', href: '/bedrijfmatch'},
    { name: 'Gesprekken', href: '/bedrijf/gesprekken' },
    { name: 'Profiel', href: '/bedrijf/profiel' },
  ]
  
  const userData = ref({ companyName: 'Cronos' })
  
  const gesprekken = ref([
    { id: 1, student: 'Emma Janssen', domein: 'Toegepaste Informatica', studiejaar: '3e bachelor', tijd: '09:00', duur: '15 min', locatie: 'Aula 1' },
    { id: 2, student: 'Luca Van Der Berg', domein: 'Cyber Security', studiejaar: '2e bachelor', tijd: '14:30', duur: '15 min', locatie: 'Aula 2' },
    { id: 3, student: 'Sophie Martens', domein: 'Data Science', studiejaar: '1e master', tijd: '10:15', duur: '15 min', locatie: 'Aula 3' }
  ])
  
  const gesorteerdeGesprekken = computed(() =>
    gesprekken.value.sort((a, b) => a.tijd.localeCompare(b.tijd))
  )
  
  const annuleerGesprek = (id) => {
    const student = gesprekken.value.find(g => g.id === id)?.student
    console.log(`Automatische mail verzonden naar ${student} over annulering.`)
    gesprekken.value = gesprekken.value.filter(g => g.id !== id)
  }
  </script>
  
  <style scoped>
  .dashboard-container {
    display: flex;
    min-height: 100vh;
    background: #f8f9fa;
    gap: 1rem;
  }
  
  .same-height {
    min-height: 6.5rem;
    display: flex;
    align-items: center;
  }
  
  .dashboard-main {
    flex: 1;
    display: flex;
    flex-direction: column;
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
    justify-content: space-between;
    padding: 0.6rem 1rem;
    border-radius: 0.5rem;
    color: #6b7280;
    text-decoration: none;
    font-weight: 500;
    transition: background 0.2s, color 0.2s;
  }
  
  .sidebar-link[data-actief="true"] {
    background: #e5e7eb;
    color: #c20000;
    font-weight: bold;
    border-left: 4px solid #c20000;
    padding-left: 0.75rem;
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
    background: #fff;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07);
    padding: 1.5rem;
    margin: 2rem;
  }
  
  .subtitel {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 1rem;
  }
  
  .aantal-studenten {
    font-size: 0.95rem;
    color: #374151;
    margin-bottom: 1rem;
  }
  
  .geen-gegevens {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
  }
  
  .lijst {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .kaart {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    padding: 1.25rem;
  }
  
  .rij {
    display: flex;
    align-items: center;
  }
  
  .ruimte {
    gap: 0.75rem;
  }
  
  .ruimte-tussen {
    justify-content: space-between;
  }
  
  .flex-1 {
    flex: 1;
  }
  
  .mb {
    margin-bottom: 0.5rem;
  }
  
  .tijd-label {
    display: flex;
    align-items: center;
    font-weight: 500;
    color: #111827;
    background: #f3f4f6;
    padding: 0.25rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
  }
  
  .naam {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }
  
  .duur {
    font-size: 0.875rem;
    color: #6b7280;
    background: #f3f4f6;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
  }
  
  .richting {
    font-size: 0.875rem;
    font-weight: 500;
    color: #dc2626;
  }
  
  .locatie {
    gap: 0.4rem;
    color: #6b7280;
    font-size: 0.875rem;
  }
  
  .annuleerknop {
    background: #dc2626;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;
  }
  
  .annuleerknop:hover {
    background: #b91c1c;
  }
  
  .event-date-note {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: #374151;
    display: flex;
    align-items: center;
  }
  </style>
  