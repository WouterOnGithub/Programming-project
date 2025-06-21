<template>
  <BedrijfDashboardLayout>
    <main class="dashboard-main">
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { CalendarDays, MapPin, Building, User } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, query, where, getDocs, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore'
import BedrijfDashboardLayout from '../../../components/BedrijfDashboardLayout.vue'

const navigation = [
  { name: 'Dashboard', href: '/bedrijf/dashboard' },
  { name: 'Favorieten', href: '/bedrijf/favorieten' },
  { name: 'Gesprekken', href: '/GesprekkenBd' },
  { name: 'Profiel', href: '/bedrijf/profiel' },
]

const showDropdown = ref(false)
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

        if (tijdString.includes(' - ')) {
          const [start, end] = tijdString.split(' - ').map(t => t.trim());
          const startDate = new Date(`1970-01-01T${start}`);
          const endDate = new Date(`1970-01-01T${end}`);
          if (!isNaN(startDate) && !isNaN(endDate)) {
            const diffInMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
            duurString = `${diffInMinutes} min`;
          }
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
          domein: studentData.domein?.join(', ') || 'Geen domein',
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
  [...gefilterdeGesprekken.value].sort((a, b) => a.tijd.localeCompare(b.tijd))
);

const setFilter = (filter) => {
  activeFilter.value = filter;
};

const bekijkProfiel = (studentId) => {
  if (!studentId) {
    alert("Kan profiel niet openen: student ID ontbreekt.");
    return;
  }
  // Navigeer naar de nieuwe, bedrijf-specifieke profielpagina.
  router.push(`/bedrijf/student/${studentId}`);
};

const markeerAlsAfgerond = async (id) => {
  try {
    const afspraakRef = doc(db, "afspraken", id);
    await updateDoc(afspraakRef, {
      status: 'afgerond'
    });
    // Update de lokale state om de UI direct bij te werken
    const index = gesprekken.value.findIndex(g => g.id === id);
    if (index !== -1) {
      gesprekken.value[index].status = 'afgerond';
    }
  } catch (e) {
    console.error("Fout bij bijwerken van afspraak: ", e);
    alert("Kon de status van de afspraak niet bijwerken.");
  }
};

const openAnnuleerModal = (id) => {
  afspraakVoorAnnuleringId.value = id;
  annuleerReden.value = '';
  annuleerError.value = '';
  showAnnuleerModal.value = true;
};

const closeAnnuleerModal = () => {
  showAnnuleerModal.value = false;
  afspraakVoorAnnuleringId.value = null;
  annuleerReden.value = '';
  annuleerError.value = '';
};

const bevestigAnnulering = async () => {
  if (!annuleerReden.value.trim()) {
    annuleerError.value = "Een reden opgeven is verplicht.";
    return;
  }
  
  try {
    const afspraakRef = doc(db, "afspraken", afspraakVoorAnnuleringId.value);
    await updateDoc(afspraakRef, {
      status: 'geannuleerd',
      annuleringsReden: annuleerReden.value
    });
    
    // Update de lokale state
    const index = gesprekken.value.findIndex(g => g.id === afspraakVoorAnnuleringId.value);
    if (index !== -1) {
      gesprekken.value[index].status = 'geannuleerd';
    }
    
    closeAnnuleerModal();
  } catch (e) {
    console.error("Fout bij annuleren van afspraak: ", e);
    annuleerError.value = "Kon de afspraak niet annuleren.";
  }
};

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
  font-size: 1rem;
  color: #374151;
  margin-bottom: 1rem;
}

.geen-gegevens {
  text-align: center;
  padding: 3rem;
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

.actie-knoppen {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.profielknop {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: #fff;
  font-weight: 500;
  cursor: pointer;
}

.profielknop .icoon {
  width: 1rem;
  height: 1rem;
}

.actieknop {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.actieknop.voltooi {
  background-color: #dcfce7;
  color: #166534;
}

.actieknop.voltooi:hover {
  background-color: #bbf7d0;
}

.actieknop.annuleer {
  background-color: #fee2e2;
  color: #991b1b;
}

.actieknop.annuleer:hover {
  background-color: #fecaca;
}

.status-badge.afgerond {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background-color: #e5e7eb;
  color: #4b5563;
  font-weight: 500;
  text-align: center;
}

.status-badge.geannuleerd {
  background-color: #fef2f2;
  color: #ef4444;
  border: 1px solid #ef4444;
}

.error {
  color: red;
}

/* Modal Stijlen */
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
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  width: 90%;
  max-width: 500px;
}
.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 0.5rem;
}
.modal-content p {
  margin-bottom: 1.5rem;
  color: #4b5563;
}
.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
}
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  resize: vertical;
}
.error-text {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.action-btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.2s, box-shadow 0.2s;
}

.btn-cancel-edit {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-cancel-edit:hover {
  background-color: #e5e7eb;
}

.btn-confirm-annuleer {
  background-color: #ef4444;
  color: white;
}

.btn-confirm-annuleer:hover {
  background-color: #dc2626;
}

.btn-confirm-annuleer:disabled {
  background-color: #fca5a5;
  cursor: not-allowed;
}

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-knoppen {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-start;
}

.filter-knop {
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background-color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.filter-knop.actief {
  background-color: #c20000;
  color: white;
  border-color: #c20000;
}

.filter-knop:not(.actief):hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.cancellation-reason {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  width: 100%;
  text-align: left;
}
.reason-header {
  font-weight: 600;
  color: #b91c1c;
  margin-bottom: 0.25rem;
}
.reason-text {
  margin: 0;
  color: #dc2626;
  font-style: italic;
  font-size: 0.9rem;
}
</style>
  