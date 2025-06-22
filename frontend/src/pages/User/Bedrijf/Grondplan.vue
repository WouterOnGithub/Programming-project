<template>
  <BedrijfDashboardLayout>
    <main class="dashboard-main">
      <div class="grondplan-viewer">
        <div class="header-content">
          <h1 class="titel">Grondplan</h1>
          <p v-if="currentGrondplan" class="page-subtitle">{{ currentGrondplan.name }}</p>
        </div>

        <div v-if="loading" class="loading-message">Grondplan laden...</div>
        <div v-if="error" class="error-message">{{ error }}</div>
        
        <div v-if="!loading && !error" class="map-container">
          <div id="map" ref="mapRef" class="map"></div>
        </div>
      </div>
    </main>
  </BedrijfDashboardLayout>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { getAuth } from 'firebase/auth';
import { db } from '../../../firebase/config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import BedrijfDashboardLayout from '../../../components/BedrijfDashboardLayout.vue';

const loading = ref(true);
const error = ref(null);
const mapRef = ref(null);
const currentGrondplan = ref(null);
let map = null;

onMounted(async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    error.value = 'U moet ingelogd zijn om het grondplan te bekijken.';
    loading.value = false;
    return;
  }

  try {
    // 1. Find the current company's location to identify the floor plan
    const myLocQuery = query(collection(db, 'companyLocations'), where('companyId', '==', user.uid));
    const myLocSnap = await getDocs(myLocQuery);

    if (myLocSnap.empty) {
      error.value = 'Geen locatie gevonden voor uw bedrijf.';
      loading.value = false;
      return;
    }
    const myCompanyLocation = myLocSnap.docs[0].data();
    const { grondplanId } = myCompanyLocation;

    // 2. Fetch the floor plan details
    const grondplanDoc = await getDoc(doc(db, 'grondplannen', grondplanId));
    if (!grondplanDoc.exists()) {
      error.value = 'Grondplan niet gevonden.';
      loading.value = false;
      return;
    }
    const grondplanData = grondplanDoc.data();
    currentGrondplan.value = grondplanData;

    // We gebruiken alleen de locatie van het huidige bedrijf
    const myCompanyDetails = (await getDoc(doc(db, 'bedrijf', user.uid))).data();
    
    loading.value = false;
    await nextTick();

    if (mapRef.value) {
      map = L.map(mapRef.value, {
        crs: L.CRS.Simple,
        minZoom: -2,
        maxZoom: 2,
        center: [0, 0],
        zoom: 0,
        scrollWheelZoom: true,
      });

      if (!grondplanData.imageHeight || !grondplanData.imageWidth) {
        error.value = 'Grondplan data is onvolledig (afmetingen ontbreken). Contacteer de administrator.';
        loading.value = false;
        return;
      }

      const bounds = [[0, 0], [grondplanData.imageHeight, grondplanData.imageWidth]];
      L.imageOverlay(grondplanData.imageUrl, bounds).addTo(map);
      map.fitBounds(bounds);

      // 3. Add marker for only the current user's company
      const markerY = (myCompanyLocation.y / 100) * grondplanData.imageHeight;
      const markerX = (myCompanyLocation.x / 100) * grondplanData.imageWidth;

      const iconHtml = `
        <div class="company-marker">
          <span class="marker-pin">📍</span>
          <span class="marker-text">${myCompanyDetails.bedrijfsnaam}</span>
        </div>
      `;

      const companyIcon = L.divIcon({
        html: iconHtml,
        className: 'company-marker-wrapper',
        iconSize: [140, 40],
        iconAnchor: [12, 40],
      });
      
      L.marker([markerY, markerX], { icon: companyIcon }).addTo(map);
      
      // Center map on the marker
      map.setView([markerY, markerX], 1);
    }
  } catch (e) {
    console.error('Fout bij laden van grondplan:', e);
    error.value = 'Er is een fout opgetreden bij het laden van het grondplan.';
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<style scoped>
.dashboard-main {
  padding: 2rem;
  background-color: #f8f9fa;
}

.grondplan-viewer {
  background-color: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

.header-content {
  margin-bottom: 1.5rem;
}

.titel {
  font-size: 2.2rem;
  font-weight: 700;
  color: #333;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #6c757d;
}

.map-container {
  height: 70vh;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dee2e6;
}

.map {
  height: 100%;
  width: 100%;
  background-color: #f1f3f5;
}

.loading-message, .error-message {
  text-align: center;
  font-size: 1.2rem;
  padding: 3rem;
  color: #6c757d;
}

.error-message {
  color: #dc3545;
}

:deep(.company-marker-wrapper) {
  /* No default background or border, let the inner div handle it */
}

:deep(.company-marker) {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 5px 12px;
  font-weight: 600;
  font-size: 14px;
  text-align: center;
  border: 1px solid #adb5bd;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  white-space: nowrap;
}

:deep(.marker-pin) {
  font-size: 20px;
  margin-right: 5px;
}
</style> 