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
          <h2>Overzicht Matches</h2>
          <p>Klik op een bedrijf voor profiel of gesprek</p>
        </div>
        <div
          class="student-kaart"
          v-for="bedrijf in gefilterdeBedrijven"
          :key="bedrijf.id"
        >
          <div class="student-info">
            <div class="avatar">
              <img v-if="bedrijf.logoUrl" :src="bedrijf.logoUrl" alt="Bedrijfslogo" class="bedrijfslogo-img"/>
              <span v-else>{{ bedrijf.afkorting }}</span>
            </div>
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
              @click="planAfspraak(bedrijf)"
            >
              <Calendar :size="14" />
              <span>Gesprek</span>
            </button>
            <span v-else class="status-wacht">In afwachting van validatie door het bedrijf</span>
            <button class="verwijder-btn-rond" @click="openConfirmModal(bedrijf)">✖</button>
          </div>
        </div>
        <div v-if="gefilterdeBedrijven.length === 0" class="geen-resultaten">
          <div class="emoji">🔍</div>
          <h3>Geen bedrijven gevonden</h3>
          <p>Probeer een andere zoekterm.</p>
        </div>
      </div>
      <!-- Modal voor tijdslot selectie -->
      <div v-if="showTimeSlotModal" class="modal-overlay">
        <div class="modal-content">
          <h3 class="modal-title">
            Kies een tijdslot voor je afspraak met {{ geselecteerdeBedrijfNaam }}
          </h3>
          <div class="timeslot-grid">
            <button
              v-for="slot in timeSlots"
              :key="slot.tijd"
              class="timeslot-btn"
              :class="{ 
                'selected': geselecteerdeTijdslot === slot.tijd,
                'geboekt': slot.isGeboekt || slot.isOverlap
              }"
              :disabled="slot.isGeboekt || slot.isOverlap"
              @click="geselecteerdeTijdslot = slot.tijd"
            >
              <span v-if="!slot.isOverlap">{{ slot.tijd }}</span>
              <span v-else class="conflict-info">{{ slot.conflictInfo }}</span>
            </button>
          </div>
          <div class="modal-actions">
            <button @click="showTimeSlotModal = false" class="annuleer-btn">Annuleren</button>
            <button @click="bevestigAfspraak" class="bevestig-btn" :disabled="!geselecteerdeTijdslot">
              Bevestig
            </button>
          </div>
        </div>
      </div>
    </section>
  </StudentDashboardLayout>

  <!-- Confirmation Modal -->
  <div v-if="showConfirm" class="modal-overlay" @click="showConfirm = false">
    <div class="modal" @click.stop>
      <p>Weet je zeker dat je deze match wilt verwijderen?</p>
      <div class="modal-actions">
        <button class="knop-ja" @click="confirmUnmatch">Ja</button>
        <button class="knop-nee" @click="showConfirm = false">Nee</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Heart, Calendar, User, Search, Building } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import StudentDashboardLayout from '../../../components/StudentDashboardLayout.vue'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where, deleteDoc, onSnapshot, documentId } from 'firebase/firestore'
import { notificationService } from '../../../services/notificationService'
import { useToast } from 'vue-toastification'

const db = getFirestore();
const auth = getAuth();
const router = useRouter();
const toast = useToast();
const matchBedrijven = ref([])
const zoekterm = ref('')
const showTimeSlotModal = ref(false)
const selectedTimeSlot = ref(null)
const timeSlots = ref([])
const takenSlots = ref([])
const selectedBedrijfId = ref(null)
const showConfirm = ref(false)
const matchToDelete = ref(null)
const studentTakenSlots = ref([]); // Alle tijden van de student, bij alle bedrijven
let unsubscribe = null; // Voor de realtime listener
const geselecteerdeBedrijfId = ref(null);
const geselecteerdeBedrijfNaam = ref(null);
const geselecteerdeTijdslot = ref(null);
const studentNaam = ref('');
const studentData = ref(null);
const alleAfspraken = ref([]); // Voor het bijhouden van alle afspraken van de student

const genereerTijdsloten = (start, eind, duur) => {
  const sloten = [];
  // Duur als getal extraheren
  let duurMinuten = typeof duur === 'string' ? parseInt(duur.match(/\d+/)?.[0], 10) : Number(duur);
  if (!start || !eind || !duurMinuten || duurMinuten <= 0 || isNaN(duurMinuten)) return sloten;
  let [startUur, startMin] = start.split(':').map(Number);
  const [eindUur, eindMin] = eind.split(':').map(Number);
  while (startUur < eindUur || (startUur === eindUur && startMin < eindMin)) {
    let eindSlotMin = startMin + duurMinuten;
    let eindSlotUur = startUur;
    if (eindSlotMin >= 60) {
      eindSlotUur += Math.floor(eindSlotMin / 60);
      eindSlotMin %= 60;
    }
    if (eindSlotUur > eindUur || (eindSlotUur === eindUur && eindSlotMin > eindMin)) {
      break;
    }
    const formatTijd = (uur, min) => `${String(uur).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    sloten.push(`${formatTijd(startUur, startMin)} - ${formatTijd(eindSlotUur, eindSlotMin)}`);
    startMin += duurMinuten;
    if (startMin >= 60) {
      startUur += Math.floor(startMin / 60);
      startMin %= 60;
    }
  }
  return sloten;
};

onMounted(async () => {
  const user = auth.currentUser;
  if (!user) {
    console.error("Geen gebruiker ingelogd.");
    return;
  }
  const studentId = user.uid;

  // Haal eerst alle bedrijf-data op
  const bedrijvenSnap = await getDocs(collection(db, 'bedrijf'));
  const bedrijvenMap = {};
  bedrijvenSnap.forEach(docu => { bedrijvenMap[docu.id] = docu.data(); });

  // Zet de realtime listener op
  const q = query(collection(db, 'student', studentId, 'swipes'), where('status', 'in', ['interessant', 'geaccepteerd']));

  unsubscribe = onSnapshot(q, (swipesSnap) => {
    const relevantSwipes = swipesSnap.docs.map(docu => ({ id: docu.id, ...docu.data() }));
    
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
        status: swipe.status,
        logoUrl: bedrijf.foto
      };
    });
  }, (error) => {
    console.error("Fout bij realtime ophalen van matches: ", error);
  });
});

onBeforeUnmount(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

const gefilterdeBedrijven = computed(() =>
  matchBedrijven.value.filter((bedrijf) =>
    bedrijf.naam.toLowerCase().includes(zoekterm.value.toLowerCase()) ||
    bedrijf.sector.toLowerCase().includes(zoekterm.value.toLowerCase()) ||
    bedrijf.locatie.toLowerCase().includes(zoekterm.value.toLowerCase())
  )
)

const toonProfiel = (id) => {
  router.push({ name: 'BedrijfProfielVoorStudent', params: { id: id } })
}

function generateTimeSlots(startTime, endTime, durationString) {
  const slots = [];
  const duration = parseInt(durationString.match(/\d+/)[0], 10);

  const lunchStart = 12;
  const lunchEnd = 13;

  // Hulpfunctie om tijd-string naar Date object om te zetten
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  let currentTime = parseTime(startTime);
  const endDateTime = parseTime(endTime);

  // Afronden van de starttijd op het volgende kwartier gebaseerd op de duur
  const startMinutes = currentTime.getMinutes();
  const remainder = startMinutes % duration;
  if (remainder !== 0) {
    currentTime.setMinutes(startMinutes + (duration - remainder));
  }

  let pauzeToegevoegd = false;

  while (currentTime < endDateTime) {
    const slotStart = new Date(currentTime);
    const slotEnd = new Date(currentTime.getTime() + duration * 60000);

    const slotStartHour = slotStart.getHours();

    // Check voor lunchpauze
    if (slotStartHour >= lunchStart && slotStartHour < lunchEnd) {
      if (!pauzeToegevoegd) {
        slots.push('Pauze');
        pauzeToegevoegd = true;
      }
      currentTime.setMinutes(currentTime.getMinutes() + duration);
      continue;
    }
    
    if (slotEnd > endDateTime) {
      break; // Voorkom dat een slot over de eindtijd gaat
    }

    const formatTime = (date) => date.toTimeString().substring(0, 5);
    slots.push(`${formatTime(slotStart)} - ${formatTime(slotEnd)}`);
    
    currentTime = slotEnd;
  }

  return slots;
}

// Functie om tijdsloten te parsen naar Date-objecten
const parseTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// Functie om te checken op overlappende afspraken
const checkOverlap = (slot1, slot2) => {
  if (!slot1 || !slot2 || typeof slot1 !== 'string' || typeof slot2 !== 'string') return false;
  const [start1, end1] = slot1.split(' - ').map(parseTime);
  const [start2, end2] = slot2.split(' - ').map(parseTime);
  return start1 < end2 && start2 < end1;
};

const planAfspraak = async (bedrijf) => {
  if (!bedrijf || !bedrijf.id) return;
  geselecteerdeBedrijfId.value = bedrijf.id;
  geselecteerdeBedrijfNaam.value = bedrijf.naam;

  try {
    // 1. Haal alle afspraken van de student op
    const afsprakenQuery = query(collection(db, 'afspraken'), where('studentUid', '==', auth.currentUser.uid));
    const afsprakenSnap = await getDocs(afsprakenQuery);
    const bestaandeAfspraken = afsprakenSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    // Haal bedrijfsnamen op voor bestaande afspraken
    const bedrijfIds = [...new Set(bestaandeAfspraken.map(a => a.bedrijfId).filter(Boolean))];
    const bedrijvenData = {};
    if (bedrijfIds.length > 0) {
      const bedrijvenQuery = query(collection(db, 'bedrijf'), where(documentId(), 'in', bedrijfIds));
      const bedrijvenSnap = await getDocs(bedrijvenQuery);
      bedrijvenSnap.forEach(doc => {
        bedrijvenData[doc.id] = doc.data().bedrijfsnaam;
      });
    }
    
    alleAfspraken.value = bestaandeAfspraken.map(a => ({
      ...a,
      bedrijfsnaam: bedrijvenData[a.bedrijfId] || 'een ander bedrijf'
    }));

    // 2. Haal tijdsloten voor het geselecteerde bedrijf op
    const bedrijfDoc = await getDoc(doc(db, 'bedrijf', bedrijf.id));
    if (!bedrijfDoc.exists()) {
      toast.error("Kon bedrijfsdetails niet vinden.");
      return;
    }
    const bedrijfData = bedrijfDoc.data();
    
    const alleTijdsloten = genereerTijdsloten(
      bedrijfData.starttijd,
      bedrijfData.eindtijd,
      bedrijfData.gesprekDuur
    );

    const geboekteTijdslotenQuery = query(collection(db, 'afspraken'), where('bedrijfId', '==', bedrijf.id));
    const geboekteTijdslotenSnap = await getDocs(geboekteTijdslotenQuery);
    const geboekteTijden = new Set(geboekteTijdslotenSnap.docs.map(d => d.data().tijd));

    timeSlots.value = alleTijdsloten.map(slot => {
      // Check of de student zelf een overlappende afspraak heeft
      const overlappendeAfspraak = alleAfspraken.value.find(afspraak => afspraak.status === 'upcoming' && checkOverlap(slot, afspraak.tijd));
      
      return {
        tijd: slot,
        isGeboekt: geboekteTijden.has(slot),
        isOverlap: !!overlappendeAfspraak,
        conflictInfo: overlappendeAfspraak ? `U heeft al een afspraak met ${overlappendeAfspraak.bedrijfsnaam}` : ''
      };
    });

    showTimeSlotModal.value = true;
  } catch (error) {
    console.error("Fout bij voorbereiden afspraak:", error);
    toast.error("Kon tijdsloten niet laden.");
  }
};

function selectTimeSlot(slot) {
  selectedTimeSlot.value = slot
}

const bevestigAfspraak = async () => {
  if (!geselecteerdeTijdslot.value) {
    console.error("Tijdslot is niet geselecteerd.");
    return;
  }

  const studentId = auth.currentUser?.uid;
  if (!studentId) {
    console.error("Geen gebruiker ingelogd.");
    return;
  }

  try {
    // Sla afspraak op in Firestore
    const docRef = await addDoc(collection(db, 'afspraken'), {
      studentUid: studentId,
      bedrijfId: geselecteerdeBedrijfId.value,
      tijd: geselecteerdeTijdslot.value,
      status: 'upcoming',
      aangemaaktOp: new Date()
    });
    
    // Update de match-status in student_swipes naar 'gepland'
    const swipeId = geselecteerdeBedrijfId.value;
    await updateDoc(doc(db, 'student', studentId, 'swipes', swipeId), { status: 'gepland' });
    
    // Haal studentgegevens op voor notificatie
    const studentDoc = await getDoc(doc(db, 'student', studentId));
    const studentData = studentDoc.exists() ? studentDoc.data() : {};
    const studentName = `${studentData.voornaam || 'Onbekende'} ${studentData.achternaam || 'Student'}`;
    
    // Haal bedrijfsgegevens op voor notificatie
    const bedrijfDoc = await getDoc(doc(db, 'bedrijf', geselecteerdeBedrijfId.value));
    const bedrijfData = bedrijfDoc.exists() ? bedrijfDoc.data() : {};
    const bedrijfNaam = bedrijfData.bedrijfsnaam || 'Onbekend Bedrijf';
    
    // Stuur notificatie naar bedrijf
    await notificationService.createCompanyAppointmentScheduledNotification(
      geselecteerdeBedrijfId.value, 
      studentName, 
      geselecteerdeTijdslot.value
    );
    
    showTimeSlotModal.value = false;
    geselecteerdeTijdslot.value = null;
    // Herlaad matches zodat de geplande match verdwijnt
    await reloadMatches();
  } catch (error) {
    console.error('Fout bij bevestigen van afspraak:', error);
  }
};

// Helper: check of een object leeg is
function isEmpty(obj) {
  return !obj || Object.keys(obj).length === 0;
}

async function reloadMatches() {
  // Deze functie is niet meer nodig, onSnapshot doet het werk.
  // Je kunt de aanroepen naar reloadMatches() verwijderen of leeg laten.
}

function closeTimeModal() {
  showTimeSlotModal.value = false
  selectedTimeSlot.value = null
  selectedBedrijfId.value = null
}

const parseSlotToDates = (slotString) => {
  if (!slotString || !slotString.includes(' - ')) return null;
  const [startTimeStr, endTimeStr] = slotString.split(' - ');
  const startDate = new Date();
  const [startHours, startMinutes] = startTimeStr.trim().split(':').map(Number);
  startDate.setHours(startHours, startMinutes, 0, 0);

  const endDate = new Date();
  const [endHours, endMinutes] = endTimeStr.trim().split(':').map(Number);
  endDate.setHours(endHours, endMinutes, 0, 0);

  return { start: startDate, end: endDate };
}

const doTimeRangesOverlap = (range1, range2) => {
  if (!range1 || !range2) return false;
  return range1.start < range2.end && range1.end > range2.start;
}

function isSlotTaken(slot) {
  if (slot === 'Pauze') return true;
  // 1. Is het slot al bezet bij dit bedrijf?
  if (takenSlots.value.includes(slot)) return true;
  
  // 2. Overlapt dit slot met een andere afspraak van de student?
  const currentSlotRange = parseSlotToDates(slot);
  for (const studentSlot of studentTakenSlots.value) {
    const existingSlotRange = parseSlotToDates(studentSlot);
    if (doTimeRangesOverlap(currentSlotRange, existingSlotRange)) {
      return true;
    }
  }

  return false;
}

async function verwijderMatch(bedrijfId) {
  const studentId = auth.currentUser?.uid;
  if (!studentId) return;
  // Verwijder swipe uit subcollectie
  await deleteDoc(doc(db, 'student', studentId, 'swipes', bedrijfId));
  // Herlaad matches
  await reloadMatches();
}

const openConfirmModal = (match) => {
  matchToDelete.value = match;
  showConfirm.value = true;
};

const confirmUnmatch = async () => {
  if (!matchToDelete.value) return;

  const studentId = auth.currentUser?.uid;
  // Het 'id' van het match-object is de bedrijfId
  const bedrijfId = matchToDelete.value.id; 

  if (!studentId || !bedrijfId) {
    console.error("Fout: student- of bedrijf-ID ontbreekt.");
    return;
  }

  try {
    // Verwijder de swipe van de student. Dit maakt dat het bedrijf weer in de swipe-lijst komt.
    const studentSwipeRef = doc(db, 'student', studentId, 'swipes', bedrijfId);
    await deleteDoc(studentSwipeRef);

    // Verwijder de swipe van het bedrijf op de student, als die bestaat
    // (niet strikt noodzakelijk voor de UI van de student, maar wel voor een schone database)
    const companySwipeRef = doc(db, 'bedrijf', bedrijfId, 'swipes', studentId);
    await deleteDoc(companySwipeRef).catch(e => console.log("Bedrijfsswipe niet gevonden, mogelijk was er nog geen match."));
    
    // Update de UI door de match uit de lokale lijst te filteren
    matchBedrijven.value = matchBedrijven.value.filter(m => m.id !== bedrijfId);

  } catch (err) {
    console.error("Fout bij het verwijderen van de match: ", err);
  } finally {
    showConfirm.value = false;
    matchToDelete.value = null;
  }
};

const goToProfile = (bedrijfId) => {
  // Logic to navigate to company profile
};
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
  width: 100%;
}
.avatar {
  background: #c20000;
  color: white;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  flex-shrink: 0;
  overflow: hidden;
}
.bedrijfslogo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  grid-template-columns: repeat(3, 1fr);
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

.timeslot-btn.pauze {
  background-color: #e5e7eb;
  color: #6b7280;
  cursor: not-allowed;
  font-style: italic;
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

.verwijder-btn-rond {
  position: absolute;
  top: 0.7rem;
  right: 0.7rem;
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #dc2626;
  color: #dc2626;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(220,38,38,0.08);
  transition: background 0.2s, color 0.2s;
  z-index: 2;
}
.verwijder-btn-rond:hover {
  background: #dc2626;
  color: #fff;
}

/* Modal styles - copied from StProfielFavorieten */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
.modal {
  background-color: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-align: center;
}
.modal p {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  color: #374151;
}
.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}
.knop-ja, .knop-nee {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}
.knop-ja {
  background: #c20000;
  color: white;
}
.knop-ja:hover {
  background: #a50000;
}
.knop-nee {
  background: #e5e7eb;
  color: #374151;
}
.knop-nee:hover {
  background: #d1d5db;
}

@media (max-width: 768px) {
  .pagina {
    padding: 1rem;
  }

  .hoofding {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .statistieken {
    grid-template-columns: repeat(2, 1fr);
  }

  .studentenlijst {
    padding: 1.5rem 1rem;
  }

  .student-kaart {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .student-info {
    width: 100%;
  }

  .acties {
    width: 100%;
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
  
  .acties .knop-grijs,
  .acties .knop-rood,
  .acties .status-wacht {
    width: 100%;
    text-align: center;
  }

  .verwijder-btn-rond {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }
  
  .modal-content {
    width: 90vw;
  }

  .timeslot-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
}

.annuleer-btn {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 0.6rem 1.4rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 1rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  transition: background 0.18s, color 0.18s;
  margin-right: 0.5rem;
}

.annuleer-btn:hover {
  background: #e5e7eb;
  color: #222;
}

.bevestig-btn {
  background: #c20000;
  color: #fff;
  border: none;
  padding: 0.6rem 1.4rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(194,0,0,0.08);
  transition: background 0.18s, color 0.18s;
  margin-left: 0.5rem;
}
.bevestig-btn:disabled {
  background: #f3f4f6;
  color: #b91c1c;
  cursor: not-allowed;
  opacity: 0.7;
}
.bevestig-btn:not(:disabled):hover {
  background: #a50000;
}
</style>