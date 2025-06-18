<template>
  <BedrijfDashboardLayout>
    <main class="dashboard-main">
      <header class="dashboard-header same-height">
        <div class="header-info">
          <h1>Welkom terug, {{ userData?.companyName || 'Bedrijf' }}!</h1>
          <p>Overzicht van favorieten</p>
        </div>
        <div class="dashboard-header-actions">
          <div class="dashboard-profile-avatar">{{ userData?.companyName?.[0] || 'B' }}</div>
        </div>
      </header>
      <section class="pagina">
        <div class="hoofding">
          <div class="hoofding-links">
            <div class="icoon-container">
              <Heart :size="24" color="white" />
            </div>
            <div>
              <h1 class="titel">Favorieten</h1>
              <p class="subtekst">{{ studenten.length }} favorieten ontvangen</p>
            </div>
          </div>
        </div>
        <div class="zoekbalk-container">
          <Search class="zoek-icoon" :size="16" />
          <input
            type="text"
            class="zoekveld"
            placeholder="Zoek op naam, richting of studiejaar..."
            v-model="zoekterm"
          />
        </div>
        <div class="statistieken">
          <div>
            <div class="stat-value">{{ studenten.length }}</div>
            <div class="stat-label">Totaal</div>
          </div>
          <div>
            <div class="stat-value rood">{{ gefilterdeStudenten.length }}</div>
            <div class="stat-label">Resultaten</div>
          </div>
        </div>
        <div class="studentenlijst">
          <div class="lijst-hoofding">
            <h2>Overzicht Favorieten</h2>
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
                <p class="richting">{{ student.richting }} – {{ student.studiejaar }}</p>
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
              <button class="knop-verwijder" @click="openConfirm(student.id)">
                <span>Verwijder</span>
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
      <div v-if="showConfirm" class="modal-overlay">
        <div class="modal">
          <p>Weet je zeker dat je deze favoriet wilt verwijderen?</p>
          <div class="modal-actions">
            <button class="knop-ja" @click="verwijderFavoriet(favorietToDelete)">Ja</button>
            <button class="knop-nee" @click="showConfirm = false">Nee</button>
          </div>
        </div>
      </div>
    </main>
  </BedrijfDashboardLayout>
</template>
  
<script setup>
import { ref, computed } from 'vue'
import { Heart, Calendar, User, Search, Building } from 'lucide-vue-next'
import BedrijfDashboardLayout from '../../../components/BedrijfDashboardLayout.vue'

const userData = ref({ companyName: 'Cronos' })

const navigation = [
  { name: 'Dashboard', href: '/bedrijf/dashboard' },
  { name: 'Favorieten', href: '/bedrijf/favorieten' },
  { name: 'Gesprekken', href: '/GesprekkenBd' },
  { name: 'Profiel', href: '/bedrijf/profiel' },
]

const studenten = ref([
  { id: 1, naam: 'Emma Janssen', richting: 'Toegepaste Informatica', afkorting: 'EJ', studiejaar: '3e jaar' },
  { id: 2, naam: 'Luca Van Der Berg', richting: 'Cyber Security', afkorting: 'LV', studiejaar: '2e jaar' },
  { id: 3, naam: 'Sophie Martens', richting: 'Data Science', afkorting: 'SM', studiejaar: '3e jaar' },
  { id: 4, naam: 'Maxim Peeters', richting: 'Multimedia & Creative Technologies', afkorting: 'MP', studiejaar: '1e jaar' },
  { id: 5, naam: 'Lisa Chen', richting: 'Business Management', afkorting: 'LC', studiejaar: '2e jaar' },
  { id: 6, naam: 'Thomas De Vries', richting: 'Elektromechanica', afkorting: 'TD', studiejaar: '3e jaar' },
  { id: 7, naam: 'Nina Willems', richting: 'Toegepaste Informatica', afkorting: 'NW', studiejaar: '2e jaar' },
  { id: 8, naam: 'Jasper Mertens', richting: 'Cyber Security', afkorting: 'JM', studiejaar: '1e jaar' }
])

const zoekterm = ref('')

const gefilterdeStudenten = computed(() =>
  studenten.value.filter((student) =>
    student.naam.toLowerCase().includes(zoekterm.value.toLowerCase()) ||
    student.richting.toLowerCase().includes(zoekterm.value.toLowerCase()) ||
    student.studiejaar.toLowerCase().includes(zoekterm.value.toLowerCase())
  )
)

const toonProfiel = (id) => {
  console.log(`Bekijk profiel van student ${id}`)
}

const planAfspraak = (id) => {
  console.log(`Plan afspraak met student ${id}`)
}

const showConfirm = ref(false)
const favorietToDelete = ref(null)
const openConfirm = (id) => {
  favorietToDelete.value = id
  showConfirm.value = true
}
const verwijderFavoriet = (id) => {
  studenten.value = studenten.value.filter(s => s.id !== id)
  showConfirm.value = false
  favorietToDelete.value = null
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

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  border-radius: 1rem;
  padding: 2rem 2.5rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  text-align: center;
  min-width: 300px;
}
.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}
.knop-ja {
  background: #dc2626;
  color: #fff;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.knop-ja:hover {
  background: #b91c1c;
}
.knop-nee {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.knop-nee:hover {
  background: #e5e7eb;
}
.knop-verwijder {
  background-color: #fff;
  color: #dc2626;
  border: 1px solid #dc2626;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.knop-verwijder:hover {
  background-color: #ffeaea;
}
</style>
  
  