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

        <!-- Body -->
        <div class="profiel-body">
          <!-- Main Content -->
          <div class="profiel-main">
            <div class="detail-kaart">
              <h3>Over ons</h3>
              <p>{{ bedrijf.overOns || 'Geen beschrijving opgegeven.' }}</p>
            </div>
             <div class="detail-kaart">
                <h3>Op zoek naar</h3>
                <ul>
                    <li v-for="item in bedrijf.opZoekNaar" :key="item">{{ item }}</li>
                </ul>
            </div>
          </div>
          <!-- Sidebar -->
          <div class="profiel-sidebar">
            <div class="detail-kaart">
              <h3>Informatie</h3>
              <ul>
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
    // Maak een 'interessant' swipe aan
    const swipeData = {
      studentUid: user.uid,
      bedrijfUid: route.params.id,
      type: 'interessant',
      timestamp: serverTimestamp(),
      studentNaam: `${bedrijf.value?.voornaam || ''} ${bedrijf.value?.achternaam || ''}`.trim(),
      bedrijfNaam: bedrijf.value?.bedrijfsnaam || ''
    };

    await setDoc(doc(db, 'swipes', `${user.uid}_${route.params.id}`), swipeData);
    
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
  background-color: #fffaf0;
  padding: 1.5rem;
}

.profiel-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background-color: transparent;
  padding: 0;
  border-radius: 0;
}

.profiel-header {
  background-color: #ffffff;
  border-radius: 1rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  position: relative;
}

.terug-knop-container {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
}

.terug-knop {
  background: transparent;
  border: none;
  color: #c20000;
  font-weight: 600;
  cursor: pointer;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #c20000;
  margin-bottom: 1rem;
}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #c20000;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  border: 4px solid #c20000;
  margin-bottom: 1rem;
}

.header-info h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
}

.header-info .locatie {
  color: #718096;
  margin-bottom: 1rem;
}

.linkedin-link a {
  color: #c20000;
  text-decoration: none;
  font-weight: 500;
}
.linkedin-link a:hover {
  text-decoration: underline;
}

.header-acties {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
}

.actie-knop {
  padding: 0.8rem 1.8rem;
  border-radius: 2rem;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.match-knop {
  background-color: #c20000;
  color: white;
}
.match-knop:hover {
  background-color: #a50000;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(194,0,0,0.2);
}

.profiel-body {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
    padding: 0;
}

@media (max-width: 992px) {
    .profiel-body {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
}

@media (max-width: 768px) {
  .dashboard-main {
    padding: 0;
  }
  .profiel-container {
    padding: 1rem;
    max-width: 100%;
    border-radius: 0;
    background-color: #fffaf0;
  }
  .profiel-header, .detail-kaart {
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }
  .profiel-body {
      padding: 0;
  }
}

.profiel-main, .profiel-sidebar {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.detail-kaart {
  background-color: #ffffff;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.detail-kaart h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #c20000;
  margin-top: 0;
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 0.5rem;
}
.detail-kaart h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(to right, #c20000, #e53e3e);
  border-radius: 2px;
}

.detail-kaart p {
  color: #4a5568;
  line-height: 1.6;
}

.detail-kaart ul {
  list-style: none;
  padding: 0;
  margin: 0;
  color: #4a5568;
}

.detail-kaart ul li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #edf2f7;
}
.detail-kaart ul li:last-child {
  border-bottom: none;
}

.detail-kaart strong {
  color: #2d3748;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.contact-item {
  color: #4a5568;
}

.contact-item a {
  color: #c20000;
  text-decoration: none;
}

.contact-item a:hover {
  text-decoration: underline;
}

.loading-container, .error-container {
  text-align: center;
  padding: 4rem;
  font-size: 1.2rem;
  color: #718096;
}
</style> 