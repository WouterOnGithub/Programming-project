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
            <button class="verwijder-kruis" @click="openVerwijderPopup(student.id)" title="Verwijderen">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <div class="student-info">
              <div class="avatar">{{ student.afkorting }}</div>
              <div>
                <h3>{{ student.naam }}</h3>
                <p class="richting">{{ Array.isArray(student.richting) ? student.richting.join(', ') : student.richting }} – {{ student.locatie }}</p>
              </div>
            </div>
            <div class="acties">
              <button class="knop-grijs" @click="toonProfiel(student.id)">
                <User :size="14" />
                <span>Profiel</span>
              </button>
              <button class="knop-rood" @click="accepteerStudent(student.swipeDocId, student.id)">
                <Calendar :size="14" />
                <span>Accepteren</span>
              </button>
            </div>
          </div>
          <div v-if="gefilterdeStudenten.length === 0" class="geen-resultaten">
            <div class="emoji">🔍</div>
            <h3>Geen studenten gevonden</h3>
            <p>Probeer een andere zoekterm.</p>
          </div>
        </div>
        
        <div v-if="showVerwijderPopup" class="popup-overlay">
          <div class="popup-modal">
            <h3>Student verwijderen</h3>
            <p>Weet je zeker dat je deze student wilt verwijderen?</p>
            <div class="popup-buttons">
              <button class="popup-cancel" @click="showVerwijderPopup = false">Annuleren</button>
              <button class="popup-confirm" @click="bevestigVerwijderen">Verwijderen</button>
            </div>
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
  // Haal alle studenten op
  const studentenSnap = await getDocs(collection(db, 'student'));
  const studentenMap = {};
  studentenSnap.forEach(docu => { studentenMap[docu.id] = docu.data(); });
  let relevanteSwipes = [];
  for (const studentId of Object.keys(studentenMap)) {
    // Haal swipes uit subcollectie van student
    const swipesSnap = await getDocs(collection(db, 'student', studentId, 'swipes'));
    relevanteSwipes.push(...swipesSnap.docs
      .map(docu => ({ id: docu.id, ...docu.data(), studentUid: studentId }))
      .filter(d => (d.bedrijfUid === bedrijfId || d.authUid === bedrijfId) && d.status === 'interessant'));
  }
  if (relevanteSwipes.length === 0 && bedrijfEmail) {
    for (const studentId of Object.keys(studentenMap)) {
      const swipesSnap = await getDocs(collection(db, 'student', studentId, 'swipes'));
      relevanteSwipes.push(...swipesSnap.docs
        .map(docu => ({ id: docu.id, ...docu.data(), studentUid: studentId }))
        .filter(d => d.bedrijfEmail === bedrijfEmail && d.status === 'interessant'));
    }
  }
  console.debug('Relevante swipes:', relevanteSwipes);
  // Haal studenten op
  matchStudenten.value = relevanteSwipes.map(swipe => {
    const student = studentenMap[swipe.studentUid] || {};
    let richting = '-';
    if (student.domein) {
      richting = Array.isArray(student.domein) ? student.domein.join(', ') : student.domein;
    }
    return {
      id: swipe.studentUid,
      naam: (student.voornaam || 'Onbekend') + ' ' + (student.achternaam || ''),
      richting,
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

const accepteerStudent = async (swipeDocId, studentId) => {
  // Zet status op 'geaccepteerd' in student/{studentId}/swipes
  await updateDoc(doc(db, 'student', studentId, 'swipes', swipeDocId), { status: 'geaccepteerd' });
  // Herlaad matches zodat de student verdwijnt uit de lijst
  await reloadMatches();
}

async function reloadMatches() {
  let bedrijfId = auth.currentUser?.uid;
  let bedrijfEmail = auth.currentUser?.email;
  if (!bedrijfId) {
    await new Promise(resolve => {
      const unsub = auth.onAuthStateChanged(user => {
        bedrijfId = user?.uid;
        bedrijfEmail = user?.email;
        unsub();
        resolve();
      });
    });
  }
  if (!bedrijfId) return;
  const studentenSnap = await getDocs(collection(db, 'student'));
  const studentenMap = {};
  studentenSnap.forEach(docu => { studentenMap[docu.id] = docu.data(); });
  let relevanteSwipes = [];
  for (const studentId of Object.keys(studentenMap)) {
    // Haal swipes uit subcollectie van student
    const swipesSnap = await getDocs(collection(db, 'student', studentId, 'swipes'));
    relevanteSwipes.push(...swipesSnap.docs
      .map(docu => ({ id: docu.id, ...docu.data(), studentUid: studentId }))
      .filter(d => (d.bedrijfUid === bedrijfId || d.authUid === bedrijfId) && d.status === 'interessant'));
  }
  if (relevanteSwipes.length === 0 && bedrijfEmail) {
    for (const studentId of Object.keys(studentenMap)) {
      const swipesSnap = await getDocs(collection(db, 'student', studentId, 'swipes'));
      relevanteSwipes.push(...swipesSnap.docs
        .map(docu => ({ id: docu.id, ...docu.data(), studentUid: studentId }))
        .filter(d => d.bedrijfEmail === bedrijfEmail && d.status === 'interessant'));
    }
  }
  matchStudenten.value = relevanteSwipes.map(swipe => {
    const student = studentenMap[swipe.studentUid] || {};
    let richting = '-';
    if (student.domein) {
      richting = Array.isArray(student.domein) ? student.domein.join(', ') : student.domein;
    }
    return {
      id: swipe.studentUid,
      naam: (student.voornaam || 'Onbekend') + ' ' + (student.achternaam || ''),
      richting,
      afkorting: ((student.voornaam || '?')[0] + (student.achternaam || '?')[0]).toUpperCase(),
      locatie: student.locatie || '-',
      swipeDocId: swipe.id
    };
  });
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
  position: relative;
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
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}
.knop-grijs {
  background: #f3f4f6;
  color: #222;
  border: none;
  padding: 0.5rem 1.1rem;
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
  padding: 0.5rem 1.1rem;
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
  background: #a10000;
}

.verwijder-kruis {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #fff;
  border: 1.5px solid #c20000;
  color: #c20000;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border 0.15s;
  z-index: 2;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.verwijder-kruis svg {
  color: #c20000;
}
.verwijder-kruis:hover {
  background: #ffeaea;
  color: #a10000;
  border-color: #a10000;
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

@media (max-width: 768px) {
  .pagina {
    padding: 1rem;
    background-color: #f8f9fa;
  }

  .hoofding, .zoekbalk-container, .statistieken, .studentenlijst {
    background: #fff;
    border-radius: 12px;
    padding: 1.25rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    margin-bottom: 1rem;
  }
  
  .hoofding {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }

  .hoofding-links .titel {
    font-size: 1.2rem;
    margin: 0;
  }

  .hoofding-links .subtekst {
    font-size: 0.9rem;
    margin: 0;
    color: #6b7280;
  }

  .zoekbalk-container {
    position: relative;
    background: none;
    padding: 0;
    box-shadow: none;
  }
  
  .zoekbalk-container .zoek-icoon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
  }

  .zoekbalk-container .zoekveld {
    width: 100%;
    font-size: 1rem;
    padding: 0.8rem 1rem 0.8rem 2.75rem;
    border: 1px solid #e5e7eb;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  
  .statistieken {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    padding: 1rem;
  }

  .statistieken .stat-value {
    font-size: 1.8rem;
    font-weight: 600;
  }

  .lijst-hoofding {
    text-align: center;
    border-bottom: 1px solid #f3f4f6;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
  }

  .geen-resultaten {
    padding: 2rem 1rem;
    border-top: none;
  }

  .studentenlijst {
    display: block; /* Change from grid to block for mobile */
  }

  .student-kaart {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .student-kaart:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  }

  .student-info {
    gap: 0.5rem;
    flex-direction: column;
    align-items: center;
  }
  
  .student-info .avatar {
     width: 56px;
     height: 56px;
     font-size: 1.25rem;
     margin-bottom: 0.5rem;
  }
  
  .student-info h3 {
    font-size: 1.2rem;
  }
  
  .student-info .richting {
    font-size: 0.95rem;
    color: #c20000;
    font-weight: 500;
  }
  
  .verwijder-kruis {
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f3f4f6;
  }

  .acties {
    gap: 0.5rem;
    padding-top: 1rem;
  }

  .acties .knop-grijs, .acties .knop-rood {
    padding: 0.8rem;
    font-size: 0.9rem;
    border-radius: 8px;
  }
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.popup-modal {
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  padding: 2rem 2.5rem 1.5rem 2.5rem;
  min-width: 320px;
  max-width: 90vw;
  text-align: center;
}

.popup-modal h3 {
  margin-top: 0;
  color: #c20000;
  font-size: 1.25rem;
  font-weight: 700;
}

.popup-modal p {
  color: #333;
  margin: 1.2rem 0 2rem 0;
}

.popup-buttons {
  display: flex;
  justify-content: center;
  gap: 1.2rem;
}

.popup-cancel {
  background: #f3f4f6;
  color: #222;
  border: none;
  border-radius: 0.7rem;
  padding: 0.7rem 1.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.15s;
}

.popup-cancel:hover {
  background: #e5e7eb;
}

.popup-confirm {
  background: #c20000;
  color: #fff;
  border: none;
  border-radius: 0.7rem;
  padding: 0.7rem 1.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.15s;
}

.popup-confirm:hover {
  background: #a10000;
}
</style>
