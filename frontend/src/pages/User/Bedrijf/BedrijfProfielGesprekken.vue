<template>
  <BedrijfDashboardLayout>
    <main class="dashboard-main">
      <!-- Mobile-only header -->
      <header class="mobile-header">
        <img src="/Images/ehb-logo.png" alt="EhB Logo" class="mobile-logo" />
        <button @click="toggleMobileSidebar" class="hamburger-menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      <section class="dashboard-card">
        <div class="header-flex">
          <div>
            <h2 class="subtitel">Geplande Afspraken</h2>
            <p class="aantal-studenten">
              Aantal studenten: <strong>{{ gesorteerdeGesprekken.length }}</strong>
            </p>
          </div>
          <div class="filter-knoppen">
            <button @click="setFilter('all')" :class="['filter-knop', { 'actief': activeFilter === 'all' }]">Alle</button>
            <button @click="setFilter('upcoming')" :class="['filter-knop', { 'actief': activeFilter === 'upcoming' }]">Komend</button>
            <button @click="setFilter('afgerond')" :class="['filter-knop', { 'actief': activeFilter === 'afgerond' }]">Afgerond</button>
            <button @click="setFilter('geannuleerd')" :class="['filter-knop', { 'actief': activeFilter === 'geannuleerd' }]">Geannuleerd</button>
          </div>
        </div>
        
        <div v-if="loading" class="geen-gegevens">Laden...</div>
        <div v-else-if="error" class="geen-gegevens error">{{ error }}</div>
        <div v-else-if="gesorteerdeGesprekken.length === 0" class="geen-gegevens">
          Geen afspraken die voldoen aan dit filter.
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
              <div class="actie-knoppen">
                <template v-if="gesprek.status === 'upcoming'">
                  <button @click="bekijkProfiel(gesprek.studentId)" class="profielknop">
                    <User class="icoon" />
                    <span>Profiel</span>
                  </button>
                  <button @click="markeerAlsAfgerond(gesprek.id)" class="actieknop voltooi">
                    ✓ Afgerond
                  </button>
                  <button @click="openAnnuleerModal(gesprek.id)" class="actieknop annuleer">Annuleren</button>
                </template>
                <template v-else-if="gesprek.status === 'geannuleerd'">
                  <div class="cancellation-reason">
                    <div class="reason-header">Geannuleerd:</div>
                    <p class="reason-text">"{{ gesprek.annuleringsReden }}"</p>
                  </div>
                </template>
                <template v-else>
                  <div class="status-badge afgerond">
                    ✓ Gesprek Afgerond
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </BedrijfDashboardLayout>

  <!-- Annuleer Modal -->
  <div v-if="showAnnuleerModal" class="modal-overlay">
    <div class="modal-content">
      <h3 class="modal-title">Afspraak Annuleren</h3>
      <p>Weet u zeker dat u deze afspraak wilt annuleren? Geef hieronder een reden op voor de student.</p>
      <div class="form-group">
        <label for="annuleerReden">Reden voor annulering (verplicht)</label>
        <textarea id="annuleerReden" v-model="annuleerReden" rows="4" placeholder="Bijv. wegens onvoorziene omstandigheden..."></textarea>
        <p v-if="annuleerError" class="error-text">{{ annuleerError }}</p>
      </div>
      <div class="modal-actions">
        <button class="action-btn btn-cancel-edit" @click="closeAnnuleerModal">Terug</button>
        <button class="action-btn btn-confirm-annuleer" @click="bevestigAnnulering" :disabled="!annuleerReden.trim()">
          Annulering Bevestigen
        </button>
      </div>
    </div>
  </div>

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
          <p>Bedrijfsdashboard</p>
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { CalendarDays, MapPin, Building, User } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, query, where, getDocs, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore'
import BedrijfDashboardLayout from '../../../components/BedrijfDashboardLayout.vue'

const route = useRoute()
const isMobileSidebarOpen = ref(false)

const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value
}

const navigation = [
  { name: 'Dashboard', href: '/BedrijfDashboard' },
  { name: 'Afspraken', href: '/GesprekkenBd' },
  { name: 'Matches', href: '/bedrijfmatch'},
  { name: 'Profiel', href: '/WeergaveBd' },
  { name: 'Instellingen', href: '/SettingsBe' },
]

const router = useRouter()
const db = getFirestore()
const auth = getAuth()

const gesprekken = ref([])
const loading = ref(true)
const error = ref(null)
const showAnnuleerModal = ref(false)
const afspraakVoorAnnuleringId = ref(null)
const annuleerReden = ref('')
const annuleerError = ref('')
const activeFilter = ref('all')

onMounted(async () => {
  const user = auth.currentUser;
  if (!user) {
    error.value = "U moet ingelogd zijn om afspraken te bekijken.";
    loading.value = false;
    return;
  }
  const bedrijfId = user.uid;

  try {
    loading.value = true;
    const afsprakenQuery = query(collection(db, "afspraken"), where("bedrijfId", "==", bedrijfId));
    const afsprakenSnap = await getDocs(afsprakenQuery);

    if (afsprakenSnap.empty) {
      gesprekken.value = [];
      loading.value = false;
      return;
    }

    const afsprakenPromises = afsprakenSnap.docs
      .filter(doc => {
        const data = doc.data();
        if (!data.studentUid) {
          console.warn(`Afspraak document ${doc.id} wordt overgeslagen omdat het geen studentUid heeft.`);
          return false;
        }
        return true;
      })
      .map(async (afspraakDoc) => {
        const afspraakData = afspraakDoc.data();
        
        // Bereken duur en haal tijd op
        const tijdString = afspraakData.time || 'N/A';
        let duurString = 'N/A';

        // Haal bedrijfsgegevens op voor duur
        const bedrijfDocRef = doc(db, 'bedrijf', bedrijfId);
        const bedrijfSnap = await getDoc(bedrijfDocRef);
        if (bedrijfSnap.exists()) {
          duurString = bedrijfSnap.data().gesprekDuur || 'N/A';
        }
        
        // Haal studentgegevens op
        const studentDocRef = doc(db, 'student', afspraakData.studentUid);
        const studentSnap = await getDoc(studentDocRef);
        const studentData = studentSnap.exists() ? studentSnap.data() : {};

        return {
          id: afspraakDoc.id,
          studentId: afspraakData.studentUid,
          tijd: tijdString,
          student: `${studentData.voornaam || 'Onbekende'} ${studentData.achternaam || 'Student'}`,
          duur: duurString,
          domein: Array.isArray(studentData.domein) ? studentData.domein.join(', ') : (studentData.domein || 'Geen domein'),
          studiejaar: studentData.studiejaar || 'N/A',
          locatie: 'Aula B - Stand 14',
          status: afspraakData.status || 'upcoming',
          annuleringsReden: afspraakData.annuleringsReden || 'Geen reden opgegeven.'
        };
      });

    gesprekken.value = await Promise.all(afsprakenPromises);

  } catch (e) {
    console.error("Fout bij ophalen van afspraken: ", e);
    error.value = "Kon de afspraken niet laden.";
  } finally {
    loading.value = false;
  }
});

const gefilterdeGesprekken = computed(() => {
  if (activeFilter.value === 'all') {
    return gesprekken.value;
  }
  return gesprekken.value.filter(g => g.status === activeFilter.value);
});

const gesorteerdeGesprekken = computed(() =>
  [...gefilterdeGesprekken.value].sort((a, b) => {
    // Sorteer eerst op status ('upcoming' eerst)
    if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
    if (a.status !== 'upcoming' && b.status === 'upcoming') return 1;
    // Sorteer daarna op tijd
    return a.tijd.localeCompare(b.tijd);
  })
);

const bekijkProfiel = (studentId) => {
  router.push({ name: 'StudentProfielVoorBedrijf', params: { id: studentId } })
}

const openAnnuleerModal = (afspraakId) => {
  afspraakVoorAnnuleringId.value = afspraakId;
  annuleerReden.value = '';
  annuleerError.value = '';
  showAnnuleerModal.value = true;
};

const closeAnnuleerModal = () => {
  showAnnuleerModal.value = false;
};

const bevestigAnnulering = async () => {
  if (!annuleerReden.value.trim()) {
    annuleerError.value = 'Een reden is verplicht.';
    return;
  }
  
  const afspraakId = afspraakVoorAnnuleringId.value;
  try {
    const afspraakDocRef = doc(db, 'afspraken', afspraakId);
    await updateDoc(afspraakDocRef, {
      status: 'geannuleerd',
      annuleringsReden: annuleerReden.value
    });
    
    // Update de lokale data
    const index = gesprekken.value.findIndex(g => g.id === afspraakId);
    if (index !== -1) {
      gesprekken.value[index].status = 'geannuleerd';
      gesprekken.value[index].annuleringsReden = annuleerReden.value;
    }
    closeAnnuleerModal();
  } catch (error) {
    console.error("Fout bij annuleren afspraak:", error);
    annuleerError.value = 'Kon de afspraak niet annuleren. Probeer het opnieuw.';
  }
};

const markeerAlsAfgerond = async (id) => {
  try {
    await updateDoc(doc(db, 'afspraken', id), {
      status: 'afgerond'
    });
    const index = gesprekken.value.findIndex(g => g.id === id);
    if (index !== -1) {
      gesprekken.value[index].status = 'afgerond';
    }
  } catch (err) {
    console.error("Fout bij markeren als afgerond:", err);
  }
}

const setFilter = (filter) => {
  activeFilter.value = filter;
};
</script>

<style scoped>
/* Stijlen voor mobiel en desktop, inclusief de nieuwe responsive code */
.dashboard-main {
  padding: 1rem;
  background: #f8f9fa;
  flex: 1;
}

.dashboard-card {
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.subtitel {
  font-size: 1.5rem;
  font-weight: 600;
  color: #c20000;
  margin: 0;
}

.aantal-studenten {
  color: #6b7280;
}

.filter-knoppen {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-knop {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 999px;
  background-color: #fff;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-knop:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.filter-knop.actief {
  background-color: #c20000;
  color: #fff;
  border-color: #c20000;
}

.geen-gegevens {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.geen-gegevens.error {
  color: #ef4444;
}

.lijst {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.kaart {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.kaart:hover {
  border-color: #c20000;
  box-shadow: 0 4px 12px rgba(194,0,0,0.1);
}

.rij {
  display: flex;
  align-items: center;
}

.ruimte-tussen {
  justify-content: space-between;
}

.ruimte {
  gap: 1rem;
}

.mb {
  margin-bottom: 0.5rem;
}

.flex-1 {
  flex: 1;
}

.tijd-label {
  background: #fff5f5;
  color: #c20000;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
}

.naam {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.duur {
  font-size: 0.9rem;
  color: #6b7280;
}

.richting {
  font-size: 0.9rem;
  color: #4b5563;
}

.locatie {
  color: #6b7280;
  gap: 0.5rem;
}

.locatie .icoon {
  width: 1rem;
  height: 1rem;
}

.actie-knoppen {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.actieknop, .profielknop {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid transparent;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.profielknop {
  background: #f3f4f6;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.profielknop .icoon {
  width: 1rem;
  height: 1rem;
}

.profielknop:hover {
  background: #e5e7eb;
}

.actieknop.voltooi {
  background: #dcfce7;
  color: #166534;
}

.actieknop.voltooi:hover {
  background: #bbf7d0;
}

.actieknop.annuleer {
  background: #fee2e2;
  color: #991b1b;
}

.actieknop.annuleer:hover {
  background: #fecaca;
}

.status-badge.afgerond {
  background: #dcfce7;
  color: #166534;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
}

.cancellation-reason {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 1rem;
  max-width: 250px;
}

.reason-header {
  font-weight: 600;
  color: #b91c1c;
  margin-bottom: 0.5rem;
}

.reason-text {
  margin: 0;
  color: #dc2626;
  font-style: italic;
  font-size: 0.9rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
}
.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #c20000;
  margin-bottom: 1rem;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
}
.error-text {
  color: #ef4444;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}
.action-btn {
  padding: 0.6rem 1.2rem;
  border: 1px solid;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-cancel-edit {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #374151;
}
.btn-cancel-edit:hover {
  background: #e5e7eb;
}
.btn-confirm-annuleer {
  background: #c20000;
  border-color: #c20000;
  color: #fff;
}
.btn-confirm-annuleer:disabled {
  background: #e5e7eb;
  border-color: #e5e7eb;
  cursor: not-allowed;
}
.btn-confirm-annuleer:not(:disabled):hover {
  background: #a50000;
}

/* Responsive & Mobile Styles */
.mobile-header, .mobile-sidebar, .sidebar-overlay { display: none; }

@media (max-width: 768px) {
  :deep(.sidebar-nav), :deep(.dashboard-header) {
    display: none !important;
  }
  .mobile-header, .mobile-sidebar {
    display: flex;
  }
  .dashboard-main {
    display: flex;
    flex-direction: column;
    padding: 0;
    background-color: #f8f9fa;
    gap: 1rem;
  }
  .mobile-header {
    background: #fff;
    padding: 1rem 1.5rem;
    justify-content: space-between;
    align-items: center;
    margin: 1.5rem 1.5rem 0;
    border-radius: 0.75rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }
  .mobile-logo { height: 42px; }
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
  .mobile-sidebar {
    position: fixed;
    top: 0;
    left: -280px;
    width: 280px;
    height: 100%;
    background: #fff;
    z-index: 1001;
    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    flex-direction: column;
    border-right: 1px solid #e5e7eb;
  }
  .mobile-sidebar.is-open { left: 0; }
  .mobile-sidebar-header {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }
  .sidebar-header-content { display: flex; align-items: center; gap: 1rem; }
  .sidebar-header-logo { height: 36px; }
  .sidebar-header-text h3 { font-size: 1.2rem; font-weight: 600; color: #111827; }
  .sidebar-header-text p { font-size: 0.9rem; color: #6b7280; }
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
    height: 2.5px;
    background-color: #c20000;
    border-radius: 2px;
    top: 50%;
    left: 0;
  }
  .close-sidebar-btn span:first-child { transform: translateY(-50%) rotate(45deg); }
  .close-sidebar-btn span:last-child { transform: translateY(-50%) rotate(-45deg); }
  .mobile-nav { padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
  .mobile-nav-link {
    padding: 0.8rem 1.2rem;
    border-radius: 0.5rem;
    color: #6b7280;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s;
  }
  .mobile-nav-link:hover { color: #c20000; background-color: #f3f4f6; }
  .mobile-nav-link.active-link { background: #f3f4f6; color: #c20000; font-weight: 600; }
  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 1000;
    display: none;
  }
  .mobile-sidebar.is-open + .sidebar-overlay { display: block; }
  
  .dashboard-card {
    margin: 0 1.5rem 1.5rem;
    border-radius: 0.75rem;
    padding: 1.5rem;
  }
  .header-flex { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .rij.ruimte-tussen { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .actie-knoppen { align-items: flex-start; width: 100%; }
  .actie-knoppen > * { width: 100%; text-align: center; }
  .profielknop { justify-content: center; }
  .cancellation-reason { max-width: 100%; }
}

@media (min-width: 769px) {
  .mobile-header, .mobile-sidebar, .sidebar-overlay { display: none !important; }
}
</style>
  
  