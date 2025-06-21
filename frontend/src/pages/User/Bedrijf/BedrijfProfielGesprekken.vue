<template>
  <BedrijfDashboardLayout>
    <main class="dashboard-main">
      <section class="dashboard-card">
        <h2 class="subtitel">Geplande Afspraken</h2>
        <p class="aantal-studenten">
          Aantal studenten ingepland: <strong>{{ gesorteerdeGesprekken.length }}</strong>
        </p>
        <div v-if="loading" class="geen-gegevens">Laden...</div>
        <div v-else-if="error" class="geen-gegevens error">{{ error }}</div>
        <div v-else-if="gesorteerdeGesprekken.length === 0" class="geen-gegevens">
          Geen geplande afspraken
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
                <button @click="bekijkProfiel(gesprek.studentId)" class="profielknop">
                  <User class="icoon" />
                  <span>Profiel</span>
                </button>
                <button @click="annuleerGesprek(gesprek.id)" class="annuleerknop">Annuleren</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </BedrijfDashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { CalendarDays, MapPin, Building, User } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore'
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
          locatie: 'Aula B - Stand 14', // of haal uit data
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

const gesorteerdeGesprekken = computed(() =>
  [...gesprekken.value].sort((a, b) => a.tijd.localeCompare(b.tijd))
)

const bekijkProfiel = (studentId) => {
  if (!studentId) {
    alert("Kan profiel niet openen: student ID ontbreekt.");
    return;
  }
  // Navigeer naar de nieuwe, bedrijf-specifieke profielpagina.
  router.push(`/bedrijf/student/${studentId}`);
};

const annuleerGesprek = async (id) => {
  if (!confirm("Weet u zeker dat u deze afspraak wilt annuleren?")) return;
  
  try {
    await deleteDoc(doc(db, "afspraken", id));
    gesprekken.value = gesprekken.value.filter(g => g.id !== id);
    alert("Afspraak succesvol geannuleerd.");
  } catch (e) {
    console.error("Fout bij annuleren van afspraak: ", e);
    alert("Kon de afspraak niet annuleren.");
  }
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

.actie-knoppen {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.profielknop {
  background-color: #c82333; /* Rood */
  color: white;
  border: none;
  padding: 0.4rem 0.8rem; /* Iets kleiner gemaakt */
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
  font-size: 0.875rem; /* Kleinere tekst */
}

.profielknop:hover {
  background-color: #a21b29; /* Donkerder rood */
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

.error {
  color: red;
}
</style>
  