<template>
  <StudentDashboardLayout>
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
import { ref, computed, onMounted, watch } from 'vue'
import { Heart, Calendar, User, Search, Building } from 'lucide-vue-next'
import StudentDashboardLayout from '../../../components/StudentDashboardLayout.vue'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, getDocs, doc, getDoc, deleteDoc, query, where, documentId, setDoc, serverTimestamp } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import { notificationService } from '../../../services/notificationService'

const db = getFirestore();
const auth = getAuth();
const router = useRouter();
const bedrijven = ref([])
const zoekterm = ref('')
const gefilterdeBedrijven = ref([]);
const matchedBedrijfIds = ref(new Set());

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

onMounted(async () => {
  try {
    const user = await new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        unsubscribe();
        resolve(user);
      }, reject);
    });

    if (!user) {
      console.log("Geen gebruiker ingelogd.");
      return;
    }
    const studentId = user.uid;

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

  } catch (error) {
    console.error("Fout bij het ophalen van favoriete bedrijven:", error);
    bedrijven.value = [];
  }
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

    // 3. Haal studentgegevens op voor notificatie
    const studentDoc = await getDoc(doc(db, 'student', studentId));
    const studentData = studentDoc.exists() ? studentDoc.data() : {};
    const studentName = `${studentData.voornaam || 'Onbekende'} ${studentData.achternaam || 'Student'}`;
    
    // 4. Stuur notificatie naar bedrijf
    await notificationService.createCompanyNewMatchNotification(bedrijfId, studentName);

    // 5. Update de UI
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
  display: flex;
  text-align: column;
  align-items: center;
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
  background-color: #e2e8f0;
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
  }

  .acties .knop-grijs,
  .acties .knop-rood,
  .acties .knop-verwijder {
    width: 100%;
  }
}
</style>