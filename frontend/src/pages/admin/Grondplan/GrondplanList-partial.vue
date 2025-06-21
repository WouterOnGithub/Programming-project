<template>
  <div class="grondplan-interactive">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Grondplan</h1>
        <p class="page-subtitle">Beheer alle grondplannen in het systeem</p>
      </div>
      <div class="header-actions">
        <button 
          @click="showUploadModal = true" 
          class="btn btn-primary"
        >
          <span class="btn-icon">+</span>
          Nieuwe grondplan uploaden
        </button>
      </div>
    </div>

    <div class="main-content">
      <div class="grondplan-container" :class="{ 'vertical-layout': isVerticalMap }">
        <div v-if="loading" class="loading-overlay">
          <div class="loading-spinner"></div>
          <p>Grondplan laden...</p>
        </div>
        
        <div v-else-if="!currentGrondplan" class="no-grondplan">
          <div class="empty-state">
            <div class="empty-icon">📍</div>
            <h3>Geen grondplan beschikbaar</h3>
            <p>Upload een grondplan om te beginnen</p>
            <button @click="showUploadModal = true" class="upload-button-secondary">
              Grondplan uploaden
            </button>
          </div>
        </div>

        <div v-else class="grondplan-view">
          <div class="grondplan-title">
            <h2>{{ currentGrondplan.name }}</h2>
            <div class="grondplan-controls">
              <!-- Mode Controls -->
              <div class="mode-controls">
                <button 
                  @click="setMode('view')" 
                  class="mode-btn"
                  :class="{ 'active': currentMode === 'view' }"
                >
                  👁️ Bekijken
                </button>
                <button 
                  @click="setMode('lokaal')" 
                  class="mode-btn"
                  :class="{ 'active': currentMode === 'lokaal' }"
                >
                  🏢 Lokalen
                </button>
                <button 
                  @click="setMode('bedrijf')" 
                  class="mode-btn"
                  :class="{ 'active': currentMode === 'bedrijf' }"
                >
                  🏪 Bedrijven
                </button>
              </div>

              <div class="zoom-controls">
                <button @click="zoomIn" class="control-btn" title="Inzoomen">🔍+</button>
                <button @click="zoomOut" class="control-btn" title="Uitzoomen">🔍-</button>
                <button @click="resetView" class="control-btn" title="Reset weergave">⟲</button>
                <button @click="showDeleteConfirmation" class="control-btn delete-btn" title="Verwijder grondplan">🗑️</button>
              </div>
            </div>
          </div>
          
          <div class="search-container" v-if="currentMode === 'bedrijf'">
            <company-search 
              :companies="companies" 
              :markers="companyMarkers" 
              @select-company="selectCompany"
            />
          </div>
          
          <!-- Mode Instructions -->
          <div v-if="showInstructions" class="mode-instructions" :class="{ 'fade-out': isFadingOut }">
            <div class="instruction-content">
              <span class="instruction-icon">💡</span>
              <span class="instruction-text">{{ getModeInstructions() }}</span>
            </div>
          </div>
          
          <!-- Lokalen Info Panel -->
          <div v-if="currentMode === 'lokaal' && lokalen.length > 0" class="lokalen-info-panel">
            <h4>Lokalen ({{ lokalen.length }})</h4>
            <div class="lokalen-list">
              <div 
                v-for="lokaal in lokalen" 
                :key="lokaal.id"
                class="lokaal-item"
                @click="selectLokaal(lokaal)"
                :class="{ 'selected': selectedLokaal?.id === lokaal.id }"
              >
                <div class="lokaal-color" :style="{ backgroundColor: lokaal.kleur }"></div>
                <div class="lokaal-details">
                  <span class="lokaal-name">{{ lokaal.naam }}</span>
                  <small class="lokaal-size">{{ lokaal.breedte }}% × {{ lokaal.hoogte }}%</small>
                </div>
                <div class="lokaal-companies">
                  <span class="company-count">{{ getBedrijvenInLokaal(lokaal.id).length }} bedrijven</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- LeafletJS Map Container -->
          <div 
            id="leaflet-map" 
            ref="mapContainer"
            class="leaflet-map-container"
          ></div>
          
          <div class="grondplan-info">
            <p><strong>Geüpload op:</strong> {{ formatDate(currentGrondplan.uploadDate) }}</p>
            <p><strong>Bestandsgrootte:</strong> {{ currentGrondplan.fileSize }}</p>
            <p><strong>Gebouw:</strong> {{ currentGrondplan.building }}</p>
            <p><strong>Verdieping:</strong> {{ currentGrondplan.floors }}</p>
          </div>
        </div>
      </div>
      
      <!-- Grondplan Geschiedenis (rechts) -->
      <div class="grondplan-sidebar" :class="{ 'collapsed': sidebarCollapsed }">
        <div class="sidebar-header">
          <h3 v-show="!sidebarCollapsed">Grondplan Geschiedenis</h3>
          <button @click="toggleSidebar" class="collapse-btn" title="Sidebar inklappen/uitklappen">
            {{ sidebarCollapsed ? '◀' : '▶' }}
          </button>
        </div>
        <div class="grondplan-list" v-show="!sidebarCollapsed">
          <div 
            v-for="grondplan in grondplannen" 
            :key="grondplan.id"
            class="grondplan-item"
            :class="{ 'active': currentGrondplanId === grondplan.id }"
            @click="selectGrondplan(grondplan.id)"
          >
            <div class="grondplan-thumbnail">
              <img 
                :src="grondplan.thumbnailUrl || grondplan.imageUrl" 
                :alt="grondplan.name" 
                class="thumbnail-image"
              />
            </div>
            <div class="grondplan-info">
              <h4>{{ grondplan.name }}</h4>
              <p class="grondplan-date">{{ formatDate(grondplan.uploadDate) }}</p>
              <p class="grondplan-location">{{ grondplan.building }} - {{ grondplan.floors }}</p>
            </div>
            <div class="grondplan-actions">
              <button 
                @click.stop="editGrondplan(grondplan)" 
                class="action-btn edit-btn" 
                title="Bewerk grondplan"
              >
                ✏️
              </button>
            </div>
          </div>
          
          <div v-if="grondplannen.length === 0" class="no-grondplannen">
            <p>Geen grondplannen beschikbaar</p>
            <button @click="showUploadModal = true" class="upload-button-small">
              Grondplan uploaden
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Lokaal Modal -->
    <lokaal-modal
      v-if="showLokaalModal"
      :location="selectedLocation"
      :grondplan-id="currentGrondplanId"
      :existing-lokaal="editingLokaal"
      @close="closeLokaalModal"
      @save="saveLokaal"
      @delete="deleteLokaal"
    />
    
    <!-- Company Selection Modal -->
    <company-location-modal
      v-if="showCompanyModal"
      :location="selectedLocation"
      :floor="currentGrondplanId"
      :existing-marker="editingMarker"
      :companies="companies"
      :placed-markers="allCompanyLocations"
      :lokalen="lokalen"
      :selected-lokaal="selectedLokaal"
      @close="closeCompanyModal"
      @save="saveCompanyLocation"
      @delete="deleteCompanyLocation"
    />

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Nieuwe grondplan uploaden</h3>
          <button @click="closeModal" class="close-button">×</button>
        </div>
        <form @submit.prevent="uploadGrondplan" class="upload-form">
          <div class="form-group">
            <label for="grondplanName">Naam:</label>
            <input 
              type="text" 
              id="grondplanName"
              v-model="newGrondplan.name" 
              required 
              placeholder="Bijv. Hoofdgebouw Verdieping 1"
            />
          </div>
          <div class="form-group">
            <label for="grondplanBuilding">Gebouw:</label>
            <input 
              type="text" 
              id="grondplanBuilding"
              v-model="newGrondplan.building" 
              required 
              placeholder="Bijv. Hoofdgebouw"
            />
          </div>
          <div class="form-group">
            <label for="grondplanFloors">Verdieping:</label>
            <input 
              type="text" 
              id="grondplanFloors"
              v-model="newGrondplan.floors" 
              required 
              placeholder="Bijv. Gelijkvloers"
            />
          </div>
          <div class="form-group">
            <label for="grondplanFile">Bestand:</label>
            <input 
              type="file" 
              id="grondplanFile"
              @change="handleFileSelect" 
              accept="image/*,.pdf"
              required 
            />
            <small>Ondersteunde formaten: JPG, PNG, PDF</small>
          </div>
          <div class="form-group">
            <label for="grondplanDescription">Beschrijving (optioneel):</label>
            <textarea 
              id="grondplanDescription"
              v-model="newGrondplan.description" 
              placeholder="Beschrijving van het grondplan..."
              rows="3"
            ></textarea>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-button">
              Annuleren
            </button>
            <button type="submit" class="submit-button" :disabled="!selectedFile || uploading">
              {{ uploading ? 'Uploaden...' : 'Uploaden' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Grondplan verwijderen</h3>
          <button @click="closeDeleteModal" class="close-button">×</button>
        </div>
        <div class="modal-body">
          <p class="delete-warning">
            <span class="warning-icon">⚠️</span>
            Weet je zeker dat je dit grondplan wilt verwijderen?
          </p>
          <p>
            <strong>{{ currentGrondplan?.name }}</strong>
          </p>
          <p class="delete-note">
            Alle bedrijfslocaties die aan dit grondplan zijn gekoppeld worden ook verwijderd.
            Deze actie kan niet ongedaan worden gemaakt.
          </p>
          
          <div class="form-actions">
            <button @click="closeDeleteModal" class="cancel-button">
              Annuleren
            </button>
            <button @click="confirmDeleteGrondplan" class="delete-button" :disabled="deleting">
              {{ deleting ? 'Verwijderen...' : 'Verwijderen' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { db, storage } from '../../../firebase/config'
import { collection, getDocs, addDoc, updateDoc, doc, getDoc, query, where, deleteDoc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import CompanyLocationModal from './CompanyLocationModal.vue'
import CompanySearch from './CompanySearch.vue'
import LokaalModal from './LokaalModal.vue'

// Import LeafletJS
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in LeafletJS
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export default {
  name: 'GrondplanList',
  components: {
    CompanyLocationModal,
    CompanySearch,
    LokaalModal
  },
  setup() {
    const router = useRouter()
    
    // State
    const grondplannen = ref([])
    const currentGrondplanId = ref(null)
    const currentGrondplan = ref(null)
    const loading = ref(true)
    const mapContainer = ref(null)
    const map = ref(null)
    const imageOverlay = ref(null)
    const markersLayer = ref(null)
    const lokalenLayer = ref(null)
    const companyMarkers = ref([])
    const lokalen = ref([])
    const selectedLokaal = ref(null)
    const showLokaalModal = ref(false)
    const showCompanyModal = ref(false)
    const selectedLocation = reactive({ x: 0, y: 0 })
    const editingMarker = ref(null)
    const editingLokaal = ref(null)
    const currentMode = ref('view') // 'view', 'lokaal', 'bedrijf'
    const showUploadModal = ref(false)
    const uploading = ref(false)
    const showDeleteModal = ref(false)
    const deleting = ref(false)
    const sidebarCollapsed = ref(false)
    const isVerticalMap = ref(false)
    const newGrondplan = reactive({
      name: '',
      building: '',
      floors: '',
      description: ''
    })
    const selectedFile = ref(null)
    const companies = ref([])
    const allCompanyLocations = ref([])
    const showInstructions = ref(false)
    const isFadingOut = ref(false)
    let instructionTimeout = null
    
    // Map bounds for coordinate conversion
    const mapBounds = ref([[0, 0], [100, 100]])
    
    // Computed properties
    const visibleMarkers = computed(() => {
      if (!currentGrondplanId.value) return []
      return companyMarkers.value.filter(marker => marker.grondplanId === currentGrondplanId.value)
    })
    
    // Helper functions
    const getBedrijvenInLokaal = (lokaalId) => {
      return allCompanyLocations.value.filter(location => location.lokaalId === lokaalId)
    }
    
    const getModeInstructions = () => {
      switch (currentMode.value) {
        case 'lokaal':
          return 'Dubbelklik op de kaart om een lokaal te plaatsen'
        case 'bedrijf':
          return 'Dubbelklik op een lokaal om een bedrijf te plaatsen, of dubbelklik op een lege plek voor vrije plaatsing'
        default:
          return 'Selecteer een modus om te beginnen met bewerken'
      }
    }
    
    // Mode management
    const setMode = (mode) => {
      currentMode.value = mode
      showInstructions.value = mode !== 'view'
      
      if (mode !== 'view') {
        // Show instructions for 5 seconds
        clearTimeout(instructionTimeout)
        isFadingOut.value = false
        instructionTimeout = setTimeout(() => {
          isFadingOut.value = true
          setTimeout(() => {
            showInstructions.value = false
          }, 500)
        }, 5000)
      }
      
      // Update map event handlers
      updateMapEventHandlers()
    }
    
    const updateMapEventHandlers = () => {
      if (!map.value) return
      
      // Remove existing handlers
      map.value.off('dblclick')
      
      // Add handlers based on current mode
      if (currentMode.value === 'lokaal') {
        map.value.on('dblclick', handleLokaalDoubleClick)
      } else if (currentMode.value === 'bedrijf') {
        map.value.on('dblclick', handleBedrijfDoubleClick)
      }
    }
    
    // Coordinate conversion utilities
    const percentToLatLng = (x, y) => {
      const bounds = mapBounds.value
      const lat = bounds[1][0] - (y / 100) * (bounds[1][0] - bounds[0][0])
      const lng = bounds[0][1] + (x / 100) * (bounds[1][1] - bounds[0][1])
      return [lat, lng]
    }
    
    const latLngToPercent = (lat, lng) => {
      const bounds = mapBounds.value
      let x = ((lng - bounds[0][1]) / (bounds[1][1] - bounds[0][1])) * 100
      let y = ((bounds[1][0] - lat) / (bounds[1][0] - bounds[0][0])) * 100
      
      x = Math.max(0, Math.min(100, x))
      y = Math.max(0, Math.min(100, y))
      
      return { 
        x: parseFloat(x.toFixed(1)), 
        y: parseFloat(y.toFixed(1)) 
      }
    }
    
    // Continue with rest of the implementation...
    // [The rest of the script would continue with all the existing methods plus new lokalen methods]
    
    return {
      // Existing returns plus new ones
      grondplannen,
      currentGrondplanId,
      currentGrondplan,
      loading,
      mapContainer,
      companyMarkers,
      lokalen,
      selectedLokaal,
      showLokaalModal,
      showCompanyModal,
      selectedLocation,
      editingMarker,
      editingLokaal,
      currentMode,
      showUploadModal,
      uploading,
      showDeleteModal,
      deleting,
      sidebarCollapsed,
      isVerticalMap,
      newGrondplan,
      selectedFile,
      companies,
      allCompanyLocations,
      showInstructions,
      isFadingOut,
      visibleMarkers,
      getBedrijvenInLokaal,
      getModeInstructions,
      setMode
      // ... other methods would be included here
    }
  }
}
</script>

<style scoped>
/* Existing styles plus new ones for lokalen functionality */

.mode-controls {
  display: flex;
  gap: 8px;
  margin-right: 16px;
}

.mode-btn {
  padding: 8px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  background: white;
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-btn:hover {
  border-color: #007bff;
  color: #007bff;
}

.mode-btn.active {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

.mode-instructions {
  background: #e3f2fd;
  border: 1px solid #90caf9;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  transition: opacity 0.5s ease;
}

.mode-instructions.fade-out {
  opacity: 0;
}

.instruction-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.instruction-icon {
  font-size: 1.2rem;
}

.instruction-text {
  color: #1565c0;
  font-weight: 500;
}

.lokalen-info-panel {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.lokalen-info-panel h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
}

.lokalen-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.lokaal-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lokaal-item:hover {
  background: #f0f8ff;
  border-color: #007bff;
}

.lokaal-item.selected {
  background: #e3f2fd;
  border-color: #007bff;
}

.lokaal-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.lokaal-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.lokaal-name {
  font-weight: 500;
  color: #333;
}

.lokaal-size {
  color: #666;
  font-size: 0.85rem;
}

.lokaal-companies {
  text-align: right;
}

.company-count {
  color: #007bff;
  font-size: 0.85rem;
  font-weight: 500;
}

/* Rest of existing styles would be included here */
</style>

