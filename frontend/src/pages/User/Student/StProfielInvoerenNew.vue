<script setup>
import { ref } from 'vue'
import profielfoto from '/Images/profielfoto.jpg'

const voornaam = ref('')
const achternaam = ref('')
const leeftijd = ref('')
const linkedin = ref('')
const domein = ref('')
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

function addSkill(event) {
  const selected = event.target.value
  if (selected === 'custom') {
    showCustomSkill.value = true
  } else if (selected && !skills.value.includes(selected)) {
    skills.value.push(selected)
    event.target.selectedIndex = 0
  }
}

function confirmCustomSkill() {
  const trimmed = customSkill.value.trim()
  if (trimmed && !skills.value.includes(trimmed)) {
    skills.value.push(trimmed)
  }
  customSkill.value = ''
  showCustomSkill.value = false
}

function removeSkill(index) {
  skills.value.splice(index, 1)
}

const foto = ref(null)
const fotoPreview = ref(null)
function handleFotoUpload(e) {
  const file = e.target.files[0]
  if (file) {
    foto.value = file
    fotoPreview.value = URL.createObjectURL(file)
  }
}

const possibleTalen = [
  'Nederlands', 'Engels', 'Frans', 'Duits', 'Spaans',
  'Chinees', 'Arabisch', 'Russisch', 'Italiaans', 'Portugees'
]
</script>

<template>
  <div class="student-invoer">

    <div class="header-blok">
      <h2 class="titel">Student-profiel</h2>
      <p class="uitleg">
        Vul hieronder jouw persoonlijke gegevens in om je profiel aan te maken. Velden met een * zijn verplicht.
      </p>
    </div>

    <form class="formulier-grid" @submit.prevent>

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
          <label for="domein">Domein *</label>
          <select id="domein" v-model="domein" required>
            <option disabled value="">Selecteer je domein</option>
            <option>ICT</option>
            <option>Boekhouden</option>
            <option>Cybersecurity</option>
            <option>Marketing</option>
          </select>
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

        <fieldset class="form-group">
          <legend>Talenkennis *</legend>
          <div class="checkbox-group">
            <label v-for="taal in possibleTalen" :key="taal" class="checkbox-label">
              <input type="checkbox" :value="taal" v-model="talenkennis" required />
              {{ taal }}
            </label>
            <label class="checkbox-label">
              <input type="checkbox" value="Andere" v-model="talenkennis" />
              Andere:
              <input
                type="text"
                v-if="talenkennis.includes('Andere')"
                v-model="andereTaal"
                placeholder="Specificeer..."
                class="inline-text"
              />
            </label>
          </div>
        </fieldset>

        <div class="form-group">
          <label for="linkedin">LinkedIn</label>
          <input id="linkedin" v-model="linkedin" type="url" placeholder="https://linkedin.com/in/jouwnaam" />
        </div>

        <div class="form-group">
          <label for="cv-upload">CV uploaden *</label>
          <input id="cv-upload" type="file" @change="e => cv.value = e.target.files[0]" required />
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
          <input id="foto-upload" type="file" accept="image/*" @change="handleFotoUpload" required hidden />
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
          <select class="skills-dropdown" @change="addSkill" required>
            <option disabled selected>Maak een keuze</option>
            <option>Teamwork</option>
            <option>Leiderschap</option>
            <option>Python</option>
            <option>Machine Learning</option>
            <option>Projectmanagement</option>
            <option>Cloud</option>
            <option value="custom">Andere...</option>
          </select>

          <div v-if="showCustomSkill" class="custom-skill-input">
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

    <footer class="footer">
      contact · FAQ · sociale media
    </footer>
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

