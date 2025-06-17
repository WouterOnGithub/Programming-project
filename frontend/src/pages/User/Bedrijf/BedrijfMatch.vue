<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <aside class="sidebar-nav">
      <div class="sidebar-header same-height">
        <div class="sidebar-logo">
          <User class="icoon" />
        </div>
        <div>
          <h1 class="sidebar-title">BedrijfMatch</h1>
          <p class="sidebar-subtitle">Bedrijvendashboard</p>
        </div>
      </div>
      <nav class="sidebar-menu">
        <a
          v-for="item in navigation"
          :key="item.name"
          :href="item.href"
          class="sidebar-link"
          :data-actief="item.name === 'Matches'"
        >
          {{ item.name }}
        </a>
      </nav>
      <div class="sidebar-user">
        <div class="sidebar-user-avatar">
          <Building class="icoon" />
        </div>
        <div>
          <p class="sidebar-user-name">{{ bedrijfData?.bedrijfName || 'Bedrijf' }}</p>
          <p class="sidebar-user-role">Bedrijf</p>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="dashboard-main">
      <header class="dashboard-header same-height">
        <div class="header-info">
          <h1>Welkom terug, {{ bedrijfData?.bedrijfName || 'Bedrijf' }}!</h1>
          <p>Overzicht van je matches</p>
        </div>
        <div class="dashboard-header-actions">
          <div class="dashboard-profile-avatar">{{ bedrijfData?.bedrijfName?.[0] || 'B' }}</div>
        </div>
      </header>

      <section class="pagina">
        <div class="hoofding">
          <div class="hoofding-links">
            <div class="icoon-container">
              <Heart :size="24" color="white" />
            </div>
            <div>
              <h1 class="titel">Match studenten</h1>
              <p class="subtekst">{{ matchStudenten.length }} matches gevonden</p>
            </div>
          </div>
        </div>

        <div class="zoekbalk-container">
          <Search class="zoek-icoon" :size="16" />
          <input
            type="text"
            class="zoekveld"
            placeholder="Zoek op naam, richting of locatie..."
            v-model="zoekterm"
          />
        </div>

        <div class="statistieken">
          <div>
            <div class="stat-value">{{ matchStudenten.length }}</div>
            <div class="stat-label">Totaal</div>
          </div>
          <div>
            <div class="stat-value rood">{{ gefilterdeStudenten.length }}</div>
            <div class="stat-label">Resultaten</div>
          </div>
        </div>

        <div class="studentenlijst">
          <div class="lijst-hoofding">
            <h2>Overzicht Matchs</h2>
            <p>Klik op een student voor profiel of gesprek</p>
          </div>

          <div
            class="student-kaart"
            v-for="student in gefilterdeStudenten"
            :key="student.id"
          >
            <div class="student-info">
              <div class="avatar">{{ student.afkorting }}</div>
              <div>
                <h3>{{ student.naam }}</h3>
                <p class="richting">{{ student.richting }} – {{ student.locatie }}</p>
              </div>
            </div>
            <div class="acties">
              <button class="knop-grijs" @click="toonProfiel(student.id)">
                <User :size="14" />
                <span>Profiel</span>
              </button>
              <button class="knop-rood" @click="planAfspraak(student.id)">
                <Calendar :size="14" />
                <span>Gesprek</span>
              </button>
            </div>
          </div>

          <div v-if="gefilterdeStudenten.length === 0" class="geen-resultaten">
            <div class="emoji">🔍</div>
            <h3>Geen studenten gevonden</h3>
            <p>Probeer een andere zoekterm.</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Heart, Calendar, User, Search, Building } from 'lucide-vue-next'

const bedrijfData = ref({ bedrijfName: 'Cronos' })

const navigation = [
  { name: 'Dashboard', href: '/bedrijf/dashboard' },
  { name: 'Favorieten', href: '/bedrijf/favorieten' },
  { name: 'Matches', href: '/bedrijf/matches' },
  { name: 'Gesprekken', href: '/bedrijf/gesprekken' },
  { name: 'Profiel', href: '/bedrijf/profiel' },
]

// Liste des étudiants matchés (exemple)
const matchStudenten = ref([
  { id: 1, naam: 'Alice Dupont', richting: 'Informatica', afkorting: 'AD', locatie: 'Brussel' },
  { id: 2, naam: 'Benoit Janssens', richting: 'Marketing', afkorting: 'BJ', locatie: 'Gent' },
  { id: 3, naam: 'Chloé Peeters', richting: 'Design', afkorting: 'CP', locatie: 'Antwerpen' },
  { id: 4, naam: 'David Leroy', richting: 'Finance', afkorting: 'DL', locatie: 'Brussel' },
  { id: 5, naam: 'Emma Dubois', richting: 'Biotech', afkorting: 'ED', locatie: 'Leuven' },
  { id: 6, naam: 'Fatima El Amrani', richting: 'Informatica', afkorting: 'FE', locatie: 'Brussel' },
  { id: 7, naam: 'Gianni Rossi', richting: 'Logistiek', afkorting: 'GR', locatie: 'Mechelen' },
  { id: 8, naam: 'Hélène Martin', richting: 'UX/UI', afkorting: 'HM', locatie: 'Brussel' }
])

const zoekterm = ref('')

const gefilterdeStudenten = computed(() =>
  matchStudenten.value.filter((student) =>
    student.naam.toLowerCase().includes(zoekterm.value.toLowerCase()) ||
    student.richting.toLowerCase().includes(zoekterm.value.toLowerCase()) ||
    student.locatie.toLowerCase().includes(zoekterm.value.toLowerCase())
  )
)

const toonProfiel = (id) => {
  console.log(`Bekijk profiel van student ${id}`)
}

const planAfspraak = (id) => {
  console.log(`Plan afspraak met student ${id}`)
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

/* --- SIDEBAR --- */
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

/* --- HEADER --- */
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

/* --- SOLLICITATIES PAGINA --- */
.pagina {
  background-color: #f9fafb;
  padding: 2rem;
  font-family: sans-serif;
}

.hoofding {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.hoofding-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icoon-container {
  background-color: #dc2626;
  padding: 0.75rem;
  border-radius: 0.75rem;
}

.titel {
  font-size: 1.5rem;
  margin: 0;
}

.subtekst {
  color: #6b7280;
  font-size: 0.875rem;
}

.zoekbalk-container {
  position: relative;
  margin-bottom: 1.5rem;
}

.zoek-icoon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.zoekveld {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.statistieken {
  display: flex;
  justify-content: center;
  gap: 2rem;
  background: white;
  border-radius: 1rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
}

.rood {
  color: #dc2626;
}

.stat-label {
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.studentenlijst {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.lijst-hoofding {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.student-kaart {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f3f4f6;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  background-color: #dc2626;
  color: white;
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.125rem;
}

.richting {
  color: #dc2626;
  font-weight: 500;
}

.acties {
  display: flex;
  gap: 0.5rem;
}

.knop-grijs {
  background-color: #f3f4f6;
  color: #374151;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
}

.knop-grijs:hover {
  background-color: #e5e7eb;
}

.knop-rood {
  background-color: #dc2626;
  color: white;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
}

.knop-rood:hover {
  background-color: #b91c1c;
}

.geen-resultaten {
  text-align: center;
  padding: 4rem 2rem;
}

.emoji {
  font-size: 3rem;
  margin-bottom: 1rem;
}
</style>
