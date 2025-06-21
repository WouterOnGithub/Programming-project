<template>
  <StudentDashboardLayout>
    <!-- Mobile-only header -->
    <header class="mobile-header">
      <img src="/Images/ehb-logo.png" alt="EhB Logo" class="mobile-logo" />
      <button @click="toggleMobileSidebar" class="hamburger-menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>

    <!-- Mobile-only welcome banner -->
    <section class="welcome-banner-mobile">
      <div class="welcome-text">
        <h1 class="welcome-title">Welkom, {{ studentData.name }}!</h1>
        <p class="welcome-subtitle">Hier is je match overzicht</p>
      </div>
      <div class="welcome-avatar" @click="handleAvatarClick">
        <img v-if="studentData.foto" :src="studentData.foto" alt="Profielfoto" class="avatar-img" />
        <span v-else>{{ studentData.name ? studentData.name.charAt(0) : 'G' }}</span>
      </div>
      <div v-if="showDropdown" id="mobile-profile-dropdown" class="profile-dropdown-mobile">
          <button class="dropdown-item" @click="goToProfile">Profiel</button>
          <button class="dropdown-item" @click="handleLogout">Uitloggen</button>
      </div>
    </section>

    <!-- Main Content -->
    <main class="dashboard-main">
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
                @click="planAfspraak(bedrijf.id)"
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
        <div v-if="showTimeModal" class="modal-overlay">
          <div class="modal-content">
            <h3>Kies een tijdslot voor je gesprek</h3>
            <div class="timeslot-grid">
              <button
                v-for="slot in timeSlots"
                :key="slot"
                :disabled="isSlotTaken(slot)"
                :class="['timeslot-btn', { 'pauze': slot === 'Pauze', taken: isSlotTaken(slot) && slot !== 'Pauze', selected: selectedTimeSlot === slot }]"
                @click="slot !== 'Pauze' && selectTimeSlot(slot)"
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
    </main>
  </StudentDashboardLayout>

  <!-- Mobile-only sidebar -->
  <aside class="mobile-sidebar" :class="{ 'is-open': isMobileSidebarOpen }">
    <div class="mobile-sidebar-header">
      <button @click="toggleMobileSidebar" class="close-sidebar-btn">
        <span></span>
        <span></span>
      </button>
      <div class="sidebar-header-content">
        <img src="/Images/ehb-logo.png" alt="EhB Logo" class="sidebar-header-logo" />
        <div class="sidebar-header-text">
          <h3>StudentMatch</h3>
          <p>Studentdashboard</p>
        </div>
      </div>
    </div>
    <nav class="mobile-nav">
      <router-link v-for="item in navigation" :key="item.name" :to="item.href" class="mobile-nav-link" :class="{ 'active-link': route.path === item.href }">
        <span>{{ item.name }}</span>
      </router-link>
    </nav>
  </aside>
  <div v-if="isMobileSidebarOpen" @click="toggleMobileSidebar" class="sidebar-overlay"></div>

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
import { useRouter, useRoute } from 'vue-router'
import StudentDashboardLayout from '../../../components/StudentDashboardLayout.vue'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where, deleteDoc } from 'firebase/firestore'

const db = getFirestore();
const auth = getAuth();
const router = useRouter();
const route = useRoute();

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: 'fas fa-chart-pie' },
  { name: 'Job Swiping', href: '/swipe', icon: 'fas fa-heart' },
  { name: 'Afspraken', href: '/appointments', icon: 'fas fa-calendar' },
  { name: 'Favorieten', href: '/Favorietenst', icon: 'fas fa-star' },
  { name: 'Matches', href: '/stmatch', icon: 'fas fa-check-double' },
  { name: 'Profiel', href: '/WeergaveSt', icon: 'fas fa-user' },
  { name: 'Instellingen', href: '/SettingsStu', icon: 'fas fa-cog' },
];

const matchBedrijven = ref([])
const zoekterm = ref('')
const showTimeModal = ref(false)
const selectedTimeSlot = ref(null)
const timeSlots = ref([])
const takenSlots = ref([])
const selectedBedrijfId = ref(null)
const showConfirm = ref(false)
const matchToDelete = ref(null)

// --- Mobile Navigation State & Logic ---
const isMobileSidebarOpen = ref(false);
const showDropdown = ref(false);
const studentData = ref({
  name: 'Gebruiker',
  foto: null,
});

const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value;
};

const handleAvatarClick = () => {
  showDropdown.value = !showDropdown.value;
};

const handleLogout = () => {
  router.push('/');
};

const goToProfile = () => {
    router.push('/WeergaveSt');
};

const handleClickOutside = (event) => {
  const dropdown = document.getElementById('mobile-profile-dropdown');
  const avatar = document.querySelector('.welcome-avatar');
  if (dropdown && !dropdown.contains(event.target) && avatar && !avatar.contains(event.target)) {
    showDropdown.value = false;
  }
};
// --- End Mobile Navigation ---

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

  // Fetch student data for banner
  const studentDocRef = doc(db, 'student', studentId);
  const studentDocSnap = await getDoc(studentDocRef);
  if (studentDocSnap.exists()) {
    const data = studentDocSnap.data();
    studentData.value.name = data.voornaam ? `${data.voornaam} ${data.achternaam || ''}`.trim() : 'Gebruiker';
    studentData.value.foto = data.foto || null;
  }

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
      status: swipe.status,
      logoUrl: bedrijf.foto
    };
  });
});

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('mousedown', handleClickOutside);
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

const planAfspraak = async (id) => {
  selectedBedrijfId.value = id;
  selectedTimeSlot.value = null;

  try {
    // 1. Haal bedrijfsdata op voor tijden en duur
    const bedrijfDocRef = doc(db, 'bedrijf', id);
    const bedrijfDoc = await getDoc(bedrijfDocRef);

    if (!bedrijfDoc.exists()) {
      console.error("Bedrijf niet gevonden");
      return;
    }
    const bedrijfData = bedrijfDoc.data();
    const { starttijd, eindtijd, gesprekDuur } = bedrijfData;

    if (!starttijd || !eindtijd || !gesprekDuur) {
        console.error("Tijd of duur niet ingesteld voor dit bedrijf.");
        // Fallback naar standaard tijden?
        timeSlots.value = ['Geen tijden beschikbaar'];
        showTimeModal.value = true;
        return;
    }

    // 2. Genereer de tijdsloten
    timeSlots.value = generateTimeSlots(starttijd, eindtijd, gesprekDuur);

    // 3. Haal reeds geboekte tijdsloten op
    const afsprakenSnap = await getDocs(
      query(collection(db, 'afspraken'), where('bedrijfId', '==', id))
    );
    takenSlots.value = afsprakenSnap.docs.map(docu => docu.data().time);

    showTimeModal.value = true;
  } catch (error) {
    console.error("Fout bij voorbereiden afspraak:", error);
  }
};

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
        status: swipe.status,
        logoUrl: bedrijf.foto
      };
    });
}

function closeTimeModal() {
  showTimeModal.value = false
  selectedTimeSlot.value = null
  selectedBedrijfId.value = null
}

function isSlotTaken(slot) {
  if (slot === 'Pauze') return true;
  return takenSlots.value.includes(slot);
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
</script>

<style scoped>
/* =================================== */
/* === MOBILE RESPONSIVE STYLES === */
/* =================================== */

/* Hide mobile elements on desktop by default */
.mobile-header,
.welcome-banner-mobile,
.mobile-sidebar,
.sidebar-overlay {
  display: none;
}

.welcome-avatar {
  width: 2.5rem; /* 40px */
  height: 2.5rem; /* 40px */
  background: rgba(255,255,255,0.6);
  color: #c20000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 600;
  transition: transform 0.18s cubic-bezier(0.4,0,0.2,1), box-shadow 0.18s cubic-bezier(0.4,0,0.2,1);
  cursor: pointer;
  overflow: hidden;
  border: 1.5px solid #222;
  margin-top: -0.625rem;
}

.welcome-avatar:hover {
  transform: scale(1.12);
  box-shadow: 0 4px 16px rgba(194,0,0,0.18);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  /* Hide desktop-specific elements from the layout component */
  :deep(.sidebar-nav),
  :deep(.dashboard-header) {
    display: none !important;
  }

  /* Show mobile-specific elements */
  .mobile-header,
  .welcome-banner-mobile {
    display: flex;
  }

  /* Mobile Header */
  .mobile-header {
    background: #fff;
    padding: 1rem 1.5rem;
    justify-content: space-between;
    align-items: center;
    margin: 1.5rem 1.5rem 0;
    border-radius: 0.75rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }

  .mobile-logo {
    height: 42px;
  }

  .hamburger-menu {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 28px;
    height: 21px;
    z-index: 1002;
  }

  .hamburger-menu span {
    display: block;
    width: 100%;
    height: 3px;
    background-color: #c20000;
    border-radius: 2px;
  }

  /* Mobile Sidebar */
  .mobile-sidebar {
    position: fixed;
    top: 0;
    left: -280px;
    width: 280px;
    height: 100%;
    background: #fff;
    z-index: 1001;
    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid #e5e7eb;
  }

  .mobile-sidebar.is-open {
    left: 0;
  }

  .mobile-sidebar-header {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .sidebar-header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .sidebar-header-logo {
    height: 36px;
  }
  
  .sidebar-header-text h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #111827;
  }
  
  .sidebar-header-text p {
    font-size: 0.9rem;
    color: #6b7280;
  }

  .close-sidebar-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    position: relative;
    align-self: flex-end;
    margin-bottom: 1rem;
  }

  .close-sidebar-btn span {
    display: block;
    position: absolute;
    width: 100%;
    height: 3px;
    background-color: #c20000;
    border-radius: 2px;
    top: 50%;
    left: 0;
  }

  .close-sidebar-btn span:first-child {
    transform: translateY(-50%) rotate(45deg);
  }

  .close-sidebar-btn span:last-child {
    transform: translateY(-50%) rotate(-45deg);
  }

  .mobile-nav {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .mobile-nav-link {
    padding: 0.8rem 1.2rem;
    border-radius: 0.5rem;
    color: #6b7280;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.2s, background-color 0.2s;
  }

  .mobile-nav-link:hover {
    color: #c20000;
  }

  .mobile-nav-link.active-link {
    background: #f3f4f6;
    color: #c20000;
  }

  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }

  /* Welcome Banner */
  .welcome-banner-mobile {
    background: #fff;
    padding: 1.5rem;
    justify-content: space-between;
    align-items: center;
    margin: 1rem 1.5rem;
    border-radius: 0.75rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    position: relative;
  }

  .welcome-title {
    color: #c20000;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .welcome-subtitle {
    color: #6b7280;
    font-size: 0.9rem;
  }

  .profile-dropdown-mobile {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
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

  /* Page specific styles */
  .dashboard-main {
    padding: 0;
    background-color: #f8f9fa;
  }
  .pagina {
    padding: 0 1.5rem 1.5rem;
    background: transparent;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .hoofding {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
    margin: 0;
  }
  .zoekbalk-container, .statistieken {
    margin: 0;
    background: #fff;
    padding: 1.5rem;
    border-radius: 0.75rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }
  .studentenlijst {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    gap: 1rem;
    background: #ffffff;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    border-radius: 0.75rem;
  }
  .student-kaart {
    padding: 1rem;
    border: 1px solid #e5e7eb;
    box-shadow: none;
  }
  .acties {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
  .knop-grijs, .knop-rood {
    justify-content: center;
  }
  .verwijder-btn-rond {
    top: 0.5rem;
    right: 0.5rem;
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
  }
  .status-wacht {
    text-align: center;
    padding: 0.5rem;
    background: #f3f4f6;
    border-radius: 0.5rem;
  }
}

@media (min-width: 769px) {
  .mobile-header,
  .welcome-banner-mobile,
  .mobile-sidebar,
  .sidebar-overlay {
    display: none !important;
  }
}

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
  background: transparent;
  border-radius: 1.25rem;
  box-shadow: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 1.5rem;
}

.student-kaart {
  background: #ffffff;
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
</style>