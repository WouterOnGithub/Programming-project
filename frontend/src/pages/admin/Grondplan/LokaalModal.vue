<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ isEditing ? 'Lokaal bewerken' : 'Nieuw lokaal plaatsen' }}</h3>
        <button @click="closeModal" class="close-button">×</button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="saveLokaal">
          <div class="form-group">
            <label for="lokaal-naam">Lokaal naam:</label>
            <input 
              id="lokaal-naam"
              type="text" 
              v-model="lokaalData.naam" 
              required
              placeholder="Bijv. Lokaal A1, Vergaderzaal, Kantoor..."
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label for="lokaal-beschrijving">Beschrijving (optioneel):</label>
            <textarea 
              id="lokaal-beschrijving"
              v-model="lokaalData.beschrijving" 
              placeholder="Beschrijving van het lokaal..."
              rows="3"
              class="form-textarea"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label>Positie en grootte:</label>
            <div class="position-grid">
              <div class="position-field">
                <label for="position-x">X-positie:</label>
                <input 
                  id="position-x"
                  type="number" 
                  v-model.number="lokaalData.x" 
                  step="any" 
                  min="0" 
                  max="100" 
                  required
                  class="form-input"
                />
                <span class="unit">%</span>
              </div>
              <div class="position-field">
                <label for="position-y">Y-positie:</label>
                <input 
                  id="position-y"
                  type="number" 
                  v-model.number="lokaalData.y" 
                  step="any" 
                  min="0" 
                  max="100" 
                  required
                  class="form-input"
                />
                <span class="unit">%</span>
              </div>
              <div class="position-field">
                <label for="lokaal-breedte">Breedte:</label>
                <input 
                  id="lokaal-breedte"
                  type="number" 
                  v-model.number="lokaalData.breedte" 
                  step="0.1" 
                  min="1" 
                  max="50" 
                  required
                  class="form-input"
                />
                <span class="unit">%</span>
              </div>
              <div class="position-field">
                <label for="lokaal-hoogte">Hoogte:</label>
                <input 
                  id="lokaal-hoogte"
                  type="number" 
                  v-model.number="lokaalData.hoogte" 
                  step="0.1" 
                  min="1" 
                  max="50" 
                  required
                  class="form-input"
                />
                <span class="unit">%</span>
              </div>
            </div>
            <small class="form-note">
              Coördinaten worden automatisch ingesteld bij klikken op de kaart
            </small>
          </div>
          
          <div class="form-group">
            <label for="lokaal-kleur">Kleur:</label>
            <div class="color-picker">
              <input 
                id="lokaal-kleur"
                type="color" 
                v-model="lokaalData.kleur" 
                class="color-input"
              />
              <span class="color-preview" :style="{ backgroundColor: lokaalData.kleur }"></span>
              <span class="color-label">{{ lokaalData.kleur }}</span>
            </div>
          </div>
          
          <div class="lokaal-preview" v-if="lokaalData.naam">
            <div class="preview-header">
              <h4>Voorbeeld:</h4>
            </div>
            <div class="lokaal-preview-box" :style="previewStyle">
              <span class="lokaal-preview-name">{{ lokaalData.naam }}</span>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-button">
              Annuleren
            </button>
            <button 
              v-if="isEditing" 
              type="button" 
              @click="deleteLokaal" 
              class="delete-button"
              :disabled="saving || deleting"
            >
              {{ deleting ? 'Verwijderen...' : 'Verwijderen' }}
            </button>
            <button 
              type="submit" 
              class="save-button"
              :disabled="!lokaalData.naam || saving || deleting"
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
import { ref, computed, watch, onMounted } from 'vue'

export default {
  name: 'LokaalModal',
  props: {
    location: {
      type: Object,
      required: true
    },
    grondplanId: {
      type: String,
      required: true
    },
    existingLokaal: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'save', 'delete'],
  setup(props, { emit }) {
    const saving = ref(false)
    const deleting = ref(false)
    
    const lokaalData = ref({
      naam: '',
      beschrijving: '',
      x: props.location.x || 50,
      y: props.location.y || 50,
      breedte: 15,
      hoogte: 10,
      kleur: '#3498db'
    })
    
    const isEditing = computed(() => !!props.existingLokaal)
    
    const previewStyle = computed(() => ({
      backgroundColor: lokaalData.value.kleur + '40', // 25% opacity
      border: `2px solid ${lokaalData.value.kleur}`,
      width: '200px',
      height: '120px',
      position: 'relative',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }))
    
    const closeModal = () => {
      emit('close')
    }
    
    const saveLokaal = async () => {
      if (!lokaalData.value.naam.trim()) return
      
      saving.value = true
      
      try {
        const lokaalToSave = {
          naam: lokaalData.value.naam.trim(),
          beschrijving: lokaalData.value.beschrijving.trim(),
          x: lokaalData.value.x,
          y: lokaalData.value.y,
          breedte: lokaalData.value.breedte,
          hoogte: lokaalData.value.hoogte,
          kleur: lokaalData.value.kleur,
          grondplanId: props.grondplanId
        }
        
        if (isEditing.value) {
          lokaalToSave.id = props.existingLokaal.id
        }
        
        emit('save', lokaalToSave)
      } catch (error) {
        console.error('Error saving lokaal:', error)
        alert('Er is een fout opgetreden bij het opslaan van het lokaal.')
      } finally {
        saving.value = false
      }
    }
    
    const deleteLokaal = async () => {
      if (!props.existingLokaal) return
      
      if (!confirm('Weet je zeker dat je dit lokaal wilt verwijderen? Alle bedrijven in dit lokaal worden ook verwijderd.')) {
        return
      }
      
      deleting.value = true
      
      try {
        emit('delete', props.existingLokaal.id)
      } catch (error) {
        console.error('Error deleting lokaal:', error)
        alert('Er is een fout opgetreden bij het verwijderen van het lokaal.')
      } finally {
        deleting.value = false
      }
    }
    
    // Initialize form data when editing
    onMounted(() => {
      if (props.existingLokaal) {
        lokaalData.value = {
          naam: props.existingLokaal.naam || '',
          beschrijving: props.existingLokaal.beschrijving || '',
          x: props.existingLokaal.x || 50,
          y: props.existingLokaal.y || 50,
          breedte: props.existingLokaal.breedte || 15,
          hoogte: props.existingLokaal.hoogte || 10,
          kleur: props.existingLokaal.kleur || '#3498db'
        }
      } else {
        lokaalData.value.x = props.location.x
        lokaalData.value.y = props.location.y
      }
    })
    
    // Watch for location prop changes (when user clicks on map)
    watch(() => props.location, (newLocation) => {
      if (!isEditing.value) {
        lokaalData.value.x = newLocation.x
        lokaalData.value.y = newLocation.y
      }
    }, { deep: true })
    
    return {
      saving,
      deleting,
      lokaalData,
      isEditing,
      previewStyle,
      closeModal,
      saveLokaal,
      deleteLokaal
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
  max-width: 600px;
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

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-note {
  display: block;
  margin-top: 6px;
  color: #666;
  font-size: 0.85rem;
  font-style: italic;
}

.position-grid {
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

.color-picker {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-input {
  width: 50px;
  height: 40px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  cursor: pointer;
  background: none;
}

.color-preview {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid #e1e5e9;
}

.color-label {
  font-family: monospace;
  color: #666;
  font-size: 0.9rem;
}

.lokaal-preview {
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

.lokaal-preview-box {
  margin: 0 auto;
}

.lokaal-preview-name {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
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
  
  .position-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .form-actions button {
    width: 100%;
  }
  
  .color-picker {
    flex-direction: column;
    align-items: flex-start;
  }
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
</style>

