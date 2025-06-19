<script setup>
import { ref } from 'vue'
import profielfoto from '/Images/profielfoto.jpg'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, addDoc } from 'firebase/firestore'
import { useRouter } from 'vue-router'

const voornaam = ref('')
const achternaam = ref('')
const leeftijd = ref('')
const linkedin = ref('')
const domein = ref([])
const beschikbaarVanaf = ref('')
const opportuniteit = ref('')
const studiejaar = ref('')
const talenkennis = ref([])
const toestemming = ref(false)
const cv = ref(null)
const intro = ref('')
const andereTaal = ref('')

const skills = ref([])
const showCustomSkill = ref(false)
const customSkill = ref('')

const showCustomTaal = ref(false)
const customTaal = ref('')

const showCustomDomein = ref(false)
const customDomein = ref('')

const selectedDomein = ref('')
const selectedTaal = ref('')
const selectedSkill = ref('')

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

const db = getFirestore()
const auth = getAuth()
const router = useRouter()

function addSkill() {
  if (selectedSkill.value === 'custom') {
    showCustomSkill.value = true;
  } else if (
    selectedSkill.value &&
    !skills.value.includes(selectedSkill.value)
  ) {
    skills.value.push(selectedSkill.value);
    showCustomSkill.value = false;
  }
  // selectedSkill.value = '';
}

function confirmCustomSkill() {
  const trimmed = customSkill.value.trim();
  if (trimmed && !skills.value.includes(trimmed)) {
    skills.value.push(trimmed);
  }
  customSkill.value = '';
  // showCustomSkill blijft true zolang selectedSkill 'custom' is
}

function removeSkill(index) {
  skills.value.splice(index, 1)
}

function addTaal() {
  if (selectedTaal.value === 'custom') {
    showCustomTaal.value = true;
  } else if (
    selectedTaal.value &&
    !talenkennis.value.includes(selectedTaal.value)
  ) {
    talenkennis.value.push(selectedTaal.value);
    showCustomTaal.value = false;
  }
  // selectedTaal.value = '';
}

function confirmCustomTaal() {
  const trimmed = customTaal.value.trim();
  if (trimmed && !talenkennis.value.includes(trimmed)) {
    talenkennis.value.push(trimmed);
  }
  customTaal.value = '';
  // showCustomTaal blijft true zolang selectedTaal 'custom' is
}

function removeTaal(index) {
  talenkennis.value.splice(index, 1)
}

function addDomein() {
  if (selectedDomein.value === 'custom') {
    showCustomDomein.value = true;
  } else if (
    selectedDomein.value &&
    !domein.value.includes(selectedDomein.value)
  ) {
    domein.value.push(selectedDomein.value);
    showCustomDomein.value = false;
  }
  // selectedDomein.value = '';
}

function confirmCustomDomein() {
  const trimmed = customDomein.value.trim();
  if (trimmed && !domein.value.includes(trimmed)) {
    domein.value.push(trimmed);
  }
  customDomein.value = '';
  // showCustomDomein blijft true zolang selectedDomein 'custom' is
}

function removeDomein(index) {
  domein.value.splice(index, 1)
}

const foto = ref(null)
const fotoPreview = ref(null)

function handleFotoUpload(e) {
  const file = e.target.files?.[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Bestand is te groot. Maximum grootte is 5MB.')
      e.target.value = '' // Reset input
      return
    }
    
    if (!file.type.startsWith('image/')) {
      alert('Alleen afbeeldingsbestanden zijn toegestaan.')
      e.target.value = '' // Reset input
      return
    }

    foto.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      fotoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

function handleCvUpload(e) {
  const file = e.target.files?.[0] || null;
  cv.value = file;
}

async function bevestigGegevens() {
  const user = auth.currentUser
  if (!user) {
    alert('Je moet ingelogd zijn om je profiel op te slaan.')
    return
  }
  // (Optioneel) upload foto/cv naar storage en haal url op, hier dummy-url
  let fotoUrl = ''
  if (foto.value) {
    // upload naar storage en haal url op
    fotoUrl = 'dummy-foto-url' // TODO: upload implementeren
  }
  let cvUrl = ''
  if (cv.value) {
    // upload naar storage en haal url op
    cvUrl = 'dummy-cv-url' // TODO: upload implementeren
  }
  await addDoc(collection(db, 'student'), {
    authUid: user.uid,
    voornaam: voornaam.value,
    achternaam: achternaam.value,
    leeftijd: leeftijd.value,
    domein: domein.value,
    studiejaar: studiejaar.value,
    talenkennis: talenkennis.value,
    linkedin: linkedin.value,
    beschikbaarVanaf: beschikbaarVanaf.value,
    opportuniteit: opportuniteit.value,
    intro: intro.value,
    skills: skills.value,
    toestemming: toestemming.value,
    foto: fotoUrl,
    cv: cvUrl,
    aangemaaktOp: new Date()
  })
  alert('Profiel succesvol opgeslagen!')
  router.push('/dashboard')
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
          <input id="voornaam" v-model="voornaam" type="text" placeholder="Voer je naam in..." required />
        </div>

        <div class="form-group">
          <label for="achternaam">Achternaam *</label>
          <input id="achternaam" v-model="achternaam" type="text" placeholder="Voer je achternaam in..." required />
        </div>

        <div class="form-group">
          <label for="leeftijd">Leeftijd *</label>
          <input id="leeftijd" v-model="leeftijd" type="number" placeholder="Voer je leeftijd in..." required />
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
          <select id="studiejaar" v-model="studiejaar" required>
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
          <input id="linkedin" v-model="linkedin" type="url" placeholder="https://linkedin.com/in/jouwnaam" />
        </div>

        <div class="form-group">
          <label for="cv-upload">CV uploaden *</label>
          <input id="cv-upload" type="file" @change="handleCvUpload" required />
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
          <p><strong>{{ voornaam || 'Voornaam' }} {{ achternaam || 'Achternaam' }}</strong></p>
        </div>

        <div class="form-group">
          <label for="beschikbaarVanaf">Beschikbaar vanaf *</label>
          <input id="beschikbaarVanaf" v-model="beschikbaarVanaf" type="date" required />
        </div>

        <div class="form-group">
          <label for="opportuniteit">Opportuniteit *</label>
          <select id="opportuniteit" v-model="opportuniteit" required>
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
            v-model="intro"
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

        <div class="toestemming-richting">
  <input
    type="checkbox"
    v-model="toestemming"
    id="toestemming-checkbox"
    required
  />
  <label for="toestemming-checkbox">
    Ik geef toestemming dat mijn ingevulde gegevens gebruikt mogen worden in het kader van deze toepassing. *
  </label>
</div>

        <div class="submit-section">
          <button class="submit-knop" type="submit">Bevestig gegevens</button>
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
</style> 

