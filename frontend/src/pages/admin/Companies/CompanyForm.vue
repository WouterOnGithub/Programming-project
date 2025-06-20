<template>
  <div class="company-form">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">{{ isEdit ? 'Bedrijf Bewerken' : 'Nieuw Bedrijf' }}</h1>
        <p class="page-subtitle">{{ isEdit ? 'Wijzig de bedrijfsgegevens' : 'Voeg een nieuw bedrijf toe aan het systeem' }}</p>
      </div>
      <div class="header-actions">
        <router-link to="/admin/companies" class="btn btn-secondary">
          <span class="btn-icon">←</span>
          Terug naar lijst
        </router-link>
      </div>
    </div>

    <!-- Form -->
    <form @submit.prevent="submitForm" class="form-container">
      <div class="form-grid">
        <!-- Logo Upload Section -->
        <div class="form-section full-width">
          <h3 class="section-title">Bedrijfslogo</h3>
          <div class="photo-upload">
            <div class="photo-preview">
              <img v-if="form.fotoPreview" :src="form.fotoPreview" alt="Bedrijfslogo">
              <div v-else class="photo-placeholder">
                <span class="photo-icon">🏢</span>
                <p>Geen logo geüpload</p>
              </div>
            </div>
            <div class="photo-controls">
              <input 
                type="file" 
                ref="logoInput" 
                @change="handleLogoUpload" 
                accept="image/*"
                class="file-input"
                id="logo-upload"
              >
              <label for="logo-upload" class="btn btn-outline">
                <span class="btn-icon">📁</span>
                Upload logo
              </label>
              <button 
                v-if="form.fotoPreview" 
                type="button" 
                @click="removeLogo" 
                class="btn btn-danger-outline"
              >
                <span class="btn-icon">🗑️</span>
                Verwijder logo
              </button>
            </div>
          </div>
        </div>

        <!-- Company Information -->
        <div class="form-section">
          <h3 class="section-title">Bedrijfsinformatie</h3>
          
          <div class="form-group">
            <label for="bedrijfsnaam" class="form-label">Bedrijfsnaam *</label>
            <input 
              type="text" 
              id="bedrijfsnaam"
              v-model="form.bedrijfsnaam" 
              class="form-input"
              :class="{ 'error': errors.bedrijfsnaam }"
              placeholder="Voer bedrijfsnaam in"
            >
            <span v-if="errors.bedrijfsnaam" class="error-message">{{ errors.bedrijfsnaam }}</span>
          </div>

          <div class="form-group">
            <label for="gesitueerdIn" class="form-label">Gesitueerd in *</label>
            <input 
              type="text" 
              id="gesitueerdIn"
              v-model="form.gesitueerdIn" 
              class="form-input"
              :class="{ 'error': errors.gesitueerdIn }"
              placeholder="Bijv. Amsterdam, Nederland"
            >
            <span v-if="errors.gesitueerdIn" class="error-message">{{ errors.gesitueerdIn }}</span>
          </div>

          <div class="form-group">
            <label for="linkedin" class="form-label">LinkedIn URL</label>
            <input 
              type="url" 
              id="linkedin"
              v-model="form.linkedin" 
              class="form-input"
              :class="{ 'error': errors.linkedin }"
              placeholder="https://linkedin.com/company/bedrijfsnaam"
            >
            <span v-if="errors.linkedin" class="error-message">{{ errors.linkedin }}</span>
          </div>

          <div class="form-group">
            <label for="starttijd" class="form-label">Starttijd</label>
            <input
              type="time"
              id="starttijd"
              v-model="form.starttijd"
              class="form-input"
            >
          </div>
          <div class="form-group">
            <label for="eindtijd" class="form-label">Eindtijd</label>
            <input
              type="time"
              id="eindtijd"
              v-model="form.eindtijd"
              class="form-input"
            >
          </div>
        </div>

        <!-- What they're looking for -->
        <div class="form-section">
          <h3 class="section-title">Vacature Informatie</h3>
          
          <div class="form-group">
            <label class="form-label">Op zoek naar *</label>
            <div class="checkbox-group">
              <label class="checkbox-item" v-for="opt in opZoekNaarOpties" :key="opt">
                <input type="checkbox" :value="opt" v-model="form.opZoekNaar">
                <span class="checkbox-label">{{ opt }}</span>
              </label>
            </div>
            <div v-if="form.opZoekNaar.includes('Anders')" class="custom-skill-input" style="margin-top: 0.5rem;">
              <input type="text" v-model="customOpZoekNaar" placeholder="Typ je eigen profiel..." class="form-input" style="max-width: 300px; display: inline-block;" />
              <button type="button" class="btn btn-primary btn-sm" @click="addCustomOpZoekNaar" style="margin-left: 0.5rem;">Toevoegen</button>
            </div>
          </div>

          <div class="form-group">
            <label for="jobTypes" class="form-label">Type posities</label>
            <div class="checkbox-group">
              <label class="checkbox-item">
                <input type="checkbox" v-model="form.jobTypes" value="Stage">
                <span class="checkbox-label">Stage</span>
              </label>
              <label class="checkbox-item">
                <input type="checkbox" v-model="form.jobTypes" value="Studentenjob">
                <span class="checkbox-label">Studentenjob</span>
              </label>
              <label class="checkbox-item">
                <input type="checkbox" v-model="form.jobTypes" value="Voltijdse job">
                <span class="checkbox-label">Voltijdse job</span>
              </label>
              <label class="checkbox-item">
                <input type="checkbox" v-model="form.jobTypes" value="Parttime">
                <span class="checkbox-label">Parttime</span>
              </label>
            </div>
          </div>
        </div>

        <!-- About Us -->
        <div class="form-section full-width">
          <h3 class="section-title">Over het bedrijf</h3>
          
          <div class="form-group">
            <label for="aboutUs" class="form-label">About us *</label>
            <textarea 
              id="aboutUs"
              v-model="form.aboutUs" 
              class="form-textarea"
              :class="{ 'error': errors.aboutUs }"
              placeholder="Vertel over jullie bedrijf, missie, visie, cultuur en wat jullie uniek maakt..."
              rows="6"
            ></textarea>
            <span v-if="errors.aboutUs" class="error-message">{{ errors.aboutUs }}</span>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="form-section">
          <h3 class="section-title">Contactinformatie</h3>
          
          <div class="form-group">
            <label for="contactEmail" class="form-label">Contact e-mail</label>
            <input 
              type="email" 
              id="contactEmail"
              v-model="form.contactEmail" 
              class="form-input"
              :class="{ 'error': errors.contactEmail }"
              placeholder="contact@bedrijf.nl"
            >
            <span v-if="errors.contactEmail" class="error-message">{{ errors.contactEmail }}</span>
          </div>

          <div class="form-group">
            <label for="website" class="form-label">Website</label>
            <input 
              type="url" 
              id="website"
              v-model="form.website" 
              class="form-input"
              :class="{ 'error': errors.website }"
              placeholder="https://www.bedrijf.nl"
            >
            <span v-if="errors.website" class="error-message">{{ errors.website }}</span>
          </div>

          <div class="form-group">
            <label for="phoneNumber" class="form-label">Telefoonnummer</label>
            <input 
              type="tel" 
              id="phoneNumber"
              v-model="form.phoneNumber" 
              class="form-input"
              :class="{ 'error': errors.phoneNumber }"
              placeholder="+31 20 123 4567"
            >
            <span v-if="errors.phoneNumber" class="error-message">{{ errors.phoneNumber }}</span>
          </div>
        </div>

        <!-- Company Details -->
        <div class="form-section">
          <h3 class="section-title">Bedrijfsdetails</h3>
          
          <div class="form-group">
            <label for="industry" class="form-label">Branche</label>
            <select 
              id="industry"
              v-model="form.industry" 
              class="form-select"
            >
              <option value="">Selecteer branche</option>
              <option value="IT & Software">IT & Software</option>
              <option value="Marketing & Communicatie">Marketing & Communicatie</option>
              <option value="Finance & Banking">Finance & Banking</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Retail">Retail</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Consulting">Consulting</option>
              <option value="Media & Entertainment">Media & Entertainment</option>
              <option value="Non-profit">Non-profit</option>
              <option value="Overig">Overig</option>
            </select>
          </div>

          <div class="form-group">
            <label for="companySize" class="form-label">Bedrijfsgrootte</label>
            <select 
              id="companySize"
              v-model="form.companySize" 
              class="form-select"
            >
              <option value="">Selecteer grootte</option>
              <option value="1-10">1-10 medewerkers</option>
              <option value="11-50">11-50 medewerkers</option>
              <option value="51-200">51-200 medewerkers</option>
              <option value="201-500">201-500 medewerkers</option>
              <option value="501-1000">501-1000 medewerkers</option>
              <option value="1000+">1000+ medewerkers</option>
            </select>
          </div>

          <div class="form-group">
            <label for="foundedYear" class="form-label">Opgericht in</label>
            <input 
              type="number" 
              id="foundedYear"
              v-model="form.foundedYear" 
              class="form-input"
              placeholder="2020"
              min="1800"
              :max="new Date().getFullYear()"
            >
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <router-link to="/admin/companies" class="btn btn-secondary">
          Annuleren
        </router-link>
        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="btn-icon">⏳</span>
          <span v-else class="btn-icon">💾</span>
          {{ isSubmitting ? 'Opslaan...' : (isEdit ? 'Wijzigingen Opslaan' : 'Bedrijf Aanmaken') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from '../../../firebase/config'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

export default {
  name: 'CompanyForm',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const isEdit = ref(!!route.params.id)
    const logoInput = ref(null)
    const skillInput = ref('')
    const loading = ref(false)
    const errors = ref({})
    const customOpZoekNaar = ref('')

    const form = ref({
        bedrijfsnaam: '',
        gesitueerdIn: '',
        linkedin: '',
        opZoekNaar: [],
        jobTypes: [],
        requiredSkills: [],
        aboutUs: '',
        contactEmail: '',
        website: '',
        phoneNumber: '',
        industry: '',
      size: '',
      foto: '',
      fotoPreview: '',
      starttijd: '',
      eindtijd: ''
    })

    const opZoekNaarOpties = [
      'IT-studenten',
      'Marketing profielen',
      'Boekhouders',
      'Stagiairs',
      'Vrijwilligers',
      'Anders'
    ]

    const validateForm = () => {
      errors.value = {}
      // Geen enkel veld is verplicht, alleen e-mail validatie als er iets is ingevuld
      if (form.value.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.contactEmail)) {
        errors.value.contactEmail = 'Ongeldig e-mailadres'
        return false
      }
      return true
    }

    const handleLogoUpload = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      // Preview
      form.value.fotoPreview = URL.createObjectURL(file)

      // Upload to Firebase Storage
      try {
        const storage = getStorage()
        const logoRef = storageRef(storage, `company-logos/${Date.now()}-${file.name}`)
        const snapshot = await uploadBytes(logoRef, file)
        form.value.foto = await getDownloadURL(snapshot.ref)
      } catch (error) {
        console.error('Error uploading logo:', error)
        errors.value.logo = 'Fout bij uploaden logo'
      }
    }

    const removeLogo = () => {
      form.value.foto = ''
      form.value.fotoPreview = ''
      if (logoInput.value) {
        logoInput.value.value = ''
      }
    }

    const addSkill = () => {
      const skill = skillInput.value.trim()
      if (skill && !form.value.requiredSkills.includes(skill)) {
        form.value.requiredSkills.push(skill)
      }
      skillInput.value = ''
    }

    const removeSkill = (index) => {
      form.value.requiredSkills.splice(index, 1)
    }

    const loadCompany = async () => {
      if (!isEdit.value) return

      try {
        const docRef = doc(db, 'bedrijf', route.params.id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          form.value = {
            ...data,
            fotoPreview: data.foto || ''
          }
          form.value.opZoekNaar = Array.isArray(form.value.opZoekNaar)
            ? form.value.opZoekNaar
            : form.value.opZoekNaar
              ? [form.value.opZoekNaar]
              : [];
          form.value.jobTypes = Array.isArray(form.value.jobTypes)
            ? form.value.jobTypes
            : form.value.jobTypes
              ? [form.value.jobTypes]
              : [];
        } else {
          router.push('/admin/companies')
        }
      } catch (error) {
        console.error('Error loading company:', error)
        router.push('/admin/companies')
      }
    }

    const submitForm = async () => {
      if (!validateForm()) return

      loading.value = true
      try {
        let companyData = {
          ...form.value,
          updatedAt: new Date().toISOString()
        }

        // Reset status als geweigerd
        if (isEdit.value && form.value.verificatieStatus === 'geweigerd') {
          companyData.verificatieStatus = 'wachtend op verificatie'
          companyData.verificatieDatum = ''
          companyData.afwijzingsreden = ''
        }

        if (isEdit.value) {
          await updateDoc(doc(db, 'bedrijf', route.params.id), companyData)
        } else {
          companyData.createdAt = new Date().toISOString()
          const newDocRef = doc(collection(db, 'bedrijf'))
          await setDoc(newDocRef, companyData)
        }

        router.push('/admin/companies')
      } catch (error) {
        console.error('Error saving company:', error)
        errors.value.submit = 'Fout bij opslaan bedrijf'
      } finally {
        loading.value = false
      }
    }

    function addCustomOpZoekNaar() {
      const trimmed = customOpZoekNaar.value.trim()
      if (trimmed && !opZoekNaarOpties.includes(trimmed) && !form.value.opZoekNaar.includes(trimmed)) {
        opZoekNaarOpties.push(trimmed)
        form.value.opZoekNaar.push(trimmed)
      }
      customOpZoekNaar.value = ''
    }

    onMounted(loadCompany)

    return {
      isEdit,
      form,
      errors,
      loading,
      logoInput,
      skillInput,
      handleLogoUpload,
      removeLogo,
      addSkill,
      removeSkill,
      submitForm,
      opZoekNaarOpties,
      customOpZoekNaar,
      addCustomOpZoekNaar
    }
  }
}
</script>

<style scoped>
/* Hergebruik dezelfde styling als StudentForm.vue */
.company-form {
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

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #007bff;
}

.checkbox-label {
  font-weight: 500;
  color: #495057;
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
  
  .photo-upload {
    flex-direction: column;
    align-items: center;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>

