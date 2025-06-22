<template>
  <StudentDashboardLayout>
    <main class="dashboard-main" v-if="!loading && bedrijf">
      <div class="profiel-container">
        <!-- Header -->
        <div class="profiel-header">
          <div class="terug-knop-container">
            <button @click="gaTerug" class="terug-knop">&larr; Terug</button>
          </div>
          <div class="avatar-container">
            <img v-if="bedrijf.foto" :src="bedrijf.foto" alt="Bedrijfslogo" class="avatar" />
            <div v-else class="avatar-placeholder">{{ bedrijf.bedrijfsnaam?.[0] }}{{ bedrijf.bedrijfsnaam?.[1] }}</div>
          </div>
          <div class="header-info">
            <h1>{{ bedrijf.bedrijfsnaam }}</h1>
            <p v-if="bedrijf.gesitueerdIn" class="locatie">{{ bedrijf.gesitueerdIn }}</p>
            <div v-if="bedrijf.linkedin" class="linkedin-link">
              <a :href="bedrijf.linkedin" target="_blank">LinkedIn Profiel</a>
            </div>
          </div>
          <div class="header-acties">
            <button @click="matchBedrijf" class="actie-knop match-knop">
              Match
            </button>
          </div>
        </div>

        <!-- Details -->
        <div class="profiel-details">
          <div class="detail-kaart">
            <h3>Over ons</h3>
            <p>{{ bedrijf.overOns || 'Geen beschrijving opgegeven.' }}</p>
          </div>
          
          <div class="detail-grid">
            <div class="detail-kaart">
              <h3>Informatie</h3>
              <ul>
                <li><strong>Op zoek naar:</strong> {{ bedrijf.opZoekNaar?.join ? bedrijf.opZoekNaar.join(', ') : bedrijf.opZoekNaar || 'N/A' }}</li>
                <li><strong>Gesprek duurt:</strong> {{ bedrijf.gesprekDuur || 'N/A' }}</li>
                <li><strong>Aanwezig van:</strong> {{ bedrijf.starttijd || 'N/A' }} tot {{ bedrijf.eindtijd || 'N/A' }}</li>
                <li><strong>Locatie stand:</strong> {{ bedrijf.gesitueerdIn || 'N/A' }}</li>
              </ul>
            </div>
            
            <div class="detail-kaart">
              <h3>Bedrijfsdetails</h3>
              <ul>
                <li><strong>Branche:</strong> {{ bedrijf.branche || 'N/A' }}</li>
                <li><strong>Bedrijfsgrootte:</strong> {{ bedrijf.bedrijfsgrootte || 'N/A' }}</li>
                <li><strong>Opgericht in:</strong> {{ bedrijf.opgerichtIn || 'N/A' }}</li>
              </ul>
            </div>
          </div>

          <div class="detail-kaart">
            <h3>Contactinformatie</h3>
            <div class="contact-grid">
              <div class="contact-item">
                <strong>E-mail:</strong>
                <a v-if="bedrijf.email" :href="`mailto:${bedrijf.email}`">{{ bedrijf.email }}</a>
                <span v-else>N/A</span>
              </div>
              <div class="contact-item">
                <strong>Website:</strong>
                <a v-if="bedrijf.website" :href="bedrijf.website" target="_blank">{{ bedrijf.website }}</a>
                <span v-else>N/A</span>
              </div>
              <div class="contact-item">
                <strong>Telefoon:</strong>
                <span>{{ bedrijf.telefoonnummer || 'N/A' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <div v-if="loading" class="loading-container">Laden...</div>
    <div v-if="error" class="error-container">{{ error }}</div>
  </StudentDashboardLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import StudentDashboardLayout from '../../../components/StudentDashboardLayout.vue';
import { notificationService } from '../../../services/notificationService';

const route = useRoute();
const router = useRouter();
const db = getFirestore();
const auth = getAuth();

const bedrijf = ref(null);
const loading = ref(true);
const error = ref(null);

const gaTerug = () => {
  router.go(-1);
};

const matchBedrijf = async () => {
  const user = auth.currentUser;
  if (!user) {
    alert('Je moet ingelogd zijn om te matchen.');
    return;
  }

  try {
    // Haal studentgegevens op voor notificatie
    const studentDoc = await getDoc(doc(db, 'student', user.uid));
    const studentData = studentDoc.exists() ? studentDoc.data() : {};
    const studentName = `${studentData.voornaam || 'Onbekende'} ${studentData.achternaam || 'Student'}`;

    // Haal bedrijfsgegevens op voor notificatie
    const bedrijfDoc = await getDoc(doc(db, 'bedrijf', route.params.id));
    const bedrijfData = bedrijfDoc.exists() ? bedrijfDoc.data() : {};
    const bedrijfNaam = bedrijfData.bedrijfsnaam || 'Onbekend Bedrijf';

    // Maak een 'interessant' swipe aan in de subcollectie van de student
    const swipeDocRef = doc(db, 'student', user.uid, 'swipes', route.params.id);
    await setDoc(swipeDocRef, {
      bedrijfUid: route.params.id,
      status: 'interessant',
      timestamp: serverTimestamp()
    });

    // Stuur notificatie naar bedrijf
    await notificationService.createCompanyNewMatchNotification(route.params.id, studentName);

    // Navigeer terug naar de vorige pagina
    router.go(-1);
  } catch (e) {
    console.error('Fout bij matchen:', e);
    alert('Er is een fout opgetreden bij het matchen.');
  }
};

onMounted(async () => {
  const bedrijfId = route.params.id;
  if (!bedrijfId) {
    error.value = "Geen bedrijf ID gevonden in de URL.";
    loading.value = false;
    return;
  }

  try {
    const bedrijfDocRef = doc(db, 'bedrijf', bedrijfId);
    const bedrijfSnap = await getDoc(bedrijfDocRef);

    if (bedrijfSnap.exists()) {
      bedrijf.value = bedrijfSnap.data();
    } else {
      error.value = "Kon het profiel van dit bedrijf niet vinden.";
    }
  } catch (e) {
    console.error("Fout bij ophalen van bedrijfsprofiel:", e);
    error.value = "Er is een fout opgetreden bij het laden van het profiel.";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.dashboard-main {
  padding: 2rem;
  background-color: #f9fafb;
}

.profiel-container {
  max-width: 1000px;
  margin: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  overflow: hidden;
}

.profiel-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: #4a5568;
  color: white;
  position: relative;
}

.terug-knop-container {
  position: absolute;
  top: 1rem;
  left: 1rem;
}

.terug-knop {
  background: rgba(255,255,255,0.2);
  border: 1px solid white;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.terug-knop:hover {
  background: rgba(255,255,255,0.4);
}

.avatar-container {
  margin-left: 8rem;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
}

.avatar-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #c20000;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
}

.header-info h1 {
  margin: 0;
  font-size: 1.8rem;
}

.header-info .locatie {
  margin: 0.25rem 0 0.5rem;
  font-style: italic;
  opacity: 0.9;
}

.linkedin-link a {
  color: white;
  text-decoration: underline;
}

.header-acties {
  margin-left: auto;
}

.actie-knop {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  text-decoration: none;
  display: inline-block;
}

.match-knop {
  background-color: #c20000;
  color: white;
  transition: background-color 0.2s;
}

.match-knop:hover {
  background-color: #a00000;
}

.profiel-details {
  padding: 2rem;
}

.detail-kaart {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #c20000;
}

.detail-kaart h3 {
  margin: 0 0 1rem 0;
  color: #2d3748;
  font-size: 1.2rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.detail-kaart ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.detail-kaart li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.detail-kaart li:last-child {
  border-bottom: none;
}

.contact-grid {
  display: grid;
  gap: 1rem;
}

.contact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-item a {
  color: #c20000;
  text-decoration: none;
}

.contact-item a:hover {
  text-decoration: underline;
}

.loading-container,
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 1.2rem;
}

.error-container {
  color: #e53e3e;
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .profiel-header {
    flex-direction: column;
    text-align: center;
  }
  
  .avatar-container {
    margin-left: 0;
  }
  
  .header-acties {
    margin-left: 0;
    margin-top: 1rem;
  }
}
</style> 