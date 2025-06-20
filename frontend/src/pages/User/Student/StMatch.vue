<template>
  <StudentDashboardLayout>
    <section class="pagina">
      <div class="hoofding">
        <div class="hoofding-links">
          <div class="icoon-container">
            <Heart :size="24" color="white" />
          </div>
          <div>
            <h1 class="titel">Match bedrijven</h1>
            <p class="subtekst">{{ matchBedrijven.length }} matches gevonden</p>
          </div>
        </div>
      </div>
      <div class="zoekbalk-container">
        <Search class="zoek-icoon" :size="16" />
        <input
          type="text"
          class="zoekveld"
          placeholder="Zoek op naam, sector of locatie..."
          v-model="zoekterm"
        />
      </div>
      <div class="statistieken">
        <div>
          <div class="stat-value">{{ matchBedrijven.length }}</div>
          <div class="stat-label">Totaal</div>
        </div>
        <div>
          <div class="stat-value rood">{{ gefilterdeBedrijven.length }}</div>
          <div class="stat-label">Resultaten</div>
        </div>
      </div>
      <div class="studentenlijst">
        <div class="lijst-hoofding">
          <h2>Overzicht Matchs</h2>
          <p>Klik op een bedrijf voor profiel of gesprek</p>
        </div>
        <div
          class="student-kaart"
          v-for="bedrijf in gefilterdeBedrijven"
          :key="bedrijf.id"
        >
          <div class="student-info">
            <div class="avatar">{{ bedrijf.afkorting }}</div>
            <div>
              <h3>{{ bedrijf.naam }}</h3>
              <p class="richting">{{ Array.isArray(bedrijf.sector) ? bedrijf.sector.join(', ') : bedrijf.sector }} – {{ bedrijf.locatie }}</p>
            </div>
          </div>
          <div class="acties">
            <button class="knop-grijs" @click="toonProfiel(bedrijf.id)">
              <Building :size="14" />
              <span>Profiel</span>
            </button>
            <button
              v-if="bedrijf.status === 'geaccepteerd'"
              class="knop-rood"
              @click="planAfspraak(bedrijf.id)"
            >
              <Calendar :size="14" />
              <span>Gesprek</span>
            </button>
            <span v-else class="status-wacht">In afwachting van validatie door het bedrijf</span>
          </div>
        </div>
        <div v-if="gefilterdeBedrijven.length === 0" class="geen-resultaten">
          <div class="emoji">🔍</div>
          <h3>Geen bedrijven gevonden</h3>
          <p>Probeer een andere zoekterm.</p>
        </div>
      </div>
      <!-- Modal voor tijdslot selectie -->
      <div v-if="showTimeModal" class="modal-overlay">
        <div class="modal-content">
          <h3>Kies een tijdslot voor je gesprek</h3>
          <div class="timeslot-grid">
            <button
              v-for="slot in timeSlots"
              :key="slot"
              :disabled="isSlotTaken(slot)"
              :class="['timeslot-btn', { taken: isSlotTaken(slot), selected: selectedTimeSlot === slot }]"
              @click="selectTimeSlot(slot)"
            >
              {{ slot }}
            </button>
          </div>
          <div class="modal-actions">
            <button class="action-btn btn-save" :disabled="!selectedTimeSlot" @click="bevestigAfspraak">Bevestig</button>
            <button class="action-btn btn-cancel-edit" @click="closeTimeModal">Annuleren</button>
          </div>
        </div>
      </div>
    </section>
  </StudentDashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Heart, Calendar, User, Search, Building } from 'lucide-vue-next'
import StudentDashboardLayout from '../../../components/StudentDashboardLayout.vue'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where } from 'firebase/firestore'

const db = getFirestore();
const auth = getAuth();
const matchBedrijven = ref([])
const zoekterm = ref('')
const showTimeModal = ref(false)
const selectedTimeSlot = ref(null)
const timeSlots = [
  '10:00 - 10:30',
  '10:30 - 11:00',
  '11:00 - 11:30',
  '11:30 - 12:00',
  '12:00 - 12:30',
  '12:30 - 13:00',
  '13:00 - 13:30',
  '13:30 - 14:00',
  '14:00 - 14:30',
  '14:30 - 15:00',
  '15:00 - 15:30',
  '15:30 - 16:00',
]
const takenSlots = ref([])
const selectedBedrijfId = ref(null)

onMounted(async () => {
  let studentId = auth.currentUser?.uid;
  if (!studentId) {
    await new Promise(resolve => {
      const unsub = auth.onAuthStateChanged(user => {
        studentId = user?.uid;
        unsub();
        resolve();
      });
    });
  }
  if (!studentId) return;
  // Haal alle swipes met status 'interessant' of 'geaccepteerd' uit subcollectie
  const swipesSnap = await getDocs(collection(db, 'student', studentId, 'swipes'));
  const relevantSwipes = swipesSnap.docs
    .map(docu => ({ id: docu.id, ...docu.data() }))
    .filter(d => (d.status === 'interessant' || d.status === 'geaccepteerd'));
  // Haal bedrijven op
  const bedrijvenSnap = await getDocs(collection(db, 'bedrijf'));
  const bedrijvenMap = {};
  bedrijvenSnap.forEach(docu => { bedrijvenMap[docu.id] = docu.data(); });
  // Combineer
  matchBedrijven.value = relevantSwipes.map(swipe => {
    const bedrijf = bedrijvenMap[swipe.bedrijfUid] || {};
    let sector = '-';
    if (bedrijf.sector) {
      sector = Array.isArray(bedrijf.sector) ? bedrijf.sector.join(', ') : bedrijf.sector;
    } else if (bedrijf.opZoekNaar) {
      sector = Array.isArray(bedrijf.opZoekNaar) ? bedrijf.opZoekNaar.join(', ') : bedrijf.opZoekNaar;
    }
    return {
      id: swipe.bedrijfUid,
      naam: bedrijf.bedrijfsnaam || 'Onbekend',
      sector,
      afkorting: (bedrijf.bedrijfsnaam || '??').substring(0,2).toUpperCase(),
      locatie: bedrijf.gesitueerdIn || '-',
      status: swipe.status
    };
  });
});

const gefilterdeBedrijven = computed(() =>
  matchBedrijven.value.filter((bedrijf) =>
    bedrijf.naam.toLowerCase().includes(zoekterm.value.toLowerCase()) ||
    bedrijf.sector.toLowerCase().includes(zoekterm.value.toLowerCase()) ||
    bedrijf.locatie.toLowerCase().includes(zoekterm.value.toLowerCase())
  )
)

const toonProfiel = (id) => {
  console.log(`Bekijk profiel van bedrijf ${id}`)
}

const planAfspraak = async (id) => {
  selectedBedrijfId.value = id
  selectedTimeSlot.value = null
  // Haal reeds geboekte tijdsloten op voor dit bedrijf
  const afsprakenSnap = await getDocs(collection(db, 'afspraken'))
  takenSlots.value = afsprakenSnap.docs
    .map(docu => docu.data())
    .filter(a => a.bedrijfId === id)
    .map(a => a.time)
  showTimeModal.value = true
}

function selectTimeSlot(slot) {
  selectedTimeSlot.value = slot
}

async function bevestigAfspraak() {
  if (!selectedTimeSlot.value || !selectedBedrijfId.value) return
  const studentId = auth.currentUser?.uid
  if (!studentId) return
  // Sla afspraak op in Firestore
  await addDoc(collection(db, 'afspraken'), {
    studentUid: studentId,
    bedrijfId: selectedBedrijfId.value,
    time: selectedTimeSlot.value,
    status: 'upcoming',
    aangemaaktOp: new Date()
  })
  // Update de match-status in student_swipes naar 'gepland'
  const swipeId = selectedBedrijfId.value;
  await updateDoc(doc(db, 'student', studentId, 'swipes', swipeId), { status: 'gepland' });
  showTimeModal.value = false
  selectedTimeSlot.value = null
  selectedBedrijfId.value = null
  // Herlaad matches zodat de geplande match verdwijnt
  await reloadMatches();
}

// Helper: check of een object leeg is
function isEmpty(obj) {
  return !obj || Object.keys(obj).length === 0;
}

async function reloadMatches() {
  let studentId = auth.currentUser?.uid;
  if (!studentId) {
    await new Promise(resolve => {
      const unsub = auth.onAuthStateChanged(user => {
        studentId = user?.uid;
        unsub();
        resolve();
      });
    });
  }
  if (!studentId) return;
  const swipesSnap = await getDocs(collection(db, 'student', studentId, 'swipes'));
  const relevantSwipes = swipesSnap.docs
    .map(docu => ({ id: docu.id, ...docu.data() }))
    .filter(d => (d.status === 'interessant' || d.status === 'geaccepteerd'));
  const bedrijvenSnap = await getDocs(collection(db, 'bedrijf'));
  const bedrijvenMap = {};
  bedrijvenSnap.forEach(docu => { bedrijvenMap[docu.id] = docu.data(); });
  matchBedrijven.value = relevantSwipes
    .filter(swipe => bedrijvenMap[swipe.bedrijfUid] && !isEmpty(bedrijvenMap[swipe.bedrijfUid]))
    .map(swipe => {
      const bedrijf = bedrijvenMap[swipe.bedrijfUid];
      let sector = '-';
      if (bedrijf.sector) {
        sector = Array.isArray(bedrijf.sector) ? bedrijf.sector.join(', ') : bedrijf.sector;
      } else if (bedrijf.opZoekNaar) {
        sector = Array.isArray(bedrijf.opZoekNaar) ? bedrijf.opZoekNaar.join(', ') : bedrijf.opZoekNaar;
      }
      return {
        id: swipe.bedrijfUid,
        naam: bedrijf.bedrijfsnaam || 'Onbekend',
        sector,
        afkorting: (bedrijf.bedrijfsnaam || '??').substring(0,2).toUpperCase(),
        locatie: bedrijf.gesitueerdIn || '-',
        status: swipe.status
      };
    });
}

function closeTimeModal() {
  showTimeModal.value = false
  selectedTimeSlot.value = null
  selectedBedrijfId.value = null
}

function isSlotTaken(slot) {
  return takenSlots.value.includes(slot)
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

/* --- MATCHES THEMA DASHBOARD --- */
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
.knop-grijs, .knop-rood {
  min-width: 100px;
  font-size: 0.98rem;
  font-weight: 500;
  border-radius: 0.6rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
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

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 0.5rem;
  width: 80%;
  max-width: 400px;
}

.timeslot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.timeslot-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: #fff;
  cursor: pointer;
  transition: background-color 0.2s;
}

.timeslot-btn:hover {
  background-color: #f3f4f6;
}

.timeslot-btn.selected {
  background-color: #c20000;
  color: #fff;
}

.timeslot-btn.taken {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-save {
  background-color: #c20000;
  color: #fff;
}

.btn-save:hover {
  background-color: #b91c1c;
}

.btn-cancel-edit {
  background-color: #f3f4f6;
}

.btn-cancel-edit:hover {
  background-color: #e5e7eb;
}
</style>