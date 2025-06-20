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

    <div class="main-content">
      <div class="grondplan-container">
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
              <div class="mode-controls">
                <button 
                  @click="toggleEditMode" 
                  class="mode-btn"
                  :class="{ 'active': editMode }"
                >
                  {{ editMode ? 'Bewerkmodus Actief' : 'Bewerkmodus' }}
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
          
          <div class="search-container">
            <company-search 
              :companies="companies" 
              :markers="companyMarkers" 
              @select-company="selectCompany"
            />
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
      <div class="grondplan-sidebar">
        <div class="sidebar-header">
          <h3>Grondplan Geschiedenis</h3>
        </div>
        <div class="grondplan-list">
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

    <!-- Company Selection Modal -->
    <company-location-modal
      v-if="showCompanyModal"
      :location="selectedLocation"
      :floor="currentGrondplanId"
      :existingMarker="editingMarker"
      :companies="companies"
      :placed-markers="allCompanyLocations"
      @close="closeCompanyModal"
      @save="saveCompanyLocation"
      @delete="deleteCompanyLocation"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { db, storage } from '../../../firebase/config'
import { collection, getDocs, addDoc, updateDoc, doc, getDoc, query, where, deleteDoc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
// Removed mock data import - using Firebase instead
import CompanyLocationModal from './CompanyLocationModal.vue'
import CompanySearch from './CompanySearch.vue'

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
    CompanySearch
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
    const companyMarkers = ref([])
    const showCompanyModal = ref(false)
    const selectedLocation = reactive({ x: 0, y: 0 })
    const editingMarker = ref(null)
    const editMode = ref(false)
    const showUploadModal = ref(false)
    const uploading = ref(false)
    const showDeleteModal = ref(false)
    const deleting = ref(false)
    const newGrondplan = reactive({
      name: '',
      building: '',
      floors: '',
      description: ''
    })
    const selectedFile = ref(null)
    const companies = ref([]) // Companies loaded from Firebase
    const allCompanyLocations = ref([]) // All company locations across all floorplans
    
    // Map bounds for coordinate conversion
    const mapBounds = ref([[0, 0], [100, 100]])
    
    // Computed properties
    const visibleMarkers = computed(() => {
      if (!currentGrondplanId.value) return []
      return companyMarkers.value.filter(marker => marker.grondplanId === currentGrondplanId.value)
    })
    
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
      
      // Clamp values between 0 and 100
      x = Math.max(0, Math.min(100, x))
      y = Math.max(0, Math.min(100, y))
      
      // Round to one decimal place to match the input step and prevent validation issues
      return { 
        x: parseFloat(x.toFixed(1)), 
        y: parseFloat(y.toFixed(1)) 
      }
    }
    
    // LeafletJS Map Methods
    const initializeMap = async () => {
      await nextTick()
      
      if (!mapContainer.value) {
        console.error('Map container not found')
        return false
      }
      
      if (map.value) {
        map.value.remove()
        map.value = null
      }
      
      try {
        map.value = L.map(mapContainer.value, {
          crs: L.CRS.Simple,
          minZoom: -2,
          maxZoom: 4,
          zoomControl: false,
          attributionControl: false
        })
        
        markersLayer.value = L.layerGroup().addTo(map.value)
        
        if (editMode.value) {
          map.value.on('dblclick', handleMapDoubleClick)
        }
        
        map.value.setView([50, 50], 0)
        
        return true
      } catch (error) {
        console.error('Error initializing map:', error)
        return false
      }
    }
    
    const loadFloorPlanImage = async () => {
      if (!currentGrondplan.value || !map.value) return
      
      if (imageOverlay.value) {
        map.value.removeLayer(imageOverlay.value)
        imageOverlay.value = null
      }
      
      try {
        const img = new Image()
        img.onload = () => {
          const aspectRatio = img.width / img.height
          
          let bounds
          if (aspectRatio > 1) {
            bounds = [[0, 0], [100, 100 * aspectRatio]]
          } else {
            bounds = [[0, 0], [100 / aspectRatio, 100]]
          }
          
          console.log('Image loaded - width:', img.width, 'height:', img.height, 'aspectRatio:', aspectRatio)
          console.log('Setting bounds:', bounds)
          
          mapBounds.value = bounds
          
          imageOverlay.value = L.imageOverlay(currentGrondplan.value.imageUrl, bounds)
          imageOverlay.value.addTo(map.value)
          
          map.value.fitBounds(bounds, {
            padding: [20, 20]
          })
          
          loadCompanyMarkersOnMap()
        }
        
        img.src = currentGrondplan.value.imageUrl
        
      } catch (error) {
        console.error('Error loading floor plan image:', error)
      }
    }
    
    const createCompanyMarker = (markerData) => {
      const [lat, lng] = percentToLatLng(markerData.x, markerData.y)
      
      const companyName = markerData.company.bedrijfsnaam || markerData.company.name
      const companyIndustry = markerData.company.industry || markerData.company.branche
      
      const customIcon = L.divIcon({
        className: 'company-marker-icon',
        html: `
          <div class="marker-content">
            <div class="marker-dot"></div>
            <div class="marker-label">${companyName}</div>
          </div>
        `,
        iconSize: [120, 40],
        iconAnchor: [60, 20]
      })
      
      const marker = L.marker([lat, lng], { 
        icon: customIcon,
        draggable: editMode.value
      })
      
      const popupContent = `
        <div class="company-popup">
          <div class="popup-header">
            ${markerData.company.logo ? 
              `<img src="${markerData.company.logo}" alt="${companyName}" class="popup-logo" />` : 
              `<div class="popup-logo-placeholder">${companyName.charAt(0)}</div>`
            }
            <h3>${companyName}</h3>
          </div>
          <div class="popup-content">
            <p><strong>Industrie:</strong> ${companyIndustry}</p>
            ${markerData.notes ? `<p><strong>Notities:</strong> ${markerData.notes}</p>` : ''}
          </div>
          <div class="popup-actions">
            <button onclick="window.navigateToCompany('${markerData.company.id}')" class="popup-btn">
              Bekijk Bedrijf
            </button>
            ${editMode.value ? `<button onclick="window.editMarker('${markerData.id}')" class="popup-btn edit-btn">Bewerken</button>` : ''}
          </div>
        </div>
      `
      
      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'company-popup-container'
      })
      
      if (editMode.value) {
        marker.on('dragend', (e) => {
          const newLatLng = e.target.getLatLng()
          const newPercent = latLngToPercent(newLatLng.lat, newLatLng.lng)
          updateMarkerPosition(markerData.id, newPercent.x, newPercent.y)
        })
      }
      
      marker.markerData = markerData
      
      return marker
    }
    
    const loadCompanyMarkersOnMap = () => {
      if (!markersLayer.value) return
      
      markersLayer.value.clearLayers()
      
      visibleMarkers.value.forEach(markerData => {
        const marker = createCompanyMarker(markerData)
        markersLayer.value.addLayer(marker)
      })
    }
    
    const updateMarkerPosition = async (markerId, newX, newY) => {
      try {
        const markerRef = doc(db, 'companyLocations', markerId)
        await updateDoc(markerRef, {
          x: newX,
          y: newY,
          updatedAt: new Date()
        })
        
        const markerIndex = companyMarkers.value.findIndex(m => m.id === markerId)
        if (markerIndex !== -1) {
          companyMarkers.value[markerIndex].x = newX
          companyMarkers.value[markerIndex].y = newY
        }
        
        console.log('Marker position updated successfully')
      } catch (error) {
        console.error('Error updating marker position:', error)
        alert('Er is een fout opgetreden bij het bijwerken van de markerlocatie.')
      }
    }
    
    // Map Control Methods
    const zoomIn = () => {
      if (map.value) {
        map.value.zoomIn()
      }
    }
    
    const zoomOut = () => {
      if (map.value) {
        map.value.zoomOut()
      }
    }
    
    const resetView = () => {
      if (map.value && imageOverlay.value) {
        map.value.fitBounds(mapBounds.value)
      }
    }
    
    // Event Handlers
    const handleMapDoubleClick = (e) => {
      if (!editMode.value) return
      
      const { lat, lng } = e.latlng
      const percent = latLngToPercent(lat, lng)
      
      console.log('Map click - lat:', lat, 'lng:', lng)
      console.log('Map bounds:', mapBounds.value)
      console.log('Converted to percent - x:', percent.x, 'y:', percent.y)
      
      selectedLocation.x = percent.x
      selectedLocation.y = percent.y
      editingMarker.value = null
      showCompanyModal.value = true
    }
    
    const toggleEditMode = () => {
      editMode.value = !editMode.value
      
      if (map.value) {
        if (editMode.value) {
          map.value.on('dblclick', handleMapDoubleClick)
        } else {
          map.value.off('dblclick', handleMapDoubleClick)
        }
        
        markersLayer.value.eachLayer(marker => {
          marker.options.draggable = editMode.value
          if (editMode.value) {
            marker.dragging.enable()
          } else {
            marker.dragging.disable()
          }
        })
        
        loadCompanyMarkersOnMap()
      }
    }
    
    // Global functions for popup buttons
    window.navigateToCompany = (companyId) => {
      router.push(`/admin/companies/${companyId}`)
    }
    
    window.editMarker = (markerId) => {
      const marker = companyMarkers.value.find(m => m.id === markerId)
      if (marker) {
        editingMarker.value = marker
        selectedLocation.x = marker.x
        selectedLocation.y = marker.y
        showCompanyModal.value = true
      }
    }
    
    // Data Loading Methods
    const loadGrondplannen = async () => {
      loading.value = true
      try {
        const querySnapshot = await getDocs(collection(db, 'grondplan'))
        grondplannen.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        
        if (grondplannen.value.length > 0) {
          currentGrondplanId.value = grondplannen.value[0].id
          await changeGrondplan()
        } else {
          currentGrondplan.value = null
          loading.value = false
        }
      } catch (error) {
        console.error('Error loading grondplannen:', error)
        loading.value = false
      }
    }
    
    const selectGrondplan = async (grondplanId) => {
      if (currentGrondplanId.value === grondplanId) return
      
      currentGrondplanId.value = grondplanId
      await changeGrondplan()
    }
    
    const changeGrondplan = async () => {
      if (!currentGrondplanId.value) return
      
      loading.value = true
      try {
        const grondplanDoc = await getDoc(doc(db, 'grondplan', currentGrondplanId.value))
        if (grondplanDoc.exists()) {
          currentGrondplan.value = { id: grondplanDoc.id, ...grondplanDoc.data() }
          await loadCompanyMarkers()
          
          loading.value = false
          
          await nextTick()
          
          if (mapContainer.value) {
            const mapInitialized = await initializeMap()
            if (mapInitialized) {
              await loadFloorPlanImage()
            }
          }
        }
      } catch (error) {
        console.error('Error loading grondplan:', error)
        loading.value = false
      }
    }
    
    const loadCompanyMarkers = async () => {
      try {
        const markersQuery = query(
          collection(db, 'companyLocations'),
          where('grondplanId', '==', currentGrondplanId.value)
        )
        
        const markersSnapshot = await getDocs(markersQuery)
        const markers = []
        
        for (const markerDoc of markersSnapshot.docs) {
          const markerData = markerDoc.data()
          const company = companies.value.find(c => c.id === markerData.companyId)
          
          if (company) {
            markers.push({
              id: markerDoc.id,
              ...markerData,
              // Round coordinates to prevent validation issues
              x: markerData.x ? parseFloat(markerData.x.toFixed(1)) : 0,
              y: markerData.y ? parseFloat(markerData.y.toFixed(1)) : 0,
              company
            })
          }
        }
        
        companyMarkers.value = markers
      } catch (error) {
        console.error('Error loading company markers:', error)
      }
    }
    
    const loadAllCompanyLocations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'companyLocations'))
        allCompanyLocations.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      } catch (error) {
        console.error('Error loading all company locations:', error)
      }
    }
    
    // Company Modal Methods
    const closeCompanyModal = () => {
      showCompanyModal.value = false
      editingMarker.value = null
    }
    
    const saveCompanyLocation = async (locationData) => {
      try {
        const locationWithGrondplan = {
          ...locationData,
          grondplanId: currentGrondplanId.value
        }
        
        // Find the full company object
        const company = companies.value.find(c => c.id === locationData.companyId)
        if (!company) {
          throw new Error(`Company with ID ${locationData.companyId} not found.`)
        }

        if (editingMarker.value) {
          const index = companyMarkers.value.findIndex(m => m.id === editingMarker.value.id)
          if (index !== -1) {
            companyMarkers.value[index] = {
              ...locationWithGrondplan,
              id: editingMarker.value.id
            }
            
            const markerRef = doc(db, 'companyLocations', editingMarker.value.id)
            await updateDoc(markerRef, {
              companyId: locationWithGrondplan.companyId,
              grondplanId: locationWithGrondplan.grondplanId,
              x: locationWithGrondplan.x,
              y: locationWithGrondplan.y,
              notes: locationWithGrondplan.notes,
              updatedAt: new Date()
            })
          }
        } else {
          console.log('Attempting to add new marker with data:', locationWithGrondplan)
          const newMarkerRef = await addDoc(collection(db, 'companyLocations'), {
            companyId: locationWithGrondplan.companyId,
            grondplanId: locationWithGrondplan.grondplanId,
            x: locationWithGrondplan.x,
            y: locationWithGrondplan.y,
            notes: locationWithGrondplan.notes || '',
            createdAt: new Date()
          })
          
          companyMarkers.value.push({
            ...locationWithGrondplan,
            id: newMarkerRef.id,
            company // Add the full company object to the new marker
          })

          allCompanyLocations.value.push({
            id: newMarkerRef.id,
            ...locationWithGrondplan
          })
        }
        
        loadCompanyMarkersOnMap()
        closeCompanyModal()
      } catch (error) {
        console.error('Error saving company location:', error)
        console.error('Data that was being saved:', locationData)
        alert('Er is een fout opgetreden bij het opslaan van de bedrijfslocatie. Check de console voor meer details.')
      }
    }
    
    const deleteCompanyLocation = async (markerId) => {
      try {
        companyMarkers.value = companyMarkers.value.filter(m => m.id !== markerId)
        allCompanyLocations.value = allCompanyLocations.value.filter(m => m.id !== markerId)
        await deleteDoc(doc(db, 'companyLocations', markerId))
        
        loadCompanyMarkersOnMap()
        closeCompanyModal()
      } catch (error) {
        console.error('Error deleting company location:', error)
        alert('Er is een fout opgetreden bij het verwijderen van de bedrijfslocatie.')
      }
    }
    
    // Search functionality
    const selectCompany = (company) => {
      const marker = companyMarkers.value.find(m => 
        m.companyId === company.id && 
        m.grondplanId === currentGrondplanId.value
      )
      
      if (marker && map.value) {
        const [lat, lng] = percentToLatLng(marker.x, marker.y)
        map.value.setView([lat, lng], 2)
        
        markersLayer.value.eachLayer(leafletMarker => {
          if (leafletMarker.markerData && leafletMarker.markerData.id === marker.id) {
            leafletMarker.openPopup()
          }
        })
      } else if (editMode.value) {
        selectedLocation.x = 50
        selectedLocation.y = 50
        editingMarker.value = null
        showCompanyModal.value = true
      }
    }
    
    // File upload methods
    const handleFileSelect = (event) => {
      selectedFile.value = event.target.files[0]
    }
    
    const closeModal = () => {
      showUploadModal.value = false
      newGrondplan.name = ''
      newGrondplan.building = ''
      newGrondplan.floors = ''
      newGrondplan.description = ''
      selectedFile.value = null
    }
    
    const uploadGrondplan = async () => {
      if (!selectedFile.value) return
      
      try {
        uploading.value = true
        
        const imageRef = storageRef(storage, `grondplannen/${Date.now()}_${selectedFile.value.name}`)
        await uploadBytes(imageRef, selectedFile.value)
        const imageUrl = await getDownloadURL(imageRef)
        
        const grondplanData = {
          name: newGrondplan.name,
          building: newGrondplan.building,
          floors: newGrondplan.floors,
          description: newGrondplan.description,
          imageUrl: imageUrl,
          thumbnailUrl: imageUrl,
          fileSize: formatFileSize(selectedFile.value.size),
          uploadDate: new Date()
        }
        
        const docRef = await addDoc(collection(db, 'grondplan'), grondplanData)
        
        await loadGrondplannen()
        currentGrondplanId.value = docRef.id
        await changeGrondplan()
        
        closeModal()
      } catch (error) {
        console.error('Fout bij uploaden grondplan:', error)
        alert('Er is een fout opgetreden bij het uploaden van het grondplan.')
      } finally {
        uploading.value = false
      }
    }
    
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    
    const formatDate = (timestamp) => {
      if (!timestamp) return ''
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return new Intl.DateTimeFormat('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date)
    }
    
    const editGrondplan = (grondplan) => {
      selectGrondplan(grondplan.id)
    }
    
    // Delete functionality
    const showDeleteConfirmation = () => {
      if (!currentGrondplan.value) return
      showDeleteModal.value = true
    }
    
    const closeDeleteModal = () => {
      showDeleteModal.value = false
    }
    
    const confirmDeleteGrondplan = async () => {
      if (!currentGrondplan.value) return
      
      try {
        deleting.value = true
        
        await deleteCompanyLocationsForGrondplan(currentGrondplanId.value)
        
        if (currentGrondplan.value.imageUrl) {
          try {
            const imageUrl = currentGrondplan.value.imageUrl
            const imagePath = decodeURIComponent(imageUrl.split('/o/')[1].split('?')[0])
            const imageRef = storageRef(storage, imagePath)
            await deleteObject(imageRef)
          } catch (error) {
            console.error('Error deleting image from storage:', error)
          }
        }
        
        await deleteDoc(doc(db, 'grondplan', currentGrondplanId.value))
        await loadGrondplannen()
        
        closeDeleteModal()
      } catch (error) {
        console.error('Error deleting grondplan:', error)
        alert('Er is een fout opgetreden bij het verwijderen van het grondplan.')
      } finally {
        deleting.value = false
      }
    }
    
    const deleteCompanyLocationsForGrondplan = async (grondplanId) => {
      try {
        const markersQuery = query(
          collection(db, 'companyLocations'),
          where('grondplanId', '==', grondplanId)
        )
        
        const markersSnapshot = await getDocs(markersQuery)
        const deletePromises = markersSnapshot.docs.map(markerDoc => 
          deleteDoc(doc(db, 'companyLocations', markerDoc.id))
        )
        
        await Promise.all(deletePromises)
      } catch (error) {
        console.error('Error deleting company locations:', error)
        throw error
      }
    }
    
    // Watch for loading state changes
    watch(() => loading.value, async (newLoading) => {
      if (!newLoading && currentGrondplan.value && mapContainer.value && !map.value) {
        await nextTick()
        const mapInitialized = await initializeMap()
        if (mapInitialized) {
          await loadFloorPlanImage()
        }
      }
    })
    
    // Load companies from Firebase
    const loadCompanies = async () => {
      try {
        const companiesSnapshot = await getDocs(collection(db, 'bedrijf'))
        companies.value = companiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        // Debug: Log companies and their verification status
        console.log('Loaded companies:', companies.value.length)
        companies.value.forEach(company => {
          console.log(`Company: ${company.bedrijfsnaam || company.name}, Status: ${company.verificatieStatus || 'no status'}`)
        })
      } catch (error) {
        console.error('Error loading companies:', error)
      }
    }
    
    // Lifecycle
    onMounted(async () => {
      await loadGrondplannen()
      await loadCompanies()
      await loadAllCompanyLocations()
    })
    
    onBeforeUnmount(() => {
      if (map.value) {
        map.value.remove()
      }
      
      delete window.navigateToCompany
      delete window.editMarker
    })
    
    return {
      // State
      grondplannen,
      currentGrondplanId,
      currentGrondplan,
      loading,
      mapContainer,
      companyMarkers,
      visibleMarkers,
      showCompanyModal,
      selectedLocation,
      editingMarker,
      editMode,
      showUploadModal,
      uploading,
      showDeleteModal,
      deleting,
      newGrondplan,
      selectedFile,
      companies,
      allCompanyLocations,
      
      // Methods
      selectGrondplan,
      toggleEditMode,
      zoomIn,
      zoomOut,
      resetView,
      selectCompany,
      closeCompanyModal,
      saveCompanyLocation,
      deleteCompanyLocation,
      handleFileSelect,
      closeModal,
      uploadGrondplan,
      formatDate,
      editGrondplan,
      showDeleteConfirmation,
      closeDeleteModal,
      confirmDeleteGrondplan
    }
  }
}
</script>

<style scoped>
.grondplan-interactive {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8f9fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: white;
  border-bottom: 1px solid #eee;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-content h1 {
  margin: 0;
  color: #333;
  font-size: 1.8rem;
  font-weight: 600;
}

.page-subtitle {
  margin: 4px 0 0 0;
  color: #666;
  font-size: 0.95rem;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  height: calc(100vh - 200px);
}

.grondplan-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 0;
}

.grondplan-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.grondplan-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: white;
  border-bottom: 1px solid #eee;
}

.grondplan-title h2 {
  margin: 0;
  color: #333;
  font-size: 1.4rem;
}

.grondplan-controls {
  display: flex;
  gap: 20px;
  align-items: center;
}

.mode-controls .mode-btn {
  padding: 8px 16px;
  border: 2px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.mode-btn.active {
  background: #007bff;
  color: white;
}

.zoom-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: #f0f0f0;
  border-color: #007bff;
}

.delete-btn:hover {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.search-container {
  padding: 20px 30px;
  background: white;
  border-bottom: 1px solid #eee;
}

/* LeafletJS Map Container */
.leaflet-map-container {
  flex: 1;
  position: relative;
  background: #f0f0f0;
  min-height: 400px;
  height: 100%;
  width: 100%;
}

:deep(.leaflet-container) {
  height: 100% !important;
  width: 100% !important;
  min-height: 400px;
}

/* Custom marker styles */
:deep(.company-marker-icon) {
  background: none;
  border: none;
}

:deep(.marker-content) {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

:deep(.marker-dot) {
  width: 20px;
  height: 20px;
  background: #007bff;
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  position: relative;
  z-index: 2;
}

:deep(.marker-label) {
  background: rgba(0, 123, 255, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
  margin-top: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* Custom popup styles */
:deep(.company-popup-container .leaflet-popup-content-wrapper) {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}

:deep(.company-popup) {
  min-width: 250px;
}

:deep(.popup-header) {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

:deep(.popup-logo) {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: 6px;
}

:deep(.popup-logo-placeholder) {
  width: 40px;
  height: 40px;
  background: #007bff;
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.2rem;
}

:deep(.popup-header h3) {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

:deep(.popup-content p) {
  margin: 8px 0;
  color: #666;
  font-size: 0.9rem;
}

:deep(.popup-actions) {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

:deep(.popup-btn) {
  padding: 6px 12px;
  border: 1px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

:deep(.popup-btn:hover) {
  background: #007bff;
  color: white;
}

:deep(.edit-btn) {
  border-color: #28a745;
  color: #28a745;
}

:deep(.edit-btn:hover) {
  background: #28a745;
  color: white;
}

.grondplan-info {
  padding: 20px 30px;
  background: white;
  border-top: 1px solid #eee;
}

.grondplan-info p {
  margin: 5px 0;
  color: #666;
  font-size: 0.9rem;
}

/* Sidebar styles */
.grondplan-sidebar {
  width: 350px;
  background: white;
  border-left: 1px solid #eee;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.sidebar-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
}

.grondplan-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.grondplan-item {
  display: flex;
  padding: 12px;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e9ecef;
}

.grondplan-item:hover,
.grondplan-item.active {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #007bff;
}

.grondplan-item.active {
  background: #e9f4ff;
}

.grondplan-thumbnail {
  width: 100px;
  height: 75px;
  flex-shrink: 0;
  margin-right: 16px;
  border-radius: 6px;
  overflow: hidden;
  background-color: #f0f0f0;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.grondplan-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.grondplan-info h4 {
  margin: 0 0 4px 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.grondplan-date,
.grondplan-location {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.grondplan-actions {
  display: flex;
  align-items: center;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.action-btn:hover {
  background: #f0f0f0;
}

/* Loading and empty states */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-grondplan {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  text-align: center;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.upload-button-secondary {
  margin-top: 16px;
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-button:hover {
  background: #f0f0f0;
}

.upload-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
}

.form-group small {
  color: #666;
  font-size: 0.85rem;
  margin-top: 4px;
  display: block;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 30px;
}

.cancel-button {
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  cursor: pointer;
}

.submit-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  cursor: pointer;
}

.submit-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.delete-button {
  background: #dc3545;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  cursor: pointer;
}

.delete-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #dc3545;
  font-weight: 500;
  margin-bottom: 16px;
}

.warning-icon {
  font-size: 1.2rem;
}

.delete-note {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.modal-body {
  padding: 20px;
}

.no-grondplannen {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.upload-button-small {
  margin-top: 12px;
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .grondplan-sidebar {
    width: 100%;
    max-height: 200px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .grondplan-title {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .grondplan-controls {
    justify-content: space-between;
  }
}
</style>

