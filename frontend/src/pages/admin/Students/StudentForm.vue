<template>
  <div class="student-form">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">{{ isEdit ? 'Student Bewerken' : 'Nieuwe Student' }}</h1>
        <p class="page-subtitle">{{ isEdit ? 'Wijzig de studentgegevens' : 'Voeg een nieuwe student toe aan het systeem' }}</p>
      </div>
      <div class="header-actions">
        <router-link to="/admin/students" class="btn btn-secondary">
          <span class="btn-icon">←</span>
          Terug naar lijst
        </router-link>
      </div>
    </div>

    <!-- Form -->
    <form @submit.prevent="submitForm" class="form-container">
      <div class="form-grid">
        <!-- Photo Upload Section -->
        <div class="form-section full-width">
          <h3 class="section-title">Profielfoto</h3>
          <div class="photo-upload">
            <div class="photo-preview">
              <img v-if="form.photoPreview" :src="form.photoPreview" alt="Student foto">
              <div v-else class="photo-placeholder">
                <span class="photo-icon">📷</span>
                <p>Geen foto geüpload</p>
              </div>
            </div>
            <div class="photo-controls">
              <input 
                type="file" 
                ref="photoInput" 
                @change="handlePhotoUpload" 
                accept="image/*"
                class="file-input"
                id="photo-upload"
              >
              <label for="photo-upload" class="btn btn-outline">
                <span class="btn-icon">📁</span>
                Upload foto
              </label>
              <button 
                v-if="form.photoPreview" 
                type="button" 
                @click="removePhoto" 
                class="btn btn-danger-outline"
              >
                <span class="btn-icon">🗑️</span>
                Verwijder foto
              </button>
            </div>
          </div>
        </div>

        <!-- Personal Information -->
        <div class="form-section">
          <h3 class="section-title">Persoonlijke Gegevens</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="firstName" class="form-label">Voornaam *</label>
              <input 
                type="text" 
                id="firstName"
                v-model="form.firstName" 
                class="form-input"
                :class="{ 'error': errors.firstName }"
                placeholder="Voer voornaam in"
                required
              >
              <span v-if="errors.firstName" class="error-message">{{ errors.firstName }}</span>
            </div>
            
            <div class="form-group">
              <label for="lastName" class="form-label">Achternaam *</label>
              <input 
                type="text" 
                id="lastName"
                v-model="form.lastName" 
                class="form-input"
                :class="{ 'error': errors.lastName }"
                placeholder="Voer achternaam in"
                required
              >
              <span v-if="errors.lastName" class="error-message">{{ errors.lastName }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="age" class="form-label">Leeftijd *</label>
            <input 
              type="number" 
              id="age"
              v-model="form.age" 
              class="form-input"
              :class="{ 'error': errors.age }"
              placeholder="Voer leeftijd in"
              min="16"
              max="100"
              required
            >
            <span v-if="errors.age" class="error-message">{{ errors.age }}</span>
          </div>
        </div>

        <!-- Study Information -->
        <div class="form-section">
          <h3 class="section-title">Studie Informatie</h3>
          
          <div class="form-group">
            <label for="studyYear" class="form-label">Studiejaar *</label>
            <select 
              id="studyYear"
              v-model="form.studyYear" 
              class="form-select"
              :class="{ 'error': errors.studyYear }"
              required
            >
              <option value="">Selecteer studiejaar</option>
              <option value="1e jaar">1e jaar</option>
              <option value="2e jaar">2e jaar</option>
              <option value="3e jaar">3e jaar</option>
              <option value="Afgestudeerd">Afgestudeerd</option>
            </select>
            <span v-if="errors.studyYear" class="error-message">{{ errors.studyYear }}</span>
          </div>

          <div class="form-group">
            <label for="domain" class="form-label">Domein *</label>
            <input 
              type="text" 
              id="domain"
              v-model="form.domain" 
              class="form-input"
              :class="{ 'error': errors.domain }"
              placeholder="Bijv. Informatica, Marketing, Grafisch Ontwerp"
              required
            >
            <span v-if="errors.domain" class="error-message">{{ errors.domain }}</span>
          </div>
        </div>

        <!-- Skills and Languages -->
        <div class="form-section">
          <h3 class="section-title">Vaardigheden & Talen</h3>
          
          <div class="form-group">
            <label for="skills" class="form-label">Keywords (Vaardigheden) *</label>
            <div class="skills-input">
              <input 
                type="text" 
                v-model="skillInput"
                @keydown.enter.prevent="addSkill"
                @keydown.comma.prevent="addSkill"
                class="form-input"
                placeholder="Voer vaardigheid in en druk op Enter"
              >
              <button type="button" @click="addSkill" class="btn btn-outline btn-sm">Toevoegen</button>
            </div>
            <div class="skills-list">
              <span 
                v-for="(skill, index) in form.skills" 
                :key="index"
                class="skill-tag"
              >
                {{ skill }}
                <button type="button" @click="removeSkill(index)" class="skill-remove">×</button>
              </span>
            </div>
            <span v-if="errors.skills" class="error-message">{{ errors.skills }}</span>
          </div>

          <div class="form-group">
            <label for="languages" class="form-label">Talenkennis *</label>
            <textarea 
              id="languages"
              v-model="form.languages" 
              class="form-textarea"
              :class="{ 'error': errors.languages }"
              placeholder="Bijv. Nederlands (moedertaal), Engels (vloeiend), Frans (basis)"
              rows="3"
              required
            ></textarea>
            <span v-if="errors.languages" class="error-message">{{ errors.languages }}</span>
          </div>
        </div>

        <!-- Professional Information -->
        <div class="form-section">
          <h3 class="section-title">Professionele Informatie</h3>
          
          <div class="form-group">
            <label for="linkedin" class="form-label">LinkedIn URL</label>
            <input 
              type="url" 
              id="linkedin"
              v-model="form.linkedin" 
              class="form-input"
              :class="{ 'error': errors.linkedin }"
              placeholder="https://linkedin.com/in/jouwprofiel"
            >
            <span v-if="errors.linkedin" class="error-message">{{ errors.linkedin }}</span>
          </div>

          <div class="form-group">
            <label for="opportunity" class="form-label">Gezochte Opportuniteit *</label>
            <select 
              id="opportunity"
              v-model="form.opportunity" 
              class="form-select"
              :class="{ 'error': errors.opportunity }"
              required
            >
              <option value="">Kies een type</option>
              <option value="Stage">Stage</option>
              <option value="Studentenjob">Studentenjob</option>
              <option value="Voltijdse job">Voltijdse job</option>
            </select>
            <span v-if="errors.opportunity" class="error-message">{{ errors.opportunity }}</span>
          </div>

          <div class="form-group">
            <label for="availableFrom" class="form-label">Beschikbaar vanaf *</label>
            <input 
              type="date" 
              id="availableFrom"
              v-model="form.availableFrom" 
              class="form-input"
              :class="{ 'error': errors.availableFrom }"
              required
            >
            <span v-if="errors.availableFrom" class="error-message">{{ errors.availableFrom }}</span>
          </div>
        </div>

        <!-- CV Upload -->
        <div class="form-section">
          <h3 class="section-title">CV Upload</h3>
          
          <div class="file-upload">
            <div class="file-preview">
              <div v-if="form.cvFile" class="file-info">
                <span class="file-icon">📄</span>
                <div class="file-details">
                  <p class="file-name">{{ form.cvFile.name }}</p>
                  <p class="file-size">{{ formatFileSize(form.cvFile.size) }}</p>
                </div>
                <button type="button" @click="removeCv" class="file-remove">×</button>
              </div>
              <div v-else class="file-placeholder">
                <span class="file-icon">📄</span>
                <p>Geen CV geüpload</p>
              </div>
            </div>
            <input 
              type="file" 
              ref="cvInput" 
              @change="handleCvUpload" 
              accept=".pdf,.doc,.docx"
              class="file-input"
              id="cv-upload"
            >
            <label for="cv-upload" class="btn btn-outline">
              <span class="btn-icon">📁</span>
              Upload CV
            </label>
          </div>
        </div>

        <!-- Introduction -->
        <div class="form-section full-width">
          <h3 class="section-title">Introductie</h3>
          
          <div class="form-group">
            <label for="introduction" class="form-label">Stel je kort voor *</label>
            <textarea 
              id="introduction"
              v-model="form.introduction" 
              class="form-textarea"
              :class="{ 'error': errors.introduction }"
              placeholder="Vertel kort over jezelf, je ambities en wat je zoekt..."
              rows="4"
              required
            ></textarea>
            <span v-if="errors.introduction" class="error-message">{{ errors.introduction }}</span>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <router-link to="/admin/students" class="btn btn-secondary">
          Annuleren
        </router-link>
        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="btn-icon">⏳</span>
          <span v-else class="btn-icon">💾</span>
          {{ isSubmitting ? 'Opslaan...' : (isEdit ? 'Wijzigingen Opslaan' : 'Student Aanmaken') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { db, storage } from '../../../firebase/config'
import { collection, addDoc, updateDoc, getDoc, doc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

export default {
  name: 'StudentForm',
  props: {
    id: String
  },
  data() {
    return {
      isEdit: false,
      isSubmitting: false,
      skillInput: '',
      form: {
        firstName: '',
        lastName: '',
        age: '',
        studyYear: '',
        domain: '',
        skills: [],
        languages: '',
        linkedin: '',
        opportunity: '',
        availableFrom: '',
        introduction: '',
        photoPreview: null,
        photoFile: null,
        cvFile: null
      },
      errors: {}
    }
  },
  async mounted() {
    this.isEdit = !!this.id;
    if (this.isEdit) {
      await this.loadStudent();
    }
  },
  methods: {
    async loadStudent() {
      const docSnap = await getDoc(doc(db, 'student', this.id))
      if (docSnap.exists()) {
        Object.assign(this.form, docSnap.data())
      }
    },
    
    handlePhotoUpload(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          alert('Bestand is te groot. Maximum grootte is 5MB.');
          return;
        }
        
        this.form.photoFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.form.photoPreview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    
    removePhoto() {
      this.form.photoPreview = null;
      this.form.photoFile = null;
      this.$refs.photoInput.value = '';
    },
    
    handleCvUpload(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          alert('Bestand is te groot. Maximum grootte is 10MB.');
          return;
        }
        this.form.cvFile = file;
      }
    },
    
    removeCv() {
      this.form.cvFile = null;
      this.$refs.cvInput.value = '';
    },
    
    addSkill() {
      const skill = this.skillInput.trim();
      if (skill && !this.form.skills.includes(skill)) {
        this.form.skills.push(skill);
        this.skillInput = '';
      }
    },
    
    removeSkill(index) {
      this.form.skills.splice(index, 1);
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    validateForm() {
      this.errors = {};
      
      if (!this.form.firstName.trim()) {
        this.errors.firstName = 'Voornaam is verplicht';
      }
      
      if (!this.form.lastName.trim()) {
        this.errors.lastName = 'Achternaam is verplicht';
      }
      
      if (!this.form.age || this.form.age < 16 || this.form.age > 100) {
        this.errors.age = 'Voer een geldige leeftijd in (16-100)';
      }
      
      if (!this.form.studyYear) {
        this.errors.studyYear = 'Studiejaar is verplicht';
      }
      
      if (!this.form.domain.trim()) {
        this.errors.domain = 'Domein is verplicht';
      }
      
      if (this.form.skills.length === 0) {
        this.errors.skills = 'Voeg minimaal één vaardigheid toe';
      }
      
      if (!this.form.languages.trim()) {
        this.errors.languages = 'Talenkennis is verplicht';
      }
      
      if (!this.form.opportunity) {
        this.errors.opportunity = 'Gezochte opportuniteit is verplicht';
      }
      
      if (!this.form.availableFrom) {
        this.errors.availableFrom = 'Beschikbaarheidsdatum is verplicht';
      }
      
      if (!this.form.introduction.trim()) {
        this.errors.introduction = 'Introductie is verplicht';
      }
      
      if (this.form.linkedin && !this.isValidUrl(this.form.linkedin)) {
        this.errors.linkedin = 'Voer een geldige URL in';
      }
      
      return Object.keys(this.errors).length === 0;
    },
    
    isValidUrl(string) {
      try {
        new URL(string);
        return true;
      } catch (_) {
        return false;
      }
    },
    
    async submitForm() {
      if (!this.validateForm()) {
        return;
      }
      this.isSubmitting = true;
      try {
        const studentData = { ...this.form };
        delete studentData.photoFile;
        delete studentData.cvFile;
        delete studentData.photoPreview;

        // Upload photo if exists
        if (this.form.photoFile) {
          const photoRef = storageRef(storage, `student_photos/${Date.now()}_${this.form.photoFile.name}`);
          await uploadBytes(photoRef, this.form.photoFile);
          studentData.photoUrl = await getDownloadURL(photoRef);
        }

        // Upload CV if exists
        if (this.form.cvFile) {
          const cvRef = storageRef(storage, `student_cvs/${Date.now()}_${this.form.cvFile.name}`);
          await uploadBytes(cvRef, this.form.cvFile);
          studentData.cvUrl = await getDownloadURL(cvRef);
        }

        if (this.isEdit) {
          await updateDoc(doc(db, 'student', this.id), studentData);
        } else {
          await addDoc(collection(db, 'student'), studentData);
        }
        this.$router.push('/admin/students');
      } catch (error) {
        alert('Fout bij opslaan student: ' + error.message);
      } finally {
        this.isSubmitting = false;
      }
    }
  }
}
</script>

<style scoped>
.student-form {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 20px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.page-subtitle {
  color: #666;
  margin: 0;
  font-size: 1.1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-outline {
  background: white;
  color: #007bff;
  border: 1px solid #007bff;
}

.btn-outline:hover {
  background: #007bff;
  color: white;
}

.btn-danger-outline {
  background: white;
  color: #dc3545;
  border: 1px solid #dc3545;
}

.btn-danger-outline:hover {
  background: #dc3545;
  color: white;
}

.btn-sm {
  padding: 8px 12px;
  font-size: 0.875rem;
}

.form-container {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section.full-width {
  grid-column: 1 / -1;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-weight: 600;
  color: #495057;
  font-size: 0.95rem;
}

.form-input,
.form-select,
.form-textarea {
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  background: white;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #007bff;
}

.form-input.error,
.form-select.error,
.form-textarea.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  font-weight: 500;
}

.photo-upload {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.photo-preview {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  text-align: center;
  color: #666;
}

.photo-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 8px;
}

.photo-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-input {
  display: none;
}

.skills-input {
  display: flex;
  gap: 12px;
}

.skills-input .form-input {
  flex: 1;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.skill-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.skill-remove {
  background: none;
  border: none;
  color: #1976d2;
  cursor: pointer;
  font-weight: bold;
  padding: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skill-remove:hover {
  background: #1976d2;
  color: white;
}

.file-upload {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.file-preview {
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.file-icon {
  font-size: 2rem;
}

.file-details {
  flex: 1;
}

.file-name {
  font-weight: 600;
  margin: 0 0 4px 0;
}

.file-size {
  color: #666;
  font-size: 0.875rem;
  margin: 0;
}

.file-remove {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-weight: bold;
}

.file-placeholder {
  color: #666;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .photo-upload {
    flex-direction: column;
    align-items: center;
  }
  
  .skills-input {
    flex-direction: column;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>

