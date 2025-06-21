<script setup>
import { ref, reactive } from 'vue'
import profielfoto from '/Images/profielfoto.jpg'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, doc, updateDoc } from 'firebase/firestore'
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { useRouter } from 'vue-router'

const router = useRouter()
const db = getFirestore()
const auth = getAuth()
const storage = getStorage()

const profiel = reactive({
  voornaam: '',
  achternaam: '',
  leeftijd: '',
  linkedin: '',
  domein: [],
  beschikbaarVanaf: '',
  opportuniteit: '',
  studiejaar: '',
  talenkennis: [],
  skills: [],
  intro: '',
  fotoUrl: '',
  cv: null, // Wordt een object { url, name, size }
})

const cvFile = ref(null)
const fotoFile = ref(null)
const fotoPreview = ref(null)
const uploadProgress = ref(0)
const isUploading = ref(false)
const error = ref('')
const toestemming = ref(false)

const possibleTalen = [
  'Nederlands', 'Engels', 'Frans', 'Duits', 'Spaans',
  'Chinees', 'Arabisch', 'Russisch', 'Italiaans', 'Portugees'
]

const possibleDomeinen = [
  'Software Development',
  'Web Development',
  'Mobile Development',
  'Cloud Computing',
  'DevOps',
  'Cybersecurity',
  'Data Science',
  'Artificial Intelligence',
  'Machine Learning',
  'Network Engineering',
  'System Administration',
  'Database Management',
  'UI/UX Design',
  'Business Intelligence',
  'IT Project Management',
  'Quality Assurance',
  'Embedded Systems',
  'IoT Development',
  'Blockchain Development',
  'Game Development'
]

const showCustomSkill = ref(false)
const customSkill = ref('')
const selectedSkill = ref('')
const skills = profiel.skills
function addSkill() { if (selectedSkill.value === 'custom') { showCustomSkill.value = true; } else if (selectedSkill.value && !skills.includes(selectedSkill.value)) { skills.push(selectedSkill.value); showCustomSkill.value = false; } }
function confirmCustomSkill() { const trimmed = customSkill.value.trim(); if (trimmed && !skills.includes(trimmed)) { skills.push(trimmed); } customSkill.value = ''; }
function removeSkill(index) { skills.splice(index, 1) }

const showCustomTaal = ref(false)
const customTaal = ref('')
const selectedTaal = ref('')
const talenkennis = profiel.talenkennis
function addTaal() { if (selectedTaal.value === 'custom') { showCustomTaal.value = true; } else if (selectedTaal.value && !talenkennis.includes(selectedTaal.value)) { talenkennis.push(selectedTaal.value); showCustomTaal.value = false; } }
function confirmCustomTaal() { const trimmed = customTaal.value.trim(); if (trimmed && !talenkennis.includes(trimmed)) { talenkennis.push(trimmed); } customTaal.value = ''; }
function removeTaal(index) { talenkennis.splice(index, 1) }

const showCustomDomein = ref(false)
const customDomein = ref('')
const selectedDomein = ref('')
const domein = profiel.domein
function addDomein() { if (selectedDomein.value === 'custom') { showCustomDomein.value = true; } else if (selectedDomein.value && !domein.includes(selectedDomein.value)) { domein.push(selectedDomein.value); showCustomDomein.value = false; } }
function confirmCustomDomein() { const trimmed = customDomein.value.trim(); if (trimmed && !domein.includes(trimmed)) { domein.push(trimmed); } customDomein.value = ''; }
function removeDomein(index) { domein.splice(index, 1) }

function handleFotoUpload(e) {
  const file = e.target.files?.[0]
  if (file && file.type.startsWith('image/')) {
    fotoFile.value = file
    fotoPreview.value = URL.createObjectURL(file)
  } else {
    fotoFile.value = null
    fotoPreview.value = null
  }
}

function handleCvUpload(e) {
  const file = e.target.files?.[0]
  if (file && file.type === 'application/pdf') {
    cvFile.value = file
  } else {
    alert('Upload alstublieft een PDF-bestand voor uw CV.')
    e.target.value = ''
    cvFile.value = null
  }
}

async function uploadFile(file, path) {
  return new Promise((resolve, reject) => {
    const fileRef = storageRef(storage, path);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        uploadProgress.value = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      },
      (error) => {
        console.error("Uploadfout:", error);
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}

async function bevestigGegevens() {
  const user = auth.currentUser
  if (!user) {
    error.value = 'Je moet ingelogd zijn om je profiel op te slaan.'
    return
  }
  if (!toestemming.value) {
    error.value = 'Je moet akkoord gaan met de voorwaarden.'
    return
  }

  isUploading.value = true
  error.value = ''
  
  try {
    const studentDocRef = doc(db, 'student', user.uid)
    const dataToSave = { ...profiel }

    if (fotoFile.value) {
      const fotoPath = `fotos/${user.uid}/${fotoFile.value.name}`;
      dataToSave.fotoUrl = await uploadFile(fotoFile.value, fotoPath);
    }

    if (cvFile.value) {
      const cvPath = `cvs/${user.uid}/${cvFile.value.name}`;
      const cvUrl = await uploadFile(cvFile.value, cvPath);
      dataToSave.cv = {
        url: cvUrl,
        name: cvFile.value.name,
        size: cvFile.value.size
      };
    } else {
        dataToSave.cv = null;
    }
    
    // Verwijder de file-objecten voor het opslaan in firestore
    delete dataToSave.fotoFile; 
    delete dataToSave.cvFile;

    await updateDoc(studentDocRef, dataToSave);

    alert('Profiel succesvol opgeslagen!')
    router.push('/dashboard')

  } catch (e) {
    console.error("Fout bij opslaan van profiel:", e)
    error.value = `Er is een fout opgetreden: ${e.message}`
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <div class="student-invoer">

    <div class="header-blok">
      <h2 class="titel">Student-profiel</h2>
      <p class="uitleg">
        Vul hieronder jouw persoonlijke gegevens in om je profiel aan te maken. Velden met een * zijn verplicht.
      </p>
    </div>

    <form class="formulier-grid" @submit.prevent="bevestigGegevens">

      <div class="form-column">
        <div class="form-group">
          <label for="voornaam">Voornaam *</label>
          <input id="voornaam" v-model="profiel.voornaam" type="text" placeholder="Voer je naam in..." required />
        </div>

        <div class="form-group">
          <label for="achternaam">Achternaam *</label>
          <input id="achternaam" v-model="profiel.achternaam" type="text" placeholder="Voer je achternaam in..." required />
        </div>

        <div class="form-group">
          <label for="leeftijd">Leeftijd *</label>
          <input id="leeftijd" v-model="profiel.leeftijd" type="number" placeholder="Voer je leeftijd in..." required />
        </div>

        <div class="form-group">
          <label>Domein *</label>
          <select class="skills-dropdown" v-model="selectedDomein" @change="addDomein" required>
            <option disabled value="">Selecteer je domein</option>
            <option v-for="d in possibleDomeinen" :key="d" :value="d">{{ d }}</option>
            <option value="custom">Andere domein...</option>
          </select>
          <div v-if="selectedDomein === 'custom'" class="custom-skill-input">
            <input type="text" v-model="customDomein" placeholder="Typ je eigen domein..." />
            <button type="button" @click="confirmCustomDomein">Toevoegen</button>
          </div>
          <div class="skill-chips">
            <span v-for="(d, index) in domein" :key="index" class="chip">
              {{ d }}
              <button @click="removeDomein(index)">&times;</button>
            </span>
          </div>
        </div>

        <div class="form-group">
          <label for="studiejaar">Studiejaar *</label>
          <select id="studiejaar" v-model="profiel.studiejaar" required>
            <option disabled value="">Kies je studiejaar</option>
            <option>1e jaar</option>
            <option>2e jaar</option>
            <option>3e jaar</option>
            <option>Afgestudeerd</option>
          </select>
        </div>

        <div class="form-group">
          <label>Talenkennis *</label>
          <select class="skills-dropdown" v-model="selectedTaal" @change="addTaal" required>
            <option disabled value="">Maak een keuze</option>
            <option v-for="taal in possibleTalen" :key="taal" :value="taal">{{ taal }}</option>
            <option value="custom">Andere taal...</option>
          </select>
          <div v-if="selectedTaal === 'custom'" class="custom-skill-input">
            <input type="text" v-model="customTaal" placeholder="Typ je eigen taal..." />
            <button type="button" @click="confirmCustomTaal">Toevoegen</button>
          </div>
          <div class="skill-chips">
            <span v-for="(taal, index) in talenkennis" :key="index" class="chip">
              {{ taal }}
              <button @click="removeTaal(index)">&times;</button>
            </span>
          </div>
        </div>

        <div class="form-group">
          <label for="linkedin">LinkedIn</label>
          <input id="linkedin" v-model="profiel.linkedin" type="url" placeholder="https://linkedin.com/in/jouwnaam" />
        </div>

        <div class="form-group form-group-full">
          <label for="cv">Upload je CV (PDF) *</label>
          <input id="cv" type="file" @change="handleCvUpload" accept=".pdf" required />
          <div v-if="cvFile" class="file-info">
            Geselecteerd bestand: {{ cvFile.name }} ({{ (cvFile.size / 1024).toFixed(2) }} KB)
          </div>
        </div>
      </div>

      <div class="form-column">
        <div class="form-group center-preview">
          <div class="foto-preview-wrapper">
            <img
              v-if="fotoPreview"
              :src="fotoPreview"
              class="foto-preview"
              alt="Profielfoto"
            />
            <img
              v-else
              :src="profielfoto"
              class="foto-preview"
              alt="Standaard profielfoto"
            />
          </div>
          <label for="foto-upload" class="foto-upload-button">Upload foto *</label>
          <input 
            id="foto-upload" 
            name="foto-upload"
            type="file" 
            accept="image/*" 
            @change="handleFotoUpload" 
            hidden
          />
          <p><strong>{{ profiel.voornaam || 'Voornaam' }} {{ profiel.achternaam || 'Achternaam' }}</strong></p>
        </div>

        <div class="form-group">
          <label for="beschikbaarVanaf">Beschikbaar vanaf *</label>
          <input id="beschikbaarVanaf" v-model="profiel.beschikbaarVanaf" type="date" required />
        </div>

        <div class="form-group">
          <label for="opportuniteit">Opportuniteit *</label>
          <select id="opportuniteit" v-model="profiel.opportuniteit" required>
            <option disabled value="">Kies een opportuniteit</option>
            <option>Stage</option>
            <option>Student Job</option>
            <option>Fulltime job</option>
          </select>
        </div>

        <div class="form-group">
          <label for="introductie">Stel jezelf kort voor *</label>
          <textarea
            id="introductie"
            v-model="profiel.intro"
            placeholder="Vertel in enkele zinnen wie je bent, je interesses en je ambities..."
            rows="5"
            required
          />
        </div>

        <div class="form-group">
          <label>Vaardigheden *</label>
          <select class="skills-dropdown" v-model="selectedSkill" @change="addSkill" required>
            <option disabled value="">Maak een keuze</option>
            <option>Teamwork</option>
            <option>Leiderschap</option>
            <option>Python</option>
            <option>Machine Learning</option>
            <option>Projectmanagement</option>
            <option>Cloud</option>
            <option value="custom">Andere...</option>
          </select>
          <div v-if="selectedSkill === 'custom'" class="custom-skill-input">
            <input type="text" v-model="customSkill" placeholder="Typ je eigen skill..." />
            <button type="button" @click="confirmCustomSkill">Toevoegen</button>
          </div>
          <div class="skill-chips">
            <span v-for="(skill, index) in skills" :key="index" class="chip">
              {{ skill }}
              <button @click="removeSkill(index)">&times;</button>
            </span>
          </div>
        </div>

        <div class="form-group-full">
          <input type="checkbox" id="toestemming" v-model="toestemming" required>
          <label for="toestemming">Ik geef toestemming...</label>
        </div>

        <div v-if="isUploading" class="form-group-full">
          <label>Uploaden...</label>
          <progress :value="uploadProgress" max="100"></progress>
          <span>{{ Math.round(uploadProgress) }}%</span>
        </div>
        <div v-if="error" class="error-box">
          {{ error }}
        </div>

        <div class="submit-section">
          <button class="submit-knop" type="submit" :disabled="isUploading">
            {{ isUploading ? 'Bezig met opslaan...' : 'Profiel Opslaan' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>

  .student-invoer {
    padding: 2rem 2rem 4rem;
    max-width: 1000px;
    margin: 0 auto;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: #f5f5f7;
    color: #1d1d1f;
    line-height: 1.6;
    font-size: 16px;
  }
  
  .header-blok {
    background: linear-gradient(135deg, #fff7f7, #fff);
    padding: 3rem 2rem 2rem;
    text-align: center;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    margin-bottom: 2rem;
  }
  
  .header-blok .titel {
    font-size: 2.6rem;
    font-weight: 700;
    color: #b80000;
    margin-bottom: 1rem;
    letter-spacing: -0.5px;
  }
  
  .header-blok .uitleg {
    font-size: 1.1rem;
    color: #555;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
  
  form.formulier-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    background: white;
    border-radius: 24px;
    padding: 2.5rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  }
  
  .form-column {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
  }
  
  label {
    font-weight: 600;
    margin-bottom: 0.4rem;
    color: #1d1d1f;
  }
  
  input[type='text'],
  input[type='number'],
  input[type='url'],
  input[type='date'],
  select,
  textarea {
    font-size: 1rem;
    padding: 0.75rem 1rem;
    border: 1px solid #ced4da;
    border-radius: 12px;
    background-color: #fff;
    transition: border-color 0.2s;
    font-family: inherit;
  }
  
  input:focus,
  select:focus,
  textarea:focus {
    outline: none;
    border-color: #b80000;
    box-shadow: 0 0 0 2px rgba(184, 0, 0, 0.2);
  }
  
  textarea {
    resize: vertical;
    min-height: 100px;
    max-height: 180px;
    line-height: 1.4;
  }
  
  .checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-weight: 500;
    color: #1c1d1f;
  }
  
  .inline-text {
    margin-left: 0.5rem;
    padding: 0.4rem 0.6rem;
    border-radius: 8px;
    border: 1px solid #ccc;
    width: 120px;
  }
  
  .foto-preview-wrapper {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    margin: 0 auto 1rem;
    border: 4px solid #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .foto-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
  
  .foto-upload-button {
    background-color: #b80000;
    color: white;
    padding: 0.6rem 1.4rem;
    border: none;
    border-radius: 24px;
    font-weight: 600;
    cursor: pointer;
    display: block;
    margin: 0.5rem auto 1rem;
    transition: background-color 0.2s;
  }
  
  .foto-upload-button:hover {
    background-color: #990000;
  }
  
  .skill-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .chip {
    background-color: #fdeaea;
    color: #b80000;
    padding: 0.35rem 0.9rem;
    border-radius: 20px;
    font-weight: 500;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .chip button {
    background: none;
    border: none;
    color: #b80000;
    font-size: 1rem;
    cursor: pointer;
    font-weight: 700;
  }
  
  .skills-dropdown {
    width: 100%;
    margin-top: 0.3rem;
  }
  
  .custom-skill-input {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .custom-skill-input input {
    flex: 1;
  }
  
  .custom-skill-input button {
    background-color: #b80000;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }
  
  .toestemming-richting {
    display: flex;
    align-items: flex-start;
    gap: 0.8rem;
    font-size: 0.95rem;
    margin-top: 1.5rem;
    color: #1d1d1f;
    line-height: 1.4;
  }
  
  .toestemming-richting input[type="checkbox"] {
    margin-top: 0.2rem;
    transform: scale(1.3);
    cursor: pointer;
    accent-color: #b80000;
  }
  
  
  .submit-section {
    margin-top: 1.5rem;
  }
  
  .submit-knop {
    width: 100%;
    padding: 1rem;
    background-color: #b80000;
    color: white;
    font-weight: 600;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .submit-knop:hover {
    background-color: #990000;
  }
  
  .footer {
    text-align: center;
    font-size: 0.9rem;
    color: #6c757d;
    padding: 2rem 1rem 1rem;
    margin-top: 3rem;
  }
  
  @media (max-width: 900px) {
    form.formulier-grid {
      grid-template-columns: 1fr;
    }
    .header-blok .titel {
      font-size: 2rem;
    }
  }

  .file-info {
    font-size: 0.9rem;
    margin-top: 0.5rem;
    color: #555;
  }
  .error-box {
    color: red;
  }
</style> 

