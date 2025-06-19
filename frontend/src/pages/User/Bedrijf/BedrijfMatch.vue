<template>
  <BedrijfDashboardLayout>
    <main class="dashboard-main">
      <section class="pagina">
        <div style="color: #b80000; font-weight: bold; margin-bottom: 1rem;">Hier zoekt de pagina naar echte match-data uit Firestore (studenten die interesse hebben in jouw bedrijf).</div>
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
              <button class="knop-rood" @click="accepteerStudent(student.swipeDocId)">
                <Calendar :size="14" />
                <span>Gesprek</span>
              </button>
              <button class="knop-verwijder" @click="weigerStudent(student.swipeDocId)">
                <span>Weigeren</span>
              </button>
              <button class="knop-verwijder" @click="weigerStudent(student.swipeDocId)">
                <span>Weigeren</span>
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
  </BedrijfDashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Heart, Calendar, User, Search, Building } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import BedrijfDashboardLayout from '../../../components/BedrijfDashboardLayout.vue'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore'

const db = getFirestore();
const auth = getAuth();
const router = useRouter()
const matchStudenten = ref([])
const zoekterm = ref('')

console.log('BedrijfMatch component geladen');

onMounted(async () => {
  console.log('auth.currentUser:', auth.currentUser);
  let bedrijfId = auth.currentUser?.uid;
  let bedrijfEmail = auth.currentUser?.email;
  console.log('bedrijfId:', bedrijfId);
  if (!bedrijfId) {
    await new Promise(resolve => {
      const unsub = auth.onAuthStateChanged(user => {
        bedrijfId = user?.uid;
        bedrijfEmail = user?.email;
        unsub();
        resolve();
      });
    });
    console.log('bedrijfId na onAuthStateChanged:', bedrijfId);
  }
  if (!bedrijfId) return;
  console.debug('Ingelogde bedrijfUid:', bedrijfId);
  // Haal alle swipes op dit bedrijf met status 'interessant'
  const swipesSnap = await getDocs(collection(db, 'student_swipes'));
  console.log('Alle swipes:', swipesSnap.docs.map(d => d.data()));
  let relevanteSwipes = swipesSnap.docs
    .map(docu => ({ id: docu.id, ...docu.data() }))
    .filter(d => (d.bedrijfUid === bedrijfId || d.authUid === bedrijfId) && d.status === 'interessant');
  // Alternatieve zoekmethode: zoek op email als er geen matches zijn
  if (relevanteSwipes.length === 0 && bedrijfEmail) {
    relevanteSwipes = swipesSnap.docs
      .map(docu => ({ id: docu.id, ...docu.data() }))
      .filter(d => d.bedrijfEmail === bedrijfEmail && d.status === 'interessant');
    if (relevanteSwipes.length > 0) {
      console.debug('Matches gevonden via email:', relevanteSwipes);
    }
  }
  console.debug('Relevante swipes:', relevanteSwipes);
  // Haal studenten op
  const studentenSnap = await getDocs(collection(db, 'student'));
  const studentenMap = {};
  studentenSnap.forEach(docu => { studentenMap[docu.id] = docu.data(); });
  console.debug('StudentenMap:', studentenMap);
  matchStudenten.value = relevanteSwipes.map(swipe => {
    const student = studentenMap[swipe.studentUid] || {};
    return {
      id: swipe.studentUid,
      naam: (student.voornaam || 'Onbekend') + ' ' + (student.achternaam || ''),
      richting: student.domein ? (Array.isArray(student.domein) ? student.domein.join(', ') : student.domein) : '-',
      afkorting: ((student.voornaam || '?')[0] + (student.achternaam || '?')[0]).toUpperCase(),
      locatie: student.locatie || '-',
      swipeDocId: swipe.id
    };
  });
  console.debug('Matchende studenten:', matchStudenten.value);
});

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

const showVerwijderPopup = ref(false)
const teVerwijderenStudentId = ref(null)

const openVerwijderPopup = (id) => {
  teVerwijderenStudentId.value = id
  showVerwijderPopup.value = true
}

const bevestigVerwijderen = () => {
  matchStudenten.value = matchStudenten.value.filter(student => student.id !== teVerwijderenStudentId.value)
  showVerwijderPopup.value = false
  teVerwijderenStudentId.value = null
}

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
  background: #fff;
  border-radius: 1.25rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 2rem 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 1.5rem;
}

.student-kaart {
  background: #f8f9fa;
  border-radius: 1rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  padding: 1.5rem 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: 1.5px solid #f3f4f6;
  transition: box-shadow 0.15s, border-color 0.15s;
}
.student-kaart:hover {
  box-shadow: 0 4px 16px rgba(220,38,38,0.10);
  border-color: #ffeaea;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 1rem;
}
.avatar {
  background: #c20000;
  color: white;
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.student-info h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #c20000;
}
.student-info .richting {
  color: #b91c1c;
  font-weight: 500;
  font-size: 0.98rem;
}
.acties {
  display: flex;
  gap: 0.7rem;
  margin-top: 0.3rem;
}
.knop-grijs {
  background: #f3f4f6;
  color: #222;
  border: none;
  padding: 0.55rem 1.2rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
  box-shadow: none;
}
.knop-grijs svg {
  color: #222;
}
.knop-grijs:hover {
  background: #e5e7eb;
}

.knop-rood {
  background: #dc2626;
  color: #fff;
  border: none;
  padding: 0.55rem 1.2rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
  box-shadow: none;
}
.knop-rood svg {
  color: #fff;
}
.knop-rood:hover {
  background: #b91c1c;
}

.lijst-hoofding {
  grid-column: 1/-1;
  padding-bottom: 1.2rem;
  border-bottom: 1.5px solid #f3f4f6;
  margin-bottom: 1.2rem;
}

.geen-resultaten {
  grid-column: 1/-1;
  text-align: center;
  padding: 3rem 1.5rem;
}

.emoji {
  font-size: 3rem;
  margin-bottom: 1rem;
}
</style>
