<template>
  <div class="grondplan-list">
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

    <div class="grondplan-container">
      <div v-if="currentGrondplan" class="grondplan-viewer">
        <div class="grondplan-header">
          <h2>{{ currentGrondplan.name }}</h2>
          <div class="grondplan-controls">
            <button @click="zoomIn" class="control-btn">🔍+</button>
            <button @click="zoomOut" class="control-btn">🔍-</button>
            <button @click="resetZoom" class="control-btn">⟲</button>
          </div>
        </div>
        
        <div class="grondplan-display" ref="grondplanContainer">
          <img 
            :src="currentGrondplan.imageUrl" 
            :alt="currentGrondplan.name"
            :style="{ transform: `scale(${zoomLevel})` }"
            class="grondplan-image"
            @wheel="handleWheel"
          />
        </div>
        
        <div class="grondplan-info">
          <p><strong>Geüpload op:</strong> {{ formatDate(currentGrondplan.uploadDate) }}</p>
          <p><strong>Bestandsgrootte:</strong> {{ currentGrondplan.fileSize }}</p>
          <p><strong>Gebouw:</strong> {{ currentGrondplan.building }}</p>
          <p><strong>Verdieping:</strong> {{ currentGrondplan.floors }}</p>
        </div>
      </div>
      
      <div v-else class="no-grondplan">
        <div class="empty-state">
          <div class="empty-icon">📍</div>
          <h3>Geen grondplan beschikbaar</h3>
          <p>Upload een grondplan om te beginnen</p>
          <button @click="showUploadModal = true" class="upload-button-secondary">
            Grondplan uploaden
          </button>
        </div>
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

    <!-- Grondplan History Sidebar -->
    <div class="grondplan-sidebar">
      <h3>Grondplan Geschiedenis</h3>
      <div v-if="loading" class="loading">
        Laden...
      </div>
      <div v-else class="grondplan-list-items">
        <div 
          v-for="grondplan in grondplannen" 
          :key="grondplan.id"
          @click="selectGrondplan(grondplan)"
          :class="['grondplan-item', { active: currentGrondplan?.id === grondplan.id }]"
        >
          <div class="grondplan-thumbnail">
            <img :src="grondplan.thumbnailUrl" :alt="grondplan.name" />
          </div>
          <div class="grondplan-details">
            <h4>{{ grondplan.name }}</h4>
            <p class="upload-date">{{ formatDate(grondplan.uploadDate) }}</p>
            <p class="building-info">{{ grondplan.building }} - {{ grondplan.floors }}</p>
          </div>
          <button 
            @click.stop="deleteGrondplanConfirm(grondplan.id)" 
            class="delete-button"
            title="Verwijderen"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db, storage } from '../../../firebase/config'
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

export default {
  name: 'GrondplanList',
  data() {
    return {
      grondplannen: [],
      currentGrondplan: null,
      showUploadModal: false,
      zoomLevel: 1,
      loading: true,
      uploading: false,
      newGrondplan: {
        name: '',
        building: '',
        floors: '',
        description: ''
      },
      selectedFile: null
    }
  },
  async mounted() {
    await this.loadGrondplannen()
  },
  methods: {
    async loadGrondplannen() {
      this.loading = true
      const querySnapshot = await getDocs(collection(db, 'grondplan'))
      this.grondplannen = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      if (this.grondplannen.length > 0) {
        this.currentGrondplan = this.grondplannen[0]
      }
      this.loading = false
    },
    
    selectGrondplan(grondplan) {
      this.currentGrondplan = grondplan
      this.resetZoom()
    },
    
    zoomIn() {
      this.zoomLevel = Math.min(this.zoomLevel * 1.2, 3)
    },
    
    zoomOut() {
      this.zoomLevel = Math.max(this.zoomLevel / 1.2, 0.5)
    },
    
    resetZoom() {
      this.zoomLevel = 1
    },
    
    handleWheel(event) {
      event.preventDefault()
      if (event.deltaY < 0) {
        this.zoomIn()
      } else {
        this.zoomOut()
      }
    },
    
    handleFileSelect(event) {
      this.selectedFile = event.target.files[0]
    },
    
    async uploadGrondplan() {
      if (!this.selectedFile) return;
      
      try {
        this.uploading = true;
        
        // Upload image to Firebase Storage
        const imageRef = storageRef(storage, `grondplannen/${Date.now()}_${this.selectedFile.name}`);
        await uploadBytes(imageRef, this.selectedFile);
        const imageUrl = await getDownloadURL(imageRef);
        
        // Create thumbnail (using same image for now)
        const thumbnailUrl = imageUrl;
        
        const grondplanData = {
          name: this.newGrondplan.name,
          building: this.newGrondplan.building,
          floors: this.newGrondplan.floors,
          description: this.newGrondplan.description,
          imageUrl: imageUrl,
          thumbnailUrl: thumbnailUrl,
          fileSize: this.formatFileSize(this.selectedFile.size),
          uploadDate: new Date()
        };
        
        await addDoc(collection(db, 'grondplan'), grondplanData);
        
        await this.loadGrondplannen();
        this.closeModal();
        
      } catch (error) {
        console.error('Fout bij uploaden grondplan:', error);
        alert('Er is een fout opgetreden bij het uploaden van het grondplan.');
      } finally {
        this.uploading = false;
      }
    },
    
    async deleteGrondplanConfirm(id) {
      if (confirm('Weet je zeker dat je dit grondplan wilt verwijderen?')) {
        await this.deleteGrondplan(id)
      }
    },
    
    async deleteGrondplan(id) {
      try {
        // Get the grondplan document first to get the image URLs
        const grondplanDoc = await getDoc(doc(db, 'grondplan', id));
        if (grondplanDoc.exists()) {
          const grondplanData = grondplanDoc.data();
          
          // Delete the image from Storage if it exists
          if (grondplanData.imageUrl) {
            const imageRef = storageRef(storage, grondplanData.imageUrl);
            try {
              await deleteObject(imageRef);
            } catch (error) {
              console.error('Error deleting image from storage:', error);
            }
          }
          
          // Delete the document from Firestore
          await deleteDoc(doc(db, 'grondplan', id));
          await this.loadGrondplannen();
        }
      } catch (error) {
        console.error('Error deleting grondplan:', error);
        alert('Er is een fout opgetreden bij het verwijderen van het grondplan.');
      }
    },
    
    closeModal() {
      this.showUploadModal = false
      this.newGrondplan = { 
        name: '', 
        building: '', 
        floors: '', 
        description: '' 
      }
      this.selectedFile = null
    },
    
    formatDate(date) {
      if (!date) return '-';
      // Firestore Timestamp naar JS Date
      if (date.seconds) {
        date = new Date(date.seconds * 1000);
      }
      return new Intl.DateTimeFormat('nl-NL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
.grondplan-list {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  padding: 20px;
}

.page-header {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 20px;
}

.header-content h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.header-content p {
  color: #666;
  margin: 0;
  font-size: 1.1rem;
}

.grondplan-container {
  grid-column: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-icon {
  font-size: 1.2rem;
}

.grondplan-viewer {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.grondplan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.grondplan-header h2 {
  margin: 0;
  color: #333;
}

.grondplan-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover {
  background: #e9ecef;
}

.grondplan-display {
  flex: 1;
  overflow: auto;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f8f9fa;
}

.grondplan-image {
  max-width: 100%;
  max-height: 100%;
  transition: transform 0.2s ease;
  cursor: grab;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.grondplan-image:active {
  cursor: grabbing;
}

.grondplan-info {
  padding: 20px;
  border-top: 1px solid #eee;
  background: #f8f9fa;
}

.grondplan-info p {
  margin: 5px 0;
  color: #666;
}

.no-grondplan {
  height: 100%;
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
  margin-bottom: 20px;
}

.upload-button-secondary {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 20px;
}

.grondplan-sidebar {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 20px;
  overflow-y: auto;
}

.grondplan-sidebar h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.2rem;
}

.grondplan-list-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.grondplan-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.grondplan-item:hover {
  background: #f8f9fa;
  border-color: #007bff;
}

.grondplan-item.active {
  background: #e3f2fd;
  border-color: #007bff;
}

.grondplan-thumbnail {
  width: 60px;
  height: 40px;
  overflow: hidden;
  border-radius: 4px;
  flex-shrink: 0;
}

.grondplan-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.grondplan-details {
  flex: 1;
  min-width: 0;
}

.grondplan-details h4 {
  margin: 0 0 4px 0;
  font-size: 0.9rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.upload-date {
  margin: 0;
  font-size: 0.8rem;
  color: #666;
}

.delete-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.6;
  transition: all 0.2s;
}

.delete-button:hover {
  opacity: 1;
  background: #fee;
}

/* Modal Styles */
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
  z-index: 1000;
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
  display: block;
  margin-top: 4px;
  color: #666;
  font-size: 0.85rem;
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

/* Responsive Design */
@media (max-width: 768px) {
  .grondplan-list {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
    height: auto;
    min-height: calc(100vh - 140px);
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .btn {
    width: 100%;
    justify-content: center;
  }
  
  .grondplan-sidebar {
    order: 3;
    max-height: 300px;
    margin-top: 20px;
  }
  
  .grondplan-list-items {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 10px;
    gap: 12px;
    -webkit-overflow-scrolling: touch;
  }
  
  .grondplan-item {
    flex-direction: column;
    min-width: 160px;
    text-align: center;
    padding: 8px;
  }

  .grondplan-thumbnail {
    width: 100%;
    height: 80px;
  }

  .grondplan-details {
    padding: 8px 0;
  }

  .grondplan-details h4 {
    font-size: 0.85rem;
  }

  .upload-date, .building-info {
    font-size: 0.75rem;
  }

  .grondplan-viewer {
    height: auto;
    min-height: 400px;
  }

  .grondplan-display {
    min-height: 300px;
  }

  .grondplan-controls {
    flex-wrap: wrap;
    gap: 4px;
  }

  .control-btn {
    padding: 6px 10px;
    font-size: 0.9rem;
  }

  .modal-content {
    width: 95%;
    margin: 10px;
  }

  .form-actions {
    flex-direction: column;
    gap: 8px;
  }

  .form-actions button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .grondplan-list {
    padding: 10px;
  }

  .page-header {
    margin-bottom: 16px;
  }

  .header-content h1 {
    font-size: 1.5rem;
  }

  .header-content p {
    font-size: 0.9rem;
  }

  .grondplan-viewer {
    min-height: 300px;
  }

  .grondplan-display {
    min-height: 200px;
    padding: 10px;
  }

  .grondplan-info {
    padding: 12px;
  }

  .grondplan-info p {
    font-size: 0.85rem;
  }

  .grondplan-sidebar {
    max-height: 250px;
  }

  .grondplan-item {
    min-width: 140px;
  }

  .grondplan-thumbnail {
    height: 60px;
  }

  .modal-content {
    width: 100%;
    margin: 0;
    border-radius: 0;
  }

  .form-group input,
  .form-group textarea {
    font-size: 0.9rem;
    padding: 10px;
  }

  .form-group label {
    font-size: 0.9rem;
  }

  .form-group small {
    font-size: 0.8rem;
  }
}
</style>

