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
              <label for="voornaam" class="form-label">Voornaam *</label>
              <input type="text" id="voornaam" v-model="form.voornaam" class="form-input" :class="{ 'error': errors.voornaam }" placeholder="Voer voornaam in" required>
              <span v-if="errors.voornaam" class="error-message">{{ errors.voornaam }}</span>
            </div>
            <div class="form-group">
              <label for="achternaam" class="form-label">Achternaam *</label>
              <input type="text" id="achternaam" v-model="form.achternaam" class="form-input" :class="{ 'error': errors.achternaam }" placeholder="Voer achternaam in" required>
              <span v-if="errors.achternaam" class="error-message">{{ errors.achternaam }}</span>
            </div>
          </div>
          <div class="form-group">
            <label for="email" class="form-label">E-mailadres *</label>
            <input type="email" id="email" v-model="form.email" class="form-input" :class="{ 'error': errors.email }" placeholder="Voer e-mailadres in" required>
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>
          <div class="form-group">
            <label for="leeftijd" class="form-label">Leeftijd *</label>
            <input type="number" id="leeftijd" v-model="form.leeftijd" class="form-input" :class="{ 'error': errors.leeftijd }" placeholder="Voer leeftijd in" min="16" max="100" required>
            <span v-if="errors.leeftijd" class="error-message">{{ errors.leeftijd }}</span>
          </div>
        </div>
 
        <!-- Study Information -->
        <div class="form-section">
          <h3 class="section-title">Studie Informatie</h3>
          <div class="form-group">
            <label for="studiejaar" class="form-label">Studiejaar *</label>
            <select id="studiejaar" v-model="form.studiejaar" class="form-select" :class="{ 'error': errors.studiejaar }" required>
              <option value="">Selecteer studiejaar</option>
              <option value="1e jaar">1e jaar</option>
              <option value="2e jaar">2e jaar</option>
              <option value="3e jaar">3e jaar</option>
              <option value="Afgestudeerd">Afgestudeerd</option>
            </select>
            <span v-if="errors.studiejaar" class="error-message">{{ errors.studiejaar }}</span>
          </div>
          <div class="form-group">
            <label for="domein" class="form-label">Domein *</label>
            <div class="chips-input">
              <input type="text" id="domein" v-model="domeinInput" class="form-input" placeholder="Voeg domein toe en druk op Enter" @keydown.enter.prevent="addDomein">
              <button type="button" @click="addDomein" class="btn btn-outline btn-sm">Toevoegen</button>
            </div>
            <div class="chips-list">
              <span v-for="(d, idx) in form.domein" :key="idx" class="chip">{{ d }} <button type="button" @click="removeDomein(idx)">&times;</button></span>
            </div>
            <span v-if="errors.domein" class="error-message">{{ errors.domein }}</span>
          </div>
        </div>
 
        <!-- Skills and Languages -->
        <div class="form-section">
          <h3 class="section-title">Vaardigheden & Talen</h3>
          <div class="form-group">
            <label for="skills" class="form-label">Vaardigheden *</label>
            <div class="chips-input">
              <input type="text" v-model="skillInput" @keydown.enter.prevent="addSkill" class="form-input" placeholder="Voeg skill toe en druk op Enter">
              <button type="button" @click="addSkill" class="btn btn-outline btn-sm">Toevoegen</button>
            </div>
            <div class="chips-list">
              <span v-for="(skill, idx) in form.skills" :key="idx" class="chip">{{ skill }} <button type="button" @click="removeSkill(idx)">&times;</button></span>
            </div>
            <span v-if="errors.skills" class="error-message">{{ errors.skills }}</span>
          </div>
          <div class="form-group">
            <label for="talenkennis" class="form-label">Talenkennis *</label>
            <div class="chips-input">
              <input type="text" v-model="taalInput" @keydown.enter.prevent="addTaal" class="form-input" placeholder="Voeg taal toe en druk op Enter">
              <button type="button" @click="addTaal" class="btn btn-outline btn-sm">Toevoegen</button>
            </div>
            <div class="chips-list">
              <span v-for="(taal, idx) in form.talenkennis" :key="idx" class="chip">{{ taal }} <button type="button" @click="removeTaal(idx)">&times;</button></span>
            </div>
            <span v-if="errors.talenkennis" class="error-message">{{ errors.talenkennis }}</span>
          </div>
        </div>
 
        <!-- Professional Information -->
        <div class="form-section">
          <h3 class="section-title">Professionele Informatie</h3>
          <div class="form-group">
            <label for="linkedin" class="form-label">LinkedIn URL</label>
            <input type="url" id="linkedin" v-model="form.linkedin" class="form-input" :class="{ 'error': errors.linkedin }" placeholder="https://linkedin.com/in/jouwprofiel">
            <span v-if="errors.linkedin" class="error-message">{{ errors.linkedin }}</span>
          </div>
          <div class="form-group">
            <label for="opportuniteit" class="form-label">Gezochte Opportuniteit *</label>
            <select id="opportuniteit" v-model="form.opportuniteit" class="form-select" :class="{ 'error': errors.opportuniteit }" required>
              <option value="">Kies een type</option>
              <option value="Stage">Stage</option>
              <option value="Studentenjob">Studentenjob</option>
              <option value="Voltijdse job">Voltijdse job</option>
            </select>
            <span v-if="errors.opportuniteit" class="error-message">{{ errors.opportuniteit }}</span>
          </div>
          <div class="form-group">
            <label for="beschikbaarVanaf" class="form-label">Beschikbaar vanaf *</label>
            <input type="date" id="beschikbaarVanaf" v-model="form.beschikbaarVanaf" class="form-input" :class="{ 'error': errors.beschikbaarVanaf }" required>
            <span v-if="errors.beschikbaarVanaf" class="error-message">{{ errors.beschikbaarVanaf }}</span>
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
            <label for="intro" class="form-label">Stel je kort voor *</label>
            <textarea id="intro" v-model="form.intro" class="form-textarea" :class="{ 'error': errors.intro }" placeholder="Vertel kort over jezelf, je ambities en wat je zoekt..." rows="4" required></textarea>
            <span v-if="errors.intro" class="error-message">{{ errors.intro }}</span>
          </div>
        </div>
        <!-- Toestemming -->
        <div class="form-section">
          <div class="form-group">
            <input type="checkbox" id="toestemming" v-model="form.toestemming" required>
            <label for="toestemming">Ik geef toestemming voor het verwerken van mijn gegevens *</label>
            <span v-if="errors.toestemming" class="error-message">{{ errors.toestemming }}</span>
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
      domeinInput: '',
      taalInput: '',
      form: {
        voornaam: '',
        achternaam: '',
        email: '',
        leeftijd: '',
        studiejaar: '',
        domein: [],
        skills: [],
        talenkennis: [],
        linkedin: '',
        opportuniteit: '',
        beschikbaarVanaf: '',
        intro: '',
        toestemming: false
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
      try {
        const docSnap = await getDoc(doc(db, 'student', this.id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          Object.assign(this.form, data);
          if (!this.form.opportunityType && data.opportunity) {
            this.form.opportunityType = data.opportunity;
          }
        } else {
          alert('Student niet gevonden!');
          this.$router.push('/admin/students');
        }
      } catch (error) {
        alert('Fout bij het ophalen van student: ' + error.message);
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
      const val = this.skillInput.trim();
      if (val && !this.form.skills.includes(val)) {
        this.form.skills.push(val);
      }
      this.skillInput = '';
    },
   
    removeSkill(idx) {
      this.form.skills.splice(idx, 1);
    },
   
    addDomein() {
      const val = this.domeinInput.trim();
      if (val && !this.form.domein.includes(val)) {
        this.form.domein.push(val);
      }
      this.domeinInput = '';
    },
   
    removeDomein(idx) {
      this.form.domein.splice(idx, 1);
    },
   
    addTaal() {
      const val = this.taalInput.trim();
      if (val && !this.form.talenkennis.includes(val)) {
        this.form.talenkennis.push(val);
      }
      this.taalInput = '';
    },
   
    removeTaal(idx) {
      this.form.talenkennis.splice(idx, 1);
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
      if (!this.form.voornaam.trim()) {
        this.errors.voornaam = 'Voornaam is verplicht';
      }
      if (!this.form.achternaam.trim()) {
        this.errors.achternaam = 'Achternaam is verplicht';
      }
      if (!this.form.email.trim()) {
        this.errors.email = 'E-mailadres is verplicht';
      }
      if (!this.form.leeftijd || this.form.leeftijd < 16 || this.form.leeftijd > 100) {
        this.errors.leeftijd = 'Voer een geldige leeftijd in (16-100)';
      }
      if (!this.form.studiejaar) {
        this.errors.studiejaar = 'Studiejaar is verplicht';
      }
      if (!this.form.domein.length) {
        this.errors.domein = 'Voeg minimaal één domein toe';
      }
      if (!this.form.skills.length) {
        this.errors.skills = 'Voeg minimaal één vaardigheid toe';
      }
      if (!this.form.talenkennis.length) {
        this.errors.talenkennis = 'Voeg minimaal één taal toe';
      }
      if (!this.form.opportuniteit) {
        this.errors.opportuniteit = 'Gezochte opportuniteit is verplicht';
      }
      if (!this.form.beschikbaarVanaf) {
        this.errors.beschikbaarVanaf = 'Beschikbaarheidsdatum is verplicht';
      }
      if (!this.form.intro.trim()) {
        this.errors.intro = 'Introductie is verplicht';
      }
      if (!this.form.toestemming) {
        this.errors.toestemming = 'Toestemming is verplicht';
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
 
        // Add email to the student data object
        if (this.form.email) {
          studentData.email = this.form.email;
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
 