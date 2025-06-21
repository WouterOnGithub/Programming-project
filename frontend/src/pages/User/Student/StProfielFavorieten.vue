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
        <p class="welcome-subtitle">Hier is je favorieten overzicht</p>
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

    <!-- Alleen de main content van de favorietenpagina, zonder sidebar/header -->
    <main class="dashboard-main">
      <section class="pagina">
        <div class="hoofding">
          <div class="hoofding-links">
            <div class="icoon-container">
              <Heart :size="24" color="white" />
            </div>
            <div>
              <h1 class="titel">Favoriete bedrijven</h1>
              <p class="subtekst">{{ bedrijven.length }} favorieten ontvangen</p>
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
            <div class="stat-value">{{ bedrijven.length }}</div>
            <div class="stat-label">Totaal</div>
          </div>
          <div>
            <div class="stat-value rood">{{ gefilterdeBedrijven.length }}</div>
            <div class="stat-label">Resultaten</div>
          </div>
        </div>
  
        <div class="studentenlijst">
          <div class="lijst-hoofding">
            <h2>Overzicht Favorieten</h2>
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
                class="knop-rood" 
                @click="maakMatch(bedrijf.id)"
                :disabled="matchedBedrijfIds.has(bedrijf.id)"
              >
                <Heart :size="14" />
                <span>{{ matchedBedrijfIds.has(bedrijf.id) ? 'Gematched' : 'Match' }}</span>
              </button>
              <button class="knop-verwijder" @click="openConfirm(bedrijf)">
                <span>Verwijder</span>
              </button>
            </div>
          </div>
  
          <div v-if="gefilterdeBedrijven.length === 0" class="geen-resultaten">
            <div class="emoji">🔍</div>
            <h3>Geen bedrijven gevonden</h3>
            <p>Probeer een andere zoekterm.</p>
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
      <router-link v-for="item in navigation" :key="item.name" :to="item.href" class="mobile-nav-link" :class="{ 'active-link': router.currentRoute.value.path === item.href }">
        <span>{{ item.name }}</span>
      </router-link>
    </nav>
  </aside>
  <div v-if="isMobileSidebarOpen" @click="toggleMobileSidebar" class="sidebar-overlay"></div>
  
  <div v-if="showConfirm" class="modal-overlay">
    <div class="modal">
      <p>Weet je zeker dat je deze favoriet wilt verwijderen?</p>
      <div class="modal-actions">
        <button class="knop-ja" @click="verwijderFavoriet(favorietToDelete)">Ja</button>
        <button class="knop-nee" @click="showConfirm = false">Nee</button>
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { Heart, Calendar, User, Search, Building } from 'lucide-vue-next'
import StudentDashboardLayout from '../../../components/StudentDashboardLayout.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, collection, getDocs, doc, deleteDoc, query, where, documentId, setDoc, serverTimestamp } from 'firebase/firestore'
import { useRouter } from 'vue-router'

const db = getFirestore();
const auth = getAuth();
const router = useRouter();

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: 'fas fa-chart-pie' },
  { name: 'Job Swiping', href: '/swipe', icon: 'fas fa-heart' },
  { name: 'Afspraken', href: '/appointments', icon: 'fas fa-calendar' },
  { name: 'Favorieten', href: '/Favorietenst', icon: 'fas fa-star' },
  { name: 'Matches', href: '/stmatch', icon: 'fas fa-check-double' },
  { name: 'Profiel', href: '/WeergaveSt', icon: 'fas fa-user' },
  { name: 'Instellingen', href: '/SettingsStu', icon: 'fas fa-cog' },
];

const bedrijven = ref([])
const zoekterm = ref('')
const gefilterdeBedrijven = ref([]);
const matchedBedrijfIds = ref(new Set());

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

// Functie om de lijst te filteren
const filterBedrijven = () => {
  if (!zoekterm.value) {
    gefilterdeBedrijven.value = bedrijven.value;
    return;
  }
  gefilterdeBedrijven.value = bedrijven.value.filter((bedrijf) => {
    const zoektermLower = zoekterm.value.toLowerCase();
    const naamMatch = bedrijf.naam.toLowerCase().includes(zoektermLower);
    const locatieMatch = bedrijf.locatie.toLowerCase().includes(zoektermLower);

    // Robuuste check voor sector (kan string of array zijn)
    let sectorMatch = false;
    if (typeof bedrijf.sector === 'string') {
      sectorMatch = bedrijf.sector.toLowerCase().includes(zoektermLower);
    } else if (Array.isArray(bedrijf.sector)) {
      sectorMatch = bedrijf.sector.some(s => s.toLowerCase().includes(zoektermLower));
    }

    return naamMatch || sectorMatch || locatieMatch;
  });
};

// Watcher voor als de originele lijst met bedrijven verandert
watch(bedrijven, () => {
  filterBedrijven();
}, { deep: true });

// Watcher voor als de zoekterm verandert
watch(zoekterm, () => {
  filterBedrijven();
});

onMounted(() => {
  const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      console.log("Geen gebruiker ingelogd.");
      return;
    }
    const studentId = user.uid;

    // Fetch student data for banner
    const studentDocRef = doc(db, 'student', studentId);
    const studentDocSnap = await getDoc(studentDocRef);
    if (studentDocSnap.exists()) {
      const data = studentDocSnap.data();
      studentData.value.name = data.voornaam ? `${data.voornaam} ${data.achternaam || ''}`.trim() : 'Gebruiker';
      studentData.value.foto = data.foto || null;
    }

    // Haal bestaande matches (interessante swipes) op om knoppen uit te schakelen
    const swipesCol = collection(db, 'student', studentId, 'swipes');
    const swipesQuery = query(swipesCol, where('status', '==', 'interessant'));
    const swipesSnapshot = await getDocs(swipesQuery);
    swipesSnapshot.forEach(doc => matchedBedrijfIds.value.add(doc.id));

    // 1. Haal de favorieten van de student op (documenten met bedrijfUid)
    const favorietenCol = collection(db, 'student', studentId, 'favorieten');
    const favorietenSnapshot = await getDocs(favorietenCol);
    
    if (favorietenSnapshot.empty) {
      console.log("Geen favorieten gevonden voor deze student.");
      bedrijven.value = [];
      return;
    }

    const favorieteBedrijfIds = favorietenSnapshot.docs.map(doc => doc.data().bedrijfUid);

    // 2. Haal de details op van alleen de favoriete bedrijven
    if (favorieteBedrijfIds.length > 0) {
      const bedrijvenCol = collection(db, 'bedrijf');
      const q = query(bedrijvenCol, where(documentId(), 'in', favorieteBedrijfIds));
      const bedrijvenSnapshot = await getDocs(q);

      bedrijven.value = bedrijvenSnapshot.docs.map(doc => {
        const bedrijfData = doc.data();
        return {
          id: doc.id,
          naam: bedrijfData.bedrijfsnaam || 'Onbekend',
          sector: bedrijfData.sector || bedrijfData.opZoekNaar || '-',
          afkorting: (bedrijfData.bedrijfsnaam || '??').substring(0, 2).toUpperCase(),
          locatie: bedrijfData.gesitueerdIn || '-'
        };
      });
    } else {
      bedrijven.value = [];
    }

    // Initialiseer de gefilterde lijst
    gefilterdeBedrijven.value = bedrijven.value;

  });

  if (typeof window !== 'undefined') {
    window.addEventListener('mousedown', handleClickOutside);
  }

  onBeforeUnmount(() => {
    authUnsubscribe();
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousedown', handleClickOutside);
    }
  });
});

const toonProfiel = (id) => {
  router.push({ name: 'BedrijfProfielVoorStudent', params: { id: id } })
}

const maakMatch = async (bedrijfId) => {
  const studentId = auth.currentUser?.uid;
  if (!studentId || !bedrijfId) {
    console.error("Kon geen match maken: gebruiker of bedrijf niet gevonden.");
    return;
  }

  try {
    // 1. Maak de match aan in de 'swipes' collectie
    const swipeDocRef = doc(db, 'student', studentId, 'swipes', bedrijfId);
    await setDoc(swipeDocRef, {
      bedrijfUid: bedrijfId,
      status: 'interessant',
      timestamp: serverTimestamp()
    });

    // 2. Verwijder het bedrijf uit de 'favorieten' subcollectie
    const favorietDocRef = doc(db, 'student', studentId, 'favorieten', bedrijfId);
    await deleteDoc(favorietDocRef);

    // 3. Update de UI
    matchedBedrijfIds.value.add(bedrijfId);
    bedrijven.value = bedrijven.value.filter(b => b.id !== bedrijfId);
    
  } catch (error) {
    console.error("Fout bij het maken van de match of verwijderen van favoriet:", error);
  }
};

const planAfspraak = (id) => {
  // Navigeer naar afspraak plannen
}

const showConfirm = ref(false)
const favorietToDelete = ref(null)
const openConfirm = (bedrijf) => {
  favorietToDelete.value = bedrijf
  showConfirm.value = true
}
const verwijderFavoriet = async (bedrijf) => {
  if (!bedrijf) return;
  let studentId = auth.currentUser?.uid;
  if (!studentId) return;

  try {
    // Het 'id' veld van het bedrijf object is de bedrijfUid
    await deleteDoc(doc(db, 'student', studentId, 'favorieten', bedrijf.id));
    bedrijven.value = bedrijven.value.filter(b => b.id !== bedrijf.id)
  } catch (error) {
    console.error("Fout bij verwijderen van favoriet:", error);
  } finally {
    showConfirm.value = false
    favorietToDelete.value = null
  }
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

.knop-rood:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
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

/* =================================== */
/* === MOBILE RESPONSIVE STYLES === */
/* =================================== */

.mobile-header,
.welcome-banner-mobile,
.mobile-sidebar,
.sidebar-overlay {
  display: none;
}

@media (max-width: 768px) {
  /* Hide desktop elements */
  :deep(.sidebar-nav),
  :deep(.dashboard-header) {
    display: none !important;
  }

  /* Show mobile elements */
  .mobile-header,
  .welcome-banner-mobile,
  .mobile-sidebar {
    display: flex;
  }
  
  .dashboard-main {
    padding: 0;
    background-color: #f8f9fa;
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
  
  .welcome-avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2rem;
    font-weight: 600;
    color: #c20000;
    border: 1.5px solid #222;
    cursor: pointer;
  }
  
  .welcome-avatar .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
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
  
  /* Favorites page specific mobile styles */
  .pagina {
    padding: 0;
    background-color: transparent;
  }
  
  .hoofding {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    margin: 0 1.5rem;
  }
  
  .zoekbalk-container, .statistieken {
    margin: 1rem 1.5rem;
  }
  
  .studentenlijst {
    margin: 0 1.5rem 1.5rem;
  }
  
  .student-kaart {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .acties {
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
  }
  
  .acties > button {
    width: 100%;
    justify-content: center;
    padding: 0.75rem;
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
</style>