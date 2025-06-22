<template>
  <BedrijfDashboardLayout>
    <!-- Mobile View -->
    <div class="mobile-view">
      <!-- Verification Status Banner -->
      <div v-if="verificatieStatus !== 'goedgekeurd'" class="verification-banner-mobile">
        <div v-if="verificatieStatus === 'wachtend op verificatie'" class="status-pending">
          ⏳ Wacht op verificatie...
        </div>
        <div v-else-if="verificatieStatus === 'geweigerd'" class="status-rejected">
          ❌ Geweigerd: {{ afwijzingsreden || 'Geen reden' }}
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="mobile-stats-grid">
        <div v-for="stat in statsData" :key="stat.title" class="mobile-stat-card">
          <i :class="[stat.icon, 'stat-icon-mobile']"></i>
          <span class="stat-title-mobile">{{ stat.title }}</span>
          <span class="stat-value-mobile">{{ stat.value }}</span>
        </div>
      </div>

      <!-- Interested Students -->
      <div class="mobile-card">
        <h3 class="mobile-card-header">Geïnteresseerde Studenten</h3>
        <ul v-if="displayedStudents.length > 0">
          <li v-for="student in displayedStudents" :key="student.id">{{ student.name }}</li>
        </ul>
        <p v-else class="no-data-mobile">Nog geen studenten gematched.</p>
        <button v-if="interestedStudents.length > 3" @click="goToMatches" class="meer-zien-knop-mobile">Meer Zien &rarr;</button>
      </div>

      <!-- Appointments -->
      <div class="mobile-card">
        <h3 class="mobile-card-header">Geplande Afspraken</h3>
        <div v-if="displayedAfspraken.length > 0">
          <div v-for="afspraak in displayedAfspraken" :key="afspraak.id" class="mobile-afspraak-item">
            <span>{{ afspraak.studentNaam }} - {{ afspraak.displayTime }}</span>
            <button @click="bekijkProfiel(afspraak.studentId)" class="profiel-knop-mobile">Profiel</button>
          </div>
        </div>
        <p v-else class="no-data-mobile">Nog geen afspraken gepland.</p>
        <button v-if="geplandeAfspraken.length > 3" @click="goToGesprekken" class="meer-zien-knop-mobile">Alle afspraken &rarr;</button>
      </div>
    </div>

    <!-- Desktop content -->
    <main class="dashboard-main desktop-view">
      <!-- Verification Status Banner -->
      <div v-if="verificatieStatus !== 'goedgekeurd'" class="verification-banner">
        <div v-if="verificatieStatus === 'wachtend op verificatie'" class="status-pending">
          ⏳ Uw bedrijf wacht op verificatie. U heeft beperkte toegang tot functies.
        </div>
        <div v-else-if="verificatieStatus === 'geweigerd'" class="status-rejected">
          ❌ Uw bedrijf is geweigerd. Reden: {{ afwijzingsreden || 'Geen reden opgegeven' }}
        </div>
      </div>
 
      <!-- Statistieken -->
      <section class="dashboard-stats">
        <component v-for="(stat, index) in statsData"
          :key="index"
          :is="stat.isLink ? 'router-link' : 'div'"
          :to="stat.path"
          class="stat-wrapper"
          :class="{ 'is-link': stat.isLink }"
          >
          <div class="stat-card">
            <div class="stat-card-top">
              <div>
                <p class="stat-label">{{ stat.title }}</p>
                <p class="stat-value">{{ stat.value }}</p>
              </div>
              <div :class="['stat-icon', stat.color]">
                <i :class="stat.icon"></i>
              </div>
            </div>
            <p v-if="stat.change" class="stat-change">{{ stat.change }}</p>
          </div>
        </component>
      </section>
      <!-- 2 kolommen: studenten + activiteit -->
      <section class="dashboard-2col">
        <div class="dashboard-card">
          <div class="dashboard-card-header">
            <h3>Geïnteresseerde Studenten (Matches)</h3>
            <i class="fas fa-user-graduate"></i>
          </div>
          <ul v-if="displayedStudents.length > 0" class="dashboard-todos">
            <li v-for="student in displayedStudents" :key="student.id" class="todo-item">
              {{ student.name }} – {{ student.study }}
            </li>
          </ul>
          <div v-if="loadingStudents" class="no-data">
            Matches laden...
          </div>
          <div v-else-if="interestedStudents.length === 0" class="no-data">
            Nog geen studenten gematched.
          </div>
          <div v-if="interestedStudents.length > 3" class="meer-zien-container">
            <button @click="goToMatches" class="meer-zien-knop">Meer Zien &rarr;</button>
          </div>
        </div>
        <div class="dashboard-card">
          <div class="dashboard-card-header">
            <h3>Geplande Afspraken</h3>
            <i class="fas fa-calendar-check"></i>
          </div>
          <div v-if="displayedAfspraken.length > 0" class="afspraken-lijst">
            <div v-for="afspraak in displayedAfspraken" :key="afspraak.id" class="afspraak-item">
              <div class="afspraak-info">
                <span class="student-naam">{{ afspraak.studentNaam }}</span>
                <span class="afspraak-tijd">{{ afspraak.displayTime }}</span>
              </div>
              <button @click="bekijkProfiel(afspraak.studentId)" class="profiel-knop">
                Bekijk Profiel
              </button>
            </div>
          </div>
          <div v-if="loadingAfspraken" class="no-data">
            Afspraken laden...
          </div>
          <div v-else-if="geplandeAfspraken.length === 0" class="no-data">
            Nog geen afspraken gepland.
          </div>
          <div v-if="geplandeAfspraken.length > 3" class="meer-zien-container">
            <button @click="goToGesprekken" class="meer-zien-knop">Alle afspraken &rarr;</button>
          </div>
        </div>
      </section>
    </main>
  </BedrijfDashboardLayout>
</template>
 
<script setup>
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue'
import BedrijfDashboardLayout from '../../../components/BedrijfDashboardLayout.vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { auth, db } from '../../../firebase/config'
import { doc, onSnapshot, collection, query, where, getDocs, getDoc, orderBy } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
 
const toast = useToast()
const router = useRouter()
 
// Add verification status tracking
const verificatieStatus = ref('wachtend op verificatie')
const afwijzingsreden = ref('')
 
// Reactive current user
const currentUser = ref(null)
const interestedStudents = ref([])
const loadingStudents = ref(true)
const geplandeAfspraken = ref([])
const loadingAfspraken = ref(true)
const locatieGegevens = ref(null)
 
let authListenerUnsubscribe = null;
let companyListenerUnsubscribe = null;
let locatieListenerUnsubscribe = null;
 
const displayedStudents = computed(() => interestedStudents.value.slice(0, 3))
const displayedAfspraken = computed(() => geplandeAfspraken.value.slice(0, 3))
 
const goToMatches = () => {
  router.push('/bedrijfmatch')
}
 
const bekijkProfiel = (studentId) => {
  if (!studentId) {
    toast.error("Student ID ontbreekt, kan profiel niet openen.");
    return;
  }
  router.push(`/bedrijf/student/${studentId}`);
}
 
const goToGesprekken = () => {
  router.push('/GesprekkenBd')
}
 
const formatTijd = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return 'Onbekende tijd'
  return timestamp.toDate().toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })
}
 
const setupCompanyListener = (userId) => {
  // Ruim eventuele vorige listener op
  if (companyListenerUnsubscribe) {
    companyListenerUnsubscribe();
  }
 
  console.log('Setting up company listener for:', userId)
 
  const companyRef = doc(db, 'bedrijf', userId)
  companyListenerUnsubscribe = onSnapshot(companyRef, (doc) => {
    if (doc.exists()) {
      console.log('Company data received:', doc.data())
      const data = doc.data()
      verificatieStatus.value = data.verificatieStatus || 'wachtend op verificatie'
      afwijzingsreden.value = data.afwijzingsreden || ''
    } else {
      console.log('No company document found for:', userId)
    }
  }, (error) => {
    console.error('Error listening to company data:', error)
  })
}
 
const fetchInterestedStudents = async (bedrijfId) => {
  if (!bedrijfId) return
  loadingStudents.value = true
  try {
    // Aanname: er is een 'matches' collectie waar matches worden opgeslagen.
    // Dit is een efficiëntere manier dan alle studenten doorzoeken.
    const matchesQuery = query(collection(db, 'matches'), where('bedrijfId', '==', bedrijfId))
    const matchesSnap = await getDocs(matchesQuery)
 
    if (matchesSnap.empty) {
      interestedStudents.value = []
      return
    }
 
    const studentPromises = matchesSnap.docs.map(async (matchDoc) => {
      const matchData = matchDoc.data()
      const studentDoc = await getDoc(doc(db, 'student', matchData.studentId))
      if (studentDoc.exists()) {
        const studentData = studentDoc.data()
        return {
          id: studentDoc.id,
          name: `${studentData.voornaam || ''} ${studentData.achternaam || ''}`.trim(),
          study: (studentData.domein && studentData.domein.length > 0) ? studentData.domein.join(', ') : 'Onbekend'
        }
      }
      return null
    })
 
    interestedStudents.value = (await Promise.all(studentPromises)).filter(Boolean)
 
  } catch (error) {
    console.error("Fout bij ophalen van geïnteresseerde studenten:", error)
    toast.error("Kon gematchte studenten niet laden.")
  } finally {
    loadingStudents.value = false
  }
}
 
const fetchGeplandeAfspraken = async (bedrijfId) => {
  if (!bedrijfId) return;
  loadingAfspraken.value = true;
  try {
    // Query aangepast om alle afspraken op te halen, zoals op GesprekkenBd
    const afsprakenQuery = query(
      collection(db, "afspraken"),
      where("bedrijfId", "==", bedrijfId)
    );
    const afsprakenSnap = await getDocs(afsprakenQuery);
 
    if (afsprakenSnap.empty) {
      geplandeAfspraken.value = [];
      loadingAfspraken.value = false;
      return;
    }
 
    const afsprakenPromises = afsprakenSnap.docs.map(async (afspraakDoc) => {
      const afspraakData = afspraakDoc.data();
     
      // Stop als er geen student gekoppeld is
      if (!afspraakData.studentUid) {
        console.warn(`Afspraak document ${afspraakDoc.id} wordt overgeslagen omdat studentUid ontbreekt.`);
        return null;
      }
 
      let normalizedStartTime;
      let displayTime;
 
      // Logica om zowel nieuwe (tijdslot) als oude (time) data te verwerken
      if (afspraakData.tijdslot && afspraakData.tijdslot.startTime) {
          normalizedStartTime = afspraakData.tijdslot.startTime.toDate();
          displayTime = normalizedStartTime.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
      } else if (afspraakData.time && afspraakData.aangemaaktOp) {
          const datePart = afspraakData.aangemaaktOp.toDate();
          const timePart = afspraakData.time.split(' - ')[0].trim();
          const [hours, minutes] = timePart.split(':');
         
          normalizedStartTime = new Date(datePart);
          normalizedStartTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
         
          displayTime = afspraakData.time; // Toon "10:00 - 10:15"
      } else {
          console.warn(`Afspraak document ${afspraakDoc.id} wordt overgeslagen omdat tijdinformatie (tijdslot of time/aangemaaktOp) ontbreekt.`);
          return null;
      }
 
      // Haal studentgegevens op
      const studentDocRef = doc(db, 'student', afspraakData.studentUid);
      const studentSnap = await getDoc(studentDocRef);
      const studentData = studentSnap.exists() ? studentSnap.data() : {};
 
      return {
        id: afspraakDoc.id,
        studentId: afspraakData.studentUid,
        studentNaam: `${studentData.voornaam || 'Onbekende'} ${studentData.achternaam || 'Student'}`,
        normalizedStartTime: normalizedStartTime,
        displayTime: displayTime
      };
    });
 
    // Filter null values eruit en sla alle afspraken op
    const alleAfspraken = (await Promise.all(afsprakenPromises)).filter(Boolean);
 
    // Sorteer de afspraken lokaal op de genormaliseerde starttijd
    alleAfspraken.sort((a, b) => a.normalizedStartTime - b.normalizedStartTime);
 
    geplandeAfspraken.value = alleAfspraken;
   
  } catch (error) {
    console.error("Fout bij ophalen van afspraken:", error);
    toast.error("Kon de geplande afspraken niet laden.");
    geplandeAfspraken.value = []; // Zorg ervoor dat de lijst leeg is bij een fout
  } finally {
    loadingAfspraken.value = false;
  }
};
 
const fetchAppointmentCount = async (bedrijfId) => {
  if (!bedrijfId) return;
  try {
    const afsprakenQuery = query(collection(db, "afspraken"), where("bedrijfId", "==", bedrijfId));
    const afsprakenSnap = await getDocs(afsprakenQuery);
   
    const afsprakenStat = statsData.value.find(stat => stat.id === 'afspraken');
    if (afsprakenStat) {
      afsprakenStat.value = afsprakenSnap.size.toString();
    }
  } catch (error) {
    console.error("Fout bij ophalen van aantal afspraken:", error);
  }
};
 
// Nieuwe functie: realtime locatie listener
const setupLocatieListener = (bedrijfId) => {
  if (locatieListenerUnsubscribe) {
    locatieListenerUnsubscribe();
  }
  const locQuery = query(collection(db, 'companyLocations'), where('companyId', '==', bedrijfId));
  locatieListenerUnsubscribe = onSnapshot(locQuery, (locSnap) => {
    const locatieStat = statsData.value.find(s => s.id === 'locatie');
    if (!locSnap.empty) {
      const locationData = locSnap.docs[0].data();
      locatieGegevens.value = locationData;
      if (locatieStat) {
        locatieStat.value = `${locationData.locationName || 'Onbekend'}`;
        locatieStat.isLink = true;
        locatieStat.path = '/bedrijf/grondplan';
        locatieStat.color = 'text-purple-600';
        locatieStat.change = 'Zien op grondplan';
      }
    } else {
      locatieGegevens.value = null;
      if (locatieStat) {
        locatieStat.value = 'Nog niet toegewezen door de school';
        locatieStat.isLink = false;
        locatieStat.path = null;
        locatieStat.change = '';
      }
    }
  }, (error) => {
    console.error('Fout bij realtime locatie ophalen:', error);
    locatieGegevens.value = null;
    const locatieStat = statsData.value.find(s => s.id === 'locatie');
     if (locatieStat) {
      locatieStat.value = 'Fout bij laden';
      locatieStat.isLink = false;
      locatieStat.path = null;
     }
  });
}
 
onMounted(() => {
  console.log('BedrijfDashboard mounted')
 
  authListenerUnsubscribe = onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed:', user);
    currentUser.value = user;
    if (user) {
      console.log('User logged in:', user.uid)
      setupCompanyListener(user.uid)
      fetchInterestedStudents(user.uid)
      fetchGeplandeAfspraken(user.uid)
      setupLocatieListener(user.uid)
      fetchAppointmentCount(user.uid)
    } else {
      console.log('No user logged in');
      // Ruim data en listeners op als gebruiker uitlogt
      if (companyListenerUnsubscribe) companyListenerUnsubscribe();
      if (locatieListenerUnsubscribe) locatieListenerUnsubscribe();
      interestedStudents.value = [];
      geplandeAfspraken.value = [];
      locatieGegevens.value = null;
     
      const afsprakenStat = statsData.value.find(s => s.id === 'afspraken');
      if (afsprakenStat) {
        afsprakenStat.value = '0';
      }
 
      const locatieStat = statsData.value.find(s => s.id === 'locatie');
      if(locatieStat) {
        locatieStat.value = 'Laden...';
        locatieStat.isLink = false;
      }
    }
  });
})
 
onBeforeUnmount(() => {
  console.log("Cleaning up BedrijfDashboard listeners.");
  if (authListenerUnsubscribe) {
    authListenerUnsubscribe();
  }
  if (companyListenerUnsubscribe) {
    companyListenerUnsubscribe();
  }
  if (locatieListenerUnsubscribe) {
    locatieListenerUnsubscribe();
  }
});
 
const navigation = [
  { name: 'Dashboard', href: '/BedrijfDashboard', icon: 'fas fa-chart-pie' },
  { name: 'Favorieten', href: '/bedrijf/favorieten', icon: 'fas fa-envelope' },
  { name: 'Matches', href: '/bedrijfmatch'},
  { name: 'Gesprekken', href: '/bedrijf/gesprekken', icon: 'fas fa-calendar' },
  { name: 'Favorieten', href: '/Favorietenbd', icon: 'fas fa-envelope' },
  { name: 'Gesprekken', href: '/GesprekkenBd', icon: 'fas fa-calendar' },
  { name: 'Profiel', href: '/bedrijf/profiel', icon: 'fas fa-user' },
  { name: 'Instellingen', href: '/SettingsBe', icon: 'fas fa-cog' }
]
 
const userData = ref({ companyName: 'Cronos' })
 
const statsData = ref([
  {
    id: 'event-date',
    title: 'Eventdatum',
    value: '13 maart 2026',
    icon: 'fas fa-calendar-alt',
    color: 'text-purple-600',
    action: () => {}
  },
  {
    id: 'afspraken',
    title: 'Geplande Afspraken',
    value: '0',
    change: '',
    trend: 'neutral',
    icon: 'fas fa-calendar-check',
    color: 'text-orange-600',
  },
  {
    id: 'locatie',
    title: 'Mijn locatie op de beurs',
    value: 'Laden...',
    change: '',
    trend: 'neutral',
    icon: 'fas fa-map-marker-alt',
    color: 'text-gray-400',
    isLink: false,
    path: null
  },
])
</script>
 
<style scoped>
/* Add new styles for notification integration */
.dashboard-header-with-notifications {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem 2rem;
}
 
.dashboard-header-content h1 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #c20000;
  margin: 0;
}
 
.dashboard-header-content p {
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0;
}
 
.dashboard-header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}
 
/* Verification status banner styles */
.verification-banner {
  margin: 1.5rem 2rem 0 2rem;
}
 
.status-pending {
  background: #fff3cd;
  color: #856404;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #ffeaa7;
  font-weight: 500;
}
 
.status-rejected {
  background: #f8d7da;
  color: #721c24;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
  font-weight: 500;
}
 
/* Keep all existing styles */
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
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
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  color: #6b7280;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
}
.sidebar-link.active, .sidebar-link:hover {
  background: #f3f4f6;
  color: #c20000;
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
.dashboard-main {
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
}
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem 2rem 1.5rem 2rem;
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
.dashboard-search {
  position: relative;
  display: flex;
  align-items: center;
  background: #f3f4f6;
  border-radius: 0.5rem;
  padding: 0.2rem 0.7rem;
}
.dashboard-search i {
  color: #6b7280;
  margin-right: 0.5rem;
}
.dashboard-search input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.95rem;
  color: #111827;
  width: 8rem;
}
.dashboard-bell {
  background: #f3f4f6;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem;
  position: relative;
  cursor: pointer;
}
.dashboard-bell-dot {
  position: absolute;
  top: 0.3rem;
  right: 0.3rem;
  width: 0.6rem;
  height: 0.6rem;
  background: #ef4444;
  border-radius: 50%;
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
.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
  margin: 2rem 2rem 0 2rem;
}
@media (min-width: 768px) {
  .dashboard-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .dashboard-stats {
    grid-template-columns: repeat(3, 1fr);
  }
}
.stat-card {
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.stat-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.stat-label {
  color: #6b7280;
  font-size: 0.9rem;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}
.stat-change {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}
.stat-icon {
  background: #f3f4f6;
  border-radius: 0.5rem;
  padding: 0.7rem;
  font-size: 1.2rem;
}
.text-blue-600 { color: #2563eb; }
.text-green-600 { color: #16a34a; }
.text-purple-600 { color: #7c3aed; }
.text-orange-600 { color: #ea580c; }
.text-red-600 { color: #dc2626; }
.stat-card-bottom {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.95rem;
}
.text-muted { color: #9ca3af; }
.dashboard-2col {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin: 2rem 2rem 0 2rem;
}
@media (min-width: 1024px) {
  .dashboard-2col {
    grid-template-columns: 1fr 1fr;
  }
}
.dashboard-card {
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
  padding: 1.5rem;
}
.dashboard-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.dashboard-appointments .appointment-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 0.7rem;
}
.appointment-icon {
  width: 3rem;
  height: 3rem;
  background: #c20000;
  color: #fff;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}
.appointment-info h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.2rem;
}
.appointment-info p {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 0.2rem;
}
.appointment-meta {
  display: flex;
  gap: 1.2rem;
  font-size: 0.85rem;
  color: #6b7280;
}
.appointment-status {
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
}
.appointment-status.confirmed {
  background: #dcfce7;
  color: #166534;
}
.appointment-status.pending {
  background: #fef9c3;
  color: #854d0e;
}
.dashboard-activity .activity-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.7rem;
}
.activity-dot {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
}
.activity-dot.match { background: #16a34a; }
.activity-dot.view { background: #2563eb; }
.activity-dot.appointment { background: #7c3aed; }
.activity-dot.like { background: #ea580c; }
.activity-dot.interview { background: #7c3aed; }
.activity-action {
  font-size: 0.95rem;
  font-weight: 500;
  color: #111827;
}
.activity-time {
  font-size: 0.8rem;
  color: #6b7280;
}
.dashboard-actions {
  margin: 2rem 2rem 0 2rem;
}
.dashboard-actions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
@media (min-width: 768px) {
  .dashboard-actions-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
.dashboard-action-btn {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  background: #f3f4f6;
  color: #374151;
  transition: background 0.2s, color 0.2s;
}
.dashboard-action-btn.bg-primary {
  background: #c20000;
  color: #fff;
}
.dashboard-action-btn.bg-accent {
  background: #f3f4f6;
  color: #374151;
}
.dashboard-action-btn:hover {
  background: #e5e7eb;
}
.dashboard-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}
.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #c20000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.dashboard-error {
  color: #ef4444;
  font-size: 0.85rem;
  text-align: center;
  padding: 1rem;
}
.no-data {
  text-align: center;
  color: #6b7280;
  font-size: 0.85rem;
  padding: 1rem;
}
.meer-zien-container {
  text-align: right;
  margin-top: 1rem;
}
.meer-zien-knop {
  background: none;
  border: none;
  color: #c20000;
  font-weight: bold;
  cursor: pointer;
}
 
.disabled-link {
  background-color: #e5e7eb !important;
  color: #9ca3af !important;
  cursor: not-allowed;
  pointer-events: none;
}
 
.stat-wrapper.is-link {
  text-decoration: none;
  color: inherit;
  display: block;
  border-radius: 0.75rem; /* Match stat-card border-radius */
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}
 
.stat-wrapper.is-link:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
 
.stat-wrapper.is-link .stat-card {
  height: 100%;
}
 
.afspraken-lijst {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
 
.afspraak-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9fafb;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}
 
.afspraak-info {
  display: flex;
  flex-direction: column;
}
 
.student-naam {
  font-weight: 600;
  color: #111827;
}
 
.afspraak-tijd {
  font-size: 0.9rem;
  color: #6b7280;
}
 
.profiel-knop {
  background-color: #c20000;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 0.375rem;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}
 
.profiel-knop:hover {
  background-color: #a50000;
}

/* START: MOBILE STYLES */
.mobile-view {
  display: none;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

 
.desktop-view {
  display: flex; /* or block, depending on original CSS */
}
 


.desktop-view {
  display: flex; /* or block, depending on original CSS */
}


@media (max-width: 768px) {
  .desktop-view {
    display: none;
  }
  .mobile-view {
    display: flex;
  }
  .verification-banner-mobile {
     margin: 0;
  }
}

.mobile-stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

.mobile-stat-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  padding: 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.mobile-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.stat-icon-mobile {
  font-size: 1.8rem;
  color: #c20000;
}

.stat-title-mobile {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-value-mobile {
  font-size: 1.2rem;
  font-weight: 600;
  color: #111827;
}

.mobile-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  padding: 1.25rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.mobile-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.mobile-card-header {
  font-size: 1.2rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
  text-align: center;
}

.mobile-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mobile-card ul li {
  background: #f8f9fa;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  color: #374151;
}

.no-data-mobile {
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
  padding: 1.5rem 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.meer-zien-knop-mobile {
  background: none;
  border: 1px solid #e5e7eb;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  display: block;
  width: 100%;
  text-align: center;
  margin-top: 1rem;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.meer-zien-knop-mobile:hover {
  background-color: #f8f9fa;
  border-color: #d1d5db;
}

.mobile-afspraak-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

 
.mobile-afspraak-item:last-child {
  margin-bottom: 0;
}
 


.mobile-afspraak-item:last-child {
  margin-bottom: 0;
}


.mobile-afspraak-item span {
  font-weight: 500;
  color: #374151;
  flex: 1;
  margin-right: 1rem;
}

.profiel-knop-mobile {
  background-color: #c20000;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  white-space: nowrap;
}

 
.profiel-knop-mobile:hover {
  background-color: #a50000;
}
 


.profiel-knop-mobile:hover {
  background-color: #a50000;
}


.status-pending, .status-rejected {
  border-radius: 12px;
  padding: 1.25rem;
  font-weight: 500;
  text-align: center;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.status-pending {
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-rejected {
  color: #721c24;
  border: 1px solid #f5c6cb;
}
/* END: MOBILE STYLES */
</style>
 
 
 