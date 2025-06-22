<template>
  <StudentDashboardLayout>
    <main class="dashboard-main">
      <div class="grondplan-viewer">
        <div class="header-content">
          <h1 class="titel">Grondplan</h1>
          <p class="page-subtitle">Zoek een bedrijf of wissel tussen de verdiepingen.</p>
        </div>

        <div class="controls-container">
          <div class="search-bar">
            <input type="text" v-model="searchQuery" placeholder="Zoek een bedrijf..." @input="searchCompanies" />
            <div v-if="searchResults.length > 0" class="search-results">
              <ul>
                <li v-for="company in searchResults" :key="company.id" @click="panToCompany(company.id)">
                  {{ company.bedrijfsnaam }}
                </li>
              </ul>
            </div>
          </div>

          <div class="floor-tabs">
            <button
              v-for="floor in floorPlans"
              :key="floor.id"
              @click="switchFloor(floor.id)"
              :class="['floor-tab-btn', { 'active': activeFloorPlanId === floor.id }]"
            >
              {{ floor.name }}
            </button>
          </div>
        </div>
        
        <div v-if="loading" class="loading-message">Grondplannen worden geladen...</div>
        <div v-else-if="error" class="error-message">{{ error }}</div>
        <div v-else class="map-container">
          <div ref="mapRef" class="map"></div>
        </div>
      </div>
    </main>
  </StudentDashboardLayout>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import StudentDashboardLayout from '../../../components/StudentDashboardLayout.vue';
import { db } from '../../../firebase/config';
import { collection, getDocs, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const route = useRoute();
const mapRef = ref(null);
const loading = ref(true);
const error = ref(null);
let map = null;

const searchQuery = ref('');
const searchResults = ref([]);

const floorPlans = ref([]);
const activeFloorPlanId = ref(null);
const allCompanyLocations = ref([]);
const allCompanies = ref({});

let unsubscribeFloorPlans = () => {};
let unsubscribeLocations = () => {};
let unsubscribeCompanies = () => {};

const setupListeners = () => {
  loading.value = true;
  
  // 1. Listen to floor plans
  const floorPlansQuery = query(collection(db, 'grondplannen'), orderBy('order'));
  unsubscribeFloorPlans = onSnapshot(floorPlansQuery, (snapshot) => {
    floorPlans.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (floorPlans.value.length > 0 && !activeFloorPlanId.value) {
      // Set initial floor plan if not already set
      activeFloorPlanId.value = floorPlans.value[0].id;
    } else if (floorPlans.value.length === 0) {
      error.value = "Geen grondplannen gevonden.";
    }
    loading.value = false;
  }, (err) => {
    console.error("Error fetching floor plans:", err);
    error.value = "Kon de grondplannen niet laden.";
    loading.value = false;
  });

  // 2. Listen to all company locations
  unsubscribeLocations = onSnapshot(collection(db, 'companyLocations'), (snapshot) => {
    allCompanyLocations.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderMap(activeFloorPlanId.value); // Re-render map on location change
    fetchCompaniesForLocations(); // Fetch company data for any new locations
  }, (err) => {
    console.error("Error fetching company locations:", err);
  });
};

const fetchCompaniesForLocations = () => {
  if (unsubscribeCompanies) unsubscribeCompanies(); // Unsubscribe from old company listener

  const companyIds = [...new Set(allCompanyLocations.value.map(loc => loc.companyId))].filter(Boolean);
  if (companyIds.length === 0) {
    allCompanies.value = {};
    return;
  }
  
  // Firestore 'in' query is limited to 30 items. If more, we need multiple queries.
  // For now, assuming less than 30 companies with locations.
  const companiesQuery = query(collection(db, 'bedrijf'), where('authUid', 'in', companyIds));
  unsubscribeCompanies = onSnapshot(companiesQuery, (snapshot) => {
    snapshot.docs.forEach(doc => {
      allCompanies.value[doc.data().authUid] = { id: doc.id, ...doc.data() };
    });
    // Re-render map to update company names if they change
    renderMap(activeFloorPlanId.value);
  }, (err) => {
    console.error("Error fetching companies:", err);
  });
};

const renderMap = (floorId) => {
  if (map) {
    map.remove();
    map = null;
  }
  if (!mapRef.value) return;

  const floorPlanData = floorPlans.value.find(fp => fp.id === floorId);
  if (!floorPlanData || !floorPlanData.imageUrl || !floorPlanData.imageHeight || !floorPlanData.imageWidth) {
    error.value = 'Grondplan-data is onvolledig of niet gevonden.';
    return;
  }

  map = L.map(mapRef.value, { crs: L.CRS.Simple, minZoom: -2, maxZoom: 2 });
  const bounds = [[0, 0], [floorPlanData.imageHeight, floorPlanData.imageWidth]];
  L.imageOverlay(floorPlanData.imageUrl, bounds).addTo(map);
  map.fitBounds(bounds);
};

const switchFloor = (floorId) => {
  activeFloorPlanId.value = floorId;
};

watch(activeFloorPlanId, (newFloorId, oldFloorId) => {
  if (newFloorId && newFloorId !== oldFloorId) {
    renderMap(newFloorId);
  }
});

onMounted(() => {
  setupListeners();

  const companyIdToShow = route.params.companyId;
  if (companyIdToShow) {
    // This watcher waits for both the location data and the company data to be available
    // before attempting to pan to the company. This resolves the race condition.
    const unwatch = watch([allCompanyLocations, allCompanies], ([newLocations, newCompanies]) => {
      const initialLocation = newLocations.find(loc => loc.companyId === companyIdToShow);
      const initialCompany = newCompanies[companyIdToShow];

      // Proceed only when both pieces of data are available
      if (initialLocation && initialCompany) {
        // panToCompany will handle switching to the correct floor and zooming in
        panToCompany(companyIdToShow, { center: true, openPopup: true });

        // Stop watching after we've successfully panned, to avoid re-triggering
        unwatch();
      }
    }, { deep: true }); // deep watch is needed for the allCompanies object
  }
});

const searchCompanies = () => {
  if (!searchQuery.value) {
    searchResults.value = [];
    return;
  }
  const q = searchQuery.value.toLowerCase();
  searchResults.value = Object.values(allCompanies.value)
    .filter(c => c.bedrijfsnaam.toLowerCase().includes(q) && allCompanyLocations.value.some(l => l.companyId === c.authUid))
    .map(c => ({ id: c.authUid, bedrijfsnaam: c.bedrijfsnaam }));
};

const panToCompany = (companyId, options = { center: true, openPopup: true }) => {
  const location = allCompanyLocations.value.find(loc => loc.companyId === companyId);
  if (!location) return;

  const panAndFocus = () => {
    if (!map) return;
    const floorPlanData = floorPlans.value.find(fp => fp.id === location.grondplanId);
    if (!floorPlanData) return;

    const lat = (location.y / 100) * floorPlanData.imageHeight;
    const lng = (location.x / 100) * floorPlanData.imageWidth;
    const latLng = [lat, lng];
    
    if (options.center) {
      map.setView(latLng, 2);
    }

    if (options.openPopup) {
      const company = allCompanies.value[companyId];
      const popupContent = `<b>${company.bedrijfsnaam}</b><br>Stand: ${location.locationName}`;
      L.popup()
        .setLatLng(latLng)
        .setContent(popupContent)
        .openOn(map);
    }
  };

  if (activeFloorPlanId.value !== location.grondplanId) {
    activeFloorPlanId.value = location.grondplanId;
    nextTick(panAndFocus);
  } else {
    panAndFocus();
  }
  
  searchQuery.value = '';
  searchResults.value = [];
};

onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
  }
  unsubscribeFloorPlans();
  unsubscribeLocations();
  unsubscribeCompanies();
});
</script>

<style scoped>
.dashboard-main { padding: 2rem; background-color: #f8f9fa; }
.grondplan-viewer { background-color: #fff; padding: 2rem; border-radius: 12px; box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08); }
.header-content { margin-bottom: 1.5rem; }
.titel { font-size: 2.2rem; font-weight: 700; color: #333; }
.page-subtitle { font-size: 1.1rem; color: #6c757d; }
.map-container { height: 70vh; width: 100%; border-radius: 8px; overflow: hidden; border: 1px solid #dee2e6; margin-top: 1.5rem; }
.map { height: 100%; width: 100%; background-color: #f1f3f5; }
.loading-message, .error-message { text-align: center; font-size: 1.2rem; padding: 3rem; color: #6c757d; }
.error-message { color: #dc3545; }

.controls-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-bar { position: relative; flex-grow: 1; max-width: 400px; }
.search-bar input { width: 100%; padding: 0.8rem 1rem; border-radius: 8px; border: 1px solid #ccc; font-size: 1rem; }
.search-results { position: absolute; background: white; border: 1px solid #ccc; border-top: none; border-radius: 0 0 8px 8px; width: 100%; max-height: 200px; overflow-y: auto; z-index: 1000; }
.search-results ul { list-style: none; padding: 0; margin: 0; }
.search-results li { padding: 0.8rem 1rem; cursor: pointer; }
.search-results li:hover { background-color: #f1f1f1; }

.floor-tabs { display: flex; gap: 0.5rem; background-color: #e9ecef; border-radius: 8px; padding: 0.3rem; }
.floor-tab-btn {
  padding: 0.6rem 1.2rem;
  border: none;
  background-color: transparent;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  color: #495057;
}
.floor-tab-btn.active {
  background-color: #fff;
  color: #c20000;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.floor-tab-btn:hover:not(.active) {
  background-color: #f1f3f5;
}
</style> 