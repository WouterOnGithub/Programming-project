<template>
  <BedrijfDashboardLayout>
    <main class="dashboard-main">
      <div class="header-blok">
        <h2 class="titel">Mijn Standlocatie</h2>
        <p class="uitleg">Hieronder ziet u de plattegrond met uw toegewezen standplaats.</p>
      </div>

      <div class="grondplan-container">
        <div v-if="loading" class="status-indicator">
          <p>Locatiegegevens laden...</p>
        </div>
        <div v-else-if="error" class="status-indicator error">
          <p>{{ error }}</p>
        </div>
        <div v-else-if="!locatie" class="status-indicator">
          <p>Er is nog geen standplaats aan uw bedrijf toegewezen.</p>
          <p>Neem contact op met de beheerder voor meer informatie.</p>
        </div>
        <div v-else class="plattegrond-wrapper">
          <h3>{{ plattegrond.name }}</h3>
          <p><strong>Standnummer:</strong> {{ locatie.standId || 'N/A' }}</p>
          <div class="plattegrond" ref="plattegrondContainer">
            <img :src="plattegrond.imageUrl" alt="Grondplan" @load="plaatsMarker" />
            <div v-if="markerPositie" class="marker" :style="{ left: markerPositie.x + 'px', top: markerPositie.y + 'px' }">
              <span class="marker-label">Hier bent u</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </BedrijfDashboardLayout>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import BedrijfDashboardLayout from '../../../components/BedrijfDashboardLayout.vue';

const db = getFirestore();
const auth = getAuth();

const locatie = ref(null);
const plattegrond = ref(null);
const loading = ref(true);
const error = ref(null);
const plattegrondContainer = ref(null);
const markerPositie = ref(null);

onMounted(async () => {
  const user = auth.currentUser;
  if (!user) {
    error.value = "U moet ingelogd zijn.";
    loading.value = false;
    return;
  }

  try {
    // 1. Zoek de locatie van het bedrijf
    const locQuery = query(collection(db, 'company_locations'), where('companyId', '==', user.uid));
    const locSnap = await getDocs(locQuery);

    if (locSnap.empty) {
      locatie.value = null; // Geen locatie gevonden
    } else {
      const locData = locSnap.docs[0].data();
      locatie.value = locData;

      // 2. Haal de bijbehorende plattegrond op
      const plattegrondDocRef = doc(db, 'grondplan', locData.floorId);
      const plattegrondSnap = await getDoc(plattegrondDocRef);
      if (plattegrondSnap.exists()) {
        plattegrond.value = plattegrondSnap.data();
      } else {
        throw new Error("De bijbehorende plattegrond kon niet worden gevonden.");
      }
    }
  } catch (e) {
    console.error("Fout bij ophalen van locatie:", e);
    error.value = "Kon de locatiegegevens niet laden.";
  } finally {
    loading.value = false;
  }
});

const plaatsMarker = async () => {
    await nextTick(); // Wacht tot de DOM is bijgewerkt
    if (plattegrondContainer.value && locatie.value) {
        const img = plattegrondContainer.value.querySelector('img');
        const lat = locatie.value.location.lat;
        const lng = locatie.value.location.lng;

        // Dit is een placeholder-conversie.
        // Leaflet coördinaten (lat/lng) direct vertalen naar pixel (x/y) is complex
        // en hangt af van de 'bounds' van de afbeelding op de Leaflet-kaart.
        // Voor een simpele weergave gebruiken we een benadering.
        const x = lng * (img.offsetWidth / 100); // Voorbeeld: schalen op basis van breedte
        const y = lat * (img.offsetHeight / 100); // Voorbeeld: schalen op basis van hoogte

        markerPositie.value = { x, y };
    }
};
</script>

<style scoped>
.header-blok { padding: 1.5rem 2rem; border-bottom: 1px solid #e5e7eb; }
.titel { font-size: 1.5rem; font-weight: 600; color: #111827; }
.uitleg { font-size: 1rem; color: #6b7280; }
.grondplan-container { padding: 2rem; }
.status-indicator { text-align: center; padding: 2rem; background: #f9fafb; border-radius: 8px; }
.error { color: #c20000; }
.plattegrond-wrapper { text-align: center; }
.plattegrond { position: relative; display: inline-block; max-width: 100%; }
.plattegrond img { max-width: 100%; height: auto; display: block; }
.marker { 
    position: absolute; 
    transform: translate(-50%, -100%); 
    width: 24px; 
    height: 24px; 
    background: #c20000;
    border: 2px solid white;
    border-radius: 50%; 
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}
.marker-label {
    position: absolute;
    bottom: 120%;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    color: black;
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 0.8rem;
}
</style> 