<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ isEditing ? 'Bedrijfslocatie bewerken' : 'Bedrijf plaatsen' }}</h3>
        <button @click="closeModal" class="close-button">×</button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="saveLocation">
          <div class="form-group">
            <label for="company-select">Bedrijf:</label>
            <select 
              id="company-select"
              v-model="selectedCompanyId" 
              required
              :disabled="isEditing"
              class="form-select"
            >
              <option value="">Selecteer een bedrijf...</option>
              <option 
                v-for="company in availableCompanies" 
                :key="company.id" 
                :value="company.id"
              >
                {{ company.bedrijfsnaam || company.name }} - {{ company.industry || company.branche }}
              </option>
            </select>
            <small v-if="isEditing" class="form-note">
              Bedrijf kan niet worden gewijzigd tijdens bewerken
            </small>
          </div>
          
          <div class="form-group">
            <label>Positie:</label>
            <div class="position-info">
              <div class="position-field">
                <label for="position-x">X-coördinaat:</label>
                <input 
                  id="position-x"
                  type="number" 
                  v-model.number="locationData.x" 
                  step="0.1" 
                  min="0" 
                  max="100" 
                  required
                  class="form-input"
                />
                <span class="unit">%</span>
              </div>
              <div class="position-field">
                <label for="position-y">Y-coördinaat:</label>
                <input 
                  id="position-y"
                  type="number" 
                  v-model.number="locationData.y" 
                  step="0.1" 
                  min="0" 
                  max="100" 
                  required
                  class="form-input"
                />
                <span class="unit">%</span>
              </div>
            </div>
            <small class="form-note">
              Coördinaten worden automatisch ingesteld bij dubbelklikken op de kaart
            </small>
          </div>
          
          <div class="form-group">
            <label for="location-name">Locatienaam: *</label>
            <div class="location-name-input">
              <div class="custom-dropdown" ref="dropdownRef">
                <div class="dropdown-selected" @click="toggleDropdown">
                  <span>{{ locationData.locationName || 'Selecteer een locatie...' }}</span>
                  <span class="dropdown-arrow">▼</span>
                </div>
                <div v-if="dropdownOpen" class="dropdown-list">
                  <div v-for="locationName in availableLocationNames" :key="locationName" class="dropdown-item">
                    <span class="dropdown-label" @click="selectLocation(locationName)">
                      {{ locationName }}
                      <span v-if="getLocationInUseBy(locationName)" class="in-use">(in gebruik door: {{ getLocationInUseBy(locationName) }})</span>
                    </span>
                    <button type="button"
                      class="dropdown-delete"
                      :disabled="!!getLocationInUseBy(locationName)"
                      @click.stop="onDeleteLocationName(locationName)"
                      :title="getLocationInUseBy(locationName) ? 'Kan niet verwijderen: in gebruik door ' + getLocationInUseBy(locationName) : 'Verwijder deze locatie'"
                    >
                      ×
                    </button>
                  </div>
                  <div class="dropdown-item add-new" @click="showAddLocationInput">
                    + Nieuwe locatie toevoegen
                  </div>
                </div>
              </div>
              <div v-if="showCustomLocationInput" class="custom-location-input">
                <input 
                  id="custom-location-name"
                  type="text" 
                  v-model="customLocationName"
                  placeholder="Voer nieuwe locatienaam in..."
                  required
                  class="form-input"
                  @blur="onCustomLocationBlur"
                  @keyup.enter="onCustomLocationBlur"
                />
                <button 
                  type="button" 
                  @click="cancelCustomLocation" 
                  class="cancel-custom-btn"
                  title="Annuleren"
                >
                  ×
                </button>
              </div>
            </div>
            <small class="form-note">
              Selecteer een bestaande locatie of voeg een nieuwe toe
            </small>
          </div>
          
          <div class="form-group">
            <label for="notes">Notities (optioneel):</label>
            <textarea 
              id="notes"
              v-model="locationData.notes" 
              placeholder="Extra informatie over deze locatie..."
              rows="3"
              class="form-textarea"
            ></textarea>
          </div>
          
          <div class="selected-company-preview" v-if="selectedCompany">
            <div class="preview-header">
              <h4>Geselecteerd bedrijf:</h4>
            </div>
            <div class="company-card">
              <div class="company-logo">
                <img v-if="selectedCompany.logo" :src="selectedCompany.logo" :alt="selectedCompany.bedrijfsnaam || selectedCompany.name" />
                <div v-else class="logo-placeholder">{{ (selectedCompany.bedrijfsnaam || selectedCompany.name).charAt(0) }}</div>
              </div>
              <div class="company-info">
                <h5>{{ selectedCompany.bedrijfsnaam || selectedCompany.name }}</h5>
                <p class="company-industry">{{ selectedCompany.industry || selectedCompany.branche }}</p>
                <p class="company-description" v-if="selectedCompany.description">
                  {{ selectedCompany.description }}
                </p>
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-button">
              Annuleren
            </button>
            <button 
              v-if="isEditing" 
              type="button" 
              @click="deleteLocation" 
              class="delete-button"
              :disabled="saving || deleting"
            >
              {{ deleting ? 'Verwijderen...' : 'Verwijderen' }}
            </button>
            <button 
              type="submit" 
              class="save-button"
              :disabled="!selectedCompanyId || saving || deleting"
            >
              {{ saving ? 'Opslaan...' : (isEditing ? 'Bijwerken' : 'Plaatsen') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { locationService } from '../../../services/locationService'
import { companyLocationService } from '../../../services/companyLocationService'
import { notificationService } from '../../../services/notificationService';
import { db } from '../../../firebase/config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
// Companies will be passed as props from parent component

export default {
  name: 'CompanyLocationModal',
  props: {
    location: {
      type: Object,
      required: true
    },
    floor: {
      type: String,
      required: true
    },
    floorName: {
      type: String,
      required: true,
    },
    existingMarker: {
      type: Object,
      default: null
    },
    companies: {
      type: Array,
      required: true
    },
    placedMarkers: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'save', 'delete'],
  setup(props, { emit }) {
    const selectedCompanyId = ref('')
    const saving = ref(false)
    const deleting = ref(false)
    
    // Location name related reactive variables
    const availableLocationNames = ref([])
    const showCustomLocationInput = ref(false)
    const customLocationName = ref('')
    const locationNamesUnsubscribe = ref(null)
    
    const locationData = ref({
      x: props.location.x || 50,
      y: props.location.y || 50,
      notes: '',
      locationName: ''
    })
    
    const isEditing = computed(() => !!props.existingMarker)
    
    const selectedCompany = computed(() => {
      if (!selectedCompanyId.value) return null
      return props.companies.find(c => c.id === selectedCompanyId.value)
    })
    
    const availableCompanies = computed(() => {
      // Get a list of company IDs that are already placed on the current floor plan
      const placedCompanyIds = props.placedMarkers.map(marker => marker.companyId);

      if (isEditing.value) {
        // If editing an existing marker, we only need to show that one company.
        return props.companies.filter(c => c.id === selectedCompanyId.value);
      }
      
      // When adding a new marker, show only verified companies that have not yet been placed.
      return props.companies.filter(company => {
        const isVerified = company.verificatieStatus === 'goedgekeurd';
        const isAlreadyPlaced = placedCompanyIds.includes(company.id);
        return isVerified && !isAlreadyPlaced;
      });
    })
    
    const filteredLocationNames = computed(() => {
      // Locatienamen die al in gebruik zijn op dit grondplan
      const inUse = props.placedMarkers
        .filter(marker => marker.locationName && (!isEditing.value || marker.id !== props.existingMarker?.id))
        .map(marker => marker.locationName)
      return availableLocationNames.value.filter(name =>
        // Alleen tonen als niet in gebruik, of als je deze locatie aan het bewerken bent
        !inUse.includes(name) || (isEditing.value && props.existingMarker?.locationName === name)
      )
    })
    
    // Location name functions
    const loadLocationNames = async () => {
      try {
        const names = await locationService.getLocationNames(props.floor)
        availableLocationNames.value = names
      } catch (error) {
        console.error('Error loading location names:', error)
      }
    }
    
    const onLocationNameChange = () => {
      if (locationData.value.locationName === '__custom__') {
        showCustomLocationInput.value = true
        customLocationName.value = ''
        locationData.value.locationName = ''
        // Focus on the custom input after Vue updates the DOM
        setTimeout(() => {
          const customInput = document.getElementById('custom-location-name')
          if (customInput) customInput.focus()
        }, 100)
      }
    }
    
    const onCustomLocationBlur = async () => {
      const trimmedName = customLocationName.value.trim()
      if (trimmedName) {
        // Check if location name already exists
        const nameExists = availableLocationNames.value.some(name => 
          name.toLowerCase() === trimmedName.toLowerCase()
        )
        
        if (nameExists) {
          alert('Deze locatienaam bestaat al. Kies een andere naam.')
          return
        }
        
        // Add new location name to Firebase
        const success = await locationService.addLocationName(props.floor, trimmedName)
        if (success) {
          locationData.value.locationName = trimmedName
          showCustomLocationInput.value = false
          customLocationName.value = ''
          // Reload location names to get the updated list
          await loadLocationNames()
        } else {
          alert('Er is een fout opgetreden bij het toevoegen van de locatienaam.')
        }
      } else {
        cancelCustomLocation()
      }
    }
    
    const cancelCustomLocation = () => {
      showCustomLocationInput.value = false
      customLocationName.value = ''
      locationData.value.locationName = ''
    }
    
    const closeModal = () => {
      // Cleanup subscription when closing modal
      if (locationNamesUnsubscribe.value) {
        locationNamesUnsubscribe.value()
        locationNamesUnsubscribe.value = null
      }
      emit('close')
    }
    
    const saveLocation = async () => {
      if (saving.value || deleting.value) return;
      saving.value = true;
      try {
        const dataToSave = {
          companyId: selectedCompanyId.value,
          grondplanId: props.floor,
          x: locationData.value.x,
          y: locationData.value.y,
          locationName: locationData.value.locationName,
          notes: locationData.value.notes,
          companyName: selectedCompany.value?.bedrijfsnaam || selectedCompany.value?.name || '',
          floorName: props.floorName || '',
        };
        
        const savedLocation = await companyLocationService.saveLocation(isEditing.value ? props.location.id : null, dataToSave);
        
        // Notification logic
        await handleStudentNotifications(
          selectedCompanyId.value,
          selectedCompany.value?.bedrijfsnaam,
          locationData.value.locationName,
          props.floorName
        );

        emit('save', savedLocation);
        closeModal();
      } catch (error) {
        console.error('Error saving location:', error);
        // TODO: show error message to user
      } finally {
        saving.value = false;
      }
    }
    
    const handleStudentNotifications = async (companyId, companyName, locationName, floorName) => {
        try {
            // 1. Find all appointments for this company
            const appointmentsQuery = query(collection(db, 'afspraken'), where('bedrijfId', '==', companyId));
            const appointmentsSnap = await getDocs(appointmentsQuery);

            if (appointmentsSnap.empty) {
                console.log('No appointments found for this company, no notifications sent.');
                return;
            }

            // 2. Get unique student UIDs
            const studentUids = [...new Set(appointmentsSnap.docs.map(doc => doc.data().studentUid))];

            // 3. Create a notification for each student
            for (const studentId of studentUids) {
                if (studentId) {
                  await notificationService.createStudentAppointmentLocationSetNotification(
                    studentId,
                    companyName,
                    locationName,
                    floorName
                  );
                }
            }

            console.log(`Sent location notifications to ${studentUids.length} students.`);
        } catch (error) {
            console.error('Error sending student location notifications:', error);
        }
    };
    
    const deleteLocation = async () => {
      if (!props.existingMarker) return
      
      if (!confirm('Weet je zeker dat je deze bedrijfslocatie wilt verwijderen?')) {
        return
      }
      
      deleting.value = true
      
      try {
        emit('delete', props.existingMarker.id)
      } catch (error) {
        console.error('Error deleting location:', error)
        alert('Er is een fout opgetreden bij het verwijderen van de locatie.')
      } finally {
        deleting.value = false
      }
    }
    
    const deleteLocationName = async (locationName) => {
      if (!confirm(`Weet je zeker dat je locatie '${locationName}' wilt verwijderen?`)) return;
      await locationService.removeLocationName(props.floor, locationName);
      await loadLocationNames();
      if (locationData.value.locationName === locationName) {
        locationData.value.locationName = '';
      }
    }
    
    // Initialize form data when editing
    onMounted(async () => {
      // Load available location names
      await loadLocationNames()
      
      // Set up real-time subscription for location names
      locationNamesUnsubscribe.value = await locationService.subscribeToLocationNames(
        props.floor, 
        (names) => {
          availableLocationNames.value = names
        }
      )
      
      if (props.existingMarker) {
        selectedCompanyId.value = props.existingMarker.companyId
        locationData.value = {
          x: props.location.x,
          y: props.location.y,
          notes: props.existingMarker.notes || '',
          locationName: props.existingMarker.locationName || ''
        }
      } else {
        locationData.value = {
          x: props.location.x,
          y: props.location.y,
          notes: '',
          locationName: ''
        }
      }
    })
    
    // Cleanup subscription when component unmounts
    onUnmounted(() => {
      if (locationNamesUnsubscribe.value) {
        locationNamesUnsubscribe.value()
        locationNamesUnsubscribe.value = null
      }
    })
    
    // Watch for location prop changes (when user clicks on map or drags marker)
    watch(() => props.location, (newLocation) => {
      locationData.value.x = newLocation.x
      locationData.value.y = newLocation.y
    }, { deep: true })
    
    // Helper: door wie is deze locatie in gebruik?
    function getLocationInUseBy(locationName) {
      const marker = props.placedMarkers.find(m => m.locationName === locationName)
      if (!marker) return null
      // Als je deze locatie aan het bewerken bent, mag je wel verwijderen
      if (isEditing.value && props.existingMarker?.locationName === locationName && props.existingMarker?.id === marker.id) return null
      const company = props.companies.find(c => c.id === marker.companyId)
      return company ? (company.bedrijfsnaam || company.name) : 'Onbekend bedrijf'
    }
    // Handler voor verwijderen
    async function onDeleteLocationName(locationName) {
      if (getLocationInUseBy(locationName)) {
        alert('Deze locatie is in gebruik en kan niet verwijderd worden.')
        return
      }
      await deleteLocationName(locationName)
    }
    
    const dropdownOpen = ref(false)
    const dropdownRef = ref(null)
    function toggleDropdown() {
      dropdownOpen.value = !dropdownOpen.value
    }
    function closeDropdown() {
      dropdownOpen.value = false
    }
    function selectLocation(locationName) {
      locationData.value.locationName = locationName
      closeDropdown()
    }
    // Buiten klikken sluit dropdown
    function handleClickOutside(event) {
      if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        closeDropdown()
      }
    }
    onMounted(() => {
      document.addEventListener('mousedown', handleClickOutside)
    })
    onUnmounted(() => {
      document.removeEventListener('mousedown', handleClickOutside)
    })
    
    function showAddLocationInput() {
      showCustomLocationInput.value = true;
      closeDropdown();
    }
    // Focus op input als showCustomLocationInput true wordt
    watch(showCustomLocationInput, async (val) => {
      if (val) {
        await nextTick();
        const input = document.getElementById('custom-location-name');
        if (input) input.focus();
      } else {
        customLocationName.value = '';
      }
    });
    
    return {
      selectedCompanyId,
      saving,
      deleting,
      locationData,
      availableLocationNames,
      showCustomLocationInput,
      customLocationName,
      isEditing,
      selectedCompany,
      availableCompanies,
      onLocationNameChange,
      onCustomLocationBlur,
      cancelCustomLocation,
      closeModal,
      saveLocation,
      deleteLocation,
      deleteLocationName,
      filteredLocationNames,
      getLocationInUseBy,
      onDeleteLocationName,
      dropdownOpen,
      dropdownRef,
      toggleDropdown,
      closeDropdown,
      selectLocation,
      showAddLocationInput
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #e9ecef;
  color: #333;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
}

.form-select,
.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
}

.form-select:focus,
.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-select:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.form-note {
  display: block;
  margin-top: 6px;
  color: #666;
  font-size: 0.85rem;
  font-style: italic;
}

.position-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.position-field {
  position: relative;
}

.position-field label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 4px;
}

.position-field .unit {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 0.9rem;
  pointer-events: none;
}

.position-field input {
  padding-right: 40px;
}

.selected-company-preview {
  margin-top: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.preview-header h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 1rem;
  font-weight: 500;
}

.company-card {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.company-logo {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.company-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo-placeholder {
  width: 100%;
  height: 100%;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.4rem;
}

.company-info {
  flex: 1;
  min-width: 0;
}

.company-info h5 {
  margin: 0 0 4px 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
}

.company-industry {
  margin: 0 0 8px 0;
  color: #007bff;
  font-size: 0.9rem;
  font-weight: 500;
}

.company-description {
  margin: 0;
  color: #666;
  font-size: 0.85rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.cancel-button,
.delete-button,
.save-button {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.cancel-button {
  background: #6c757d;
  color: white;
}

.cancel-button:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.delete-button {
  background: #dc3545;
  color: white;
}

.delete-button:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-1px);
}

.save-button {
  background: #007bff;
  color: white;
}

.save-button:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-1px);
}

.delete-button:disabled,
.save-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

/* Responsive design */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .position-info {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .form-actions button {
    width: 100%;
  }
  
  .company-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .company-logo {
    width: 60px;
    height: 60px;
  }
}

/* Location name input styles */
.location-name-input {
  position: relative;
}

.custom-location-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-location-input .form-input {
  flex: 1;
}

.cancel-custom-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.cancel-custom-btn:hover {
  background: #c82333;
  transform: scale(1.05);
}

.cancel-custom-btn:active {
  transform: scale(0.95);
}

/* Animation for modal entrance */
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-content {
  animation: modalSlideIn 0.3s ease-out;
}

/* Custom dropdown styles */
.custom-dropdown {
  position: relative;
  width: 100%;
  max-width: 350px;
}
.dropdown-selected {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px 12px;
  background: #fff;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.dropdown-arrow {
  margin-left: 8px;
  font-size: 0.9em;
}
.dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  z-index: 10;
  max-height: 220px;
  overflow-y: auto;
}
.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  cursor: pointer;
  transition: background 0.15s;
}
.dropdown-item:hover {
  background: #f5f5f5;
}
.dropdown-label {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
}
.dropdown-delete {
  background: none;
  border: none;
  color: #e57373;
  font-size: 1.1em;
  cursor: pointer;
  margin-left: 8px;
  padding: 0 4px;
}
.dropdown-delete:disabled {
  color: #ccc;
  cursor: not-allowed;
}
.in-use {
  color: #888;
  font-size: 0.92em;
  margin-left: 4px;
}
.add-new {
  color: #007bff;
  font-weight: 500;
  cursor: pointer;
  border-top: 1px solid #eee;
  margin-top: 4px;
}
.add-new:hover {
  background: #eaf4ff;
}
</style>

