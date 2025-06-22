<script setup>
import { ref, reactive, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import profielfoto from '/Images/profielfoto.jpg'
import { useToast } from 'vue-toastification'
import TimePicker from '../../../components/TimePicker.vue'

const toast = useToast()
const router = useRouter()
const auth = getAuth()
const db = getFirestore()
const storage = getStorage()

const formData = reactive({
  bedrijfsnaam: '',
  gesitueerdIn: '',
  starttijd: '10:00',
  eindtijd: '16:00',
  opZoekNaar: '',
  aangepasteZoekterm: '',
  linkedin: '',
  gesprekDuur: '',
  overOns: '',
  email: '',
  website: '',
  telefoonnummer: '',
  branche: '',
  bedrijfsgrootte: '',
  opgerichtIn: '',
  foto: null,
  fotoUrl: null,
  toestemming: false
})

const fotoPreview = ref(null)
const aangepasteZoektermInput = ref(null)
const foutmelding = ref('')

const opZoekNaarOpties = [
  'IT-studenten',
  'Marketing profielen',
  'Boekhouders',
  'Stagiairs',
  'Vrijwilligers',
  'Anders'
]
const geselecteerdeZoekprofielen = ref([])
const selectedOpZoekNaar = ref('')
const showCustomOpZoekNaar = ref(false)
const customOpZoekNaar = ref('')

const brancheOpties = [
  'IT & Software',
  'Marketing & Communicatie',
  'Finance & Banking',
  'Healthcare',
  'Education',
  'Retail',
  'Manufacturing',
  'Consulting',
  'Media & Entertainment',
  'Non-profit',
  'Overig'
]
const bedrijfsgrootteOpties = [
  '1-10 medewerkers',
  '11-50 medewerkers',
  '51-200 medewerkers',
  '201-500 medewerkers',
  '501-1000 medewerkers',
  '1000+ medewerkers'
]

watch(() => formData.opZoekNaar, async (val) => {
  if (val === 'Anders') {
    await nextTick()
    aangepasteZoektermInput.value?.focus()
  }
})

watch(() => formData.starttijd, (newStartTime) => {
  if (newStartTime >= formData.eindtijd) {
    formData.eindtijd = newStartTime
  }
})

function handleFotoUpload(e) {
  const file = e.target.files[0]
  if (file) {
    formData.foto = file
    fotoPreview.value = URL.createObjectURL(file)
  }
}

function addOpZoekNaar() {
  if (selectedOpZoekNaar.value === 'Anders') {
    showCustomOpZoekNaar.value = true
  } else if (
    selectedOpZoekNaar.value &&
    !geselecteerdeZoekprofielen.value.includes(selectedOpZoekNaar.value)
  ) {
    geselecteerdeZoekprofielen.value.push(selectedOpZoekNaar.value)
    showCustomOpZoekNaar.value = false
    selectedOpZoekNaar.value = ''
  }
}

function confirmCustomOpZoekNaar() {
  const trimmed = customOpZoekNaar.value.trim()
  if (trimmed && !geselecteerdeZoekprofielen.value.includes(trimmed)) {
    geselecteerdeZoekprofielen.value.push(trimmed)
  }
  customOpZoekNaar.value = ''
  showCustomOpZoekNaar.value = false
  selectedOpZoekNaar.value = ''
}

function removeOpZoekNaar(index) {
  geselecteerdeZoekprofielen.value.splice(index, 1)
}

async function bevestigGegevens() {
  if (
    !formData.bedrijfsnaam ||
    !formData.gesitueerdIn ||
    !formData.starttijd ||
    !formData.eindtijd ||
    geselecteerdeZoekprofielen.value.length === 0 ||
    !formData.gesprekDuur ||
    !formData.overOns ||
    !formData.toestemming
  ) {
    foutmelding.value = 'Vul alle verplichte velden in en geef toestemming.'
    toast.error('Vul alle verplichte velden in en geef toestemming.')
    return
  }

  if (formData.starttijd >= formData.eindtijd) {
    foutmelding.value = 'De starttijd moet voor de eindtijd liggen.'
    toast.error('De starttijd moet voor de eindtijd liggen.')
    return
  }

  try {
    const user = auth.currentUser
    if (!user) throw new Error('Geen ingelogde gebruiker gevonden')

    let fotoUrl = null
    if (formData.foto) {
      const fotoRef = storageRef(storage, `bedrijf_fotos/${user.uid}_${Date.now()}`)
      await uploadBytes(fotoRef, formData.foto)
      fotoUrl = await getDownloadURL(fotoRef)
    }

    await setDoc(doc(db, 'bedrijf', user.uid), {
      authUid: user.uid,
      aangemaaktOp: new Date(),
      bedrijfsnaam: formData.bedrijfsnaam,
      gesitueerdIn: formData.gesitueerdIn,
      starttijd: formData.starttijd,
      eindtijd: formData.eindtijd,
      opZoekNaar: geselecteerdeZoekprofielen.value,
      linkedin: formData.linkedin,
      gesprekDuur: formData.gesprekDuur,
      overOns: formData.overOns,
      email: user.email,
      website: formData.website,
      telefoonnummer: formData.telefoonnummer,
      branche: formData.branche,
      bedrijfsgrootte: formData.bedrijfsgrootte,
      opgerichtIn: formData.opgerichtIn,
      foto: fotoUrl,
      toestemming: formData.toestemming,
      verificatieStatus: 'wachtend op verificatie',
      afwijzingsreden: null
    })

    foutmelding.value = ''
    toast.success('Bedrijfsprofiel succesvol opgeslagen!')
    setTimeout(() => {
      router.push('/BedrijfDashboard')
    }, 1500)

  } catch (error) {
    console.error('Fout bij opslaan:', error)
    foutmelding.value = 'Fout bij opslaan van je gegevens.'
    toast.error('Fout bij opslaan van je gegevens.')
  }
}
</script>

<template>
  <main class="dashboard-main">
    <div class="bedrijf-invoer">
      <div class="header-blok">
        <h2 class="titel">Bedrijf-profiel</h2>
        <p class="uitleg">Vul hieronder je bedrijfsgegevens in. Velden met een * zijn verplicht.</p>
      </div>

      <form class="formulier-grid" @submit.prevent="bevestigGegevens">
        <div class="form-column">
          <div class="profielfoto-section">
            <div class="foto-preview-wrapper">
              <img
                v-if="fotoPreview"
                :src="fotoPreview"
                alt="Profielfoto bedrijf preview"
                class="foto-preview"
              />
              <img
                v-else
                :src="profielfoto"
                alt="Standaard profielfoto bedrijf"
                class="foto-preview"
              />
            </div>
            <label for="foto-upload" class="foto-upload-button">Upload foto</label>
            <input id="foto-upload" type="file" accept="image/*" @change="handleFotoUpload" hidden />
            <p style="text-align:center;"><strong>{{ formData.bedrijfsnaam || 'Bedrijfsnaam' }}</strong></p>
          </div>

          <div class="form-group">
            <label for="bedrijfsnaam">Bedrijfsnaam *</label>
            <input id="bedrijfsnaam" v-model="formData.bedrijfsnaam" type="text" placeholder="Bijv. Mediahuis" required />
          </div>

          <div class="form-group">
            <label for="gesitueerdIn">Gesitueerd in *</label>
            <input id="gesitueerdIn" v-model="formData.gesitueerdIn" type="text" placeholder="Bijv. Brussel" required />
          </div>

          <!-- Startuur en Einduur naast elkaar -->
          <div class="tijd-grid">
            <TimePicker
              label="Startuur aanwezigheid *"
              v-model="formData.starttijd"
              min="10:00"
              max="16:00"
            />
            <TimePicker
              label="Einduur aanwezigheid *"
              v-model="formData.eindtijd"
              :min="formData.starttijd"
              max="16:00"
            />
          </div>

        </div>

        <div class="form-column">
          <div class="form-group">
            <label for="linkedin">LinkedIn</label>
            <input id="linkedin" v-model="formData.linkedin" type="url" placeholder="https://linkedin.com/company/jouwbedrijf" />
          </div>

          <div class="form-group">
            <label for="contactEmail">Contact e-mail</label>
            <input id="contactEmail" v-model="formData.email" type="email" placeholder="contact@bedrijf.nl" />
          </div>

          <div class="form-group">
            <label for="website">Website</label>
            <input id="website" v-model="formData.website" type="url" placeholder="https://www.bedrijf.nl" />
          </div>

          <div class="form-group">
            <label for="telefoonnummer">Telefoonnummer</label>
            <input id="telefoonnummer" v-model="formData.telefoonnummer" type="tel" placeholder="+31 20 123 4567" />
          </div>

          <div class="form-group">
            <label for="branche">Branche</label>
            <select id="branche" v-model="formData.branche">
              <option disabled value="">Selecteer branche</option>
              <option v-for="opt in brancheOpties" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="bedrijfsgrootte">Bedrijfsgrootte</label>
            <select id="bedrijfsgrootte" v-model="formData.bedrijfsgrootte">
              <option disabled value="">Selecteer grootte</option>
              <option v-for="opt in bedrijfsgrootteOpties" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="opgerichtIn">Opgericht in</label>
            <input id="opgerichtIn" v-model="formData.opgerichtIn" type="number" min="1800" :max="new Date().getFullYear()" placeholder="2020" />
          </div>

          <div class="form-group">
            <label for="opZoekNaar">Op zoek naar *</label>
            <select class="skills-dropdown" v-model="selectedOpZoekNaar" @change="addOpZoekNaar">
              <option disabled value="">Selecteer een profiel</option>
              <option v-for="opt in opZoekNaarOpties" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <div v-if="showCustomOpZoekNaar" class="custom-skill-input">
              <input type="text" v-model="customOpZoekNaar" placeholder="Typ je eigen profiel..." />
              <button type="button" class="custom-skill-btn" @click="confirmCustomOpZoekNaar">Toevoegen</button>
            </div>
            <div class="chip-cloud">
              <span class="chip" v-for="(profiel, index) in geselecteerdeZoekprofielen" :key="index">
                {{ profiel }}
                <button type="button" class="chip-delete" @click="removeOpZoekNaar(index)">&times;</button>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label for="gesprekDuur">Elk gesprek duurt *</label>
            <select id="gesprekDuur" v-model="formData.gesprekDuur" required>
              <option disabled value="">Kies duur</option>
              <option>10 minuten</option>
              <option>15 minuten</option>
              <option>20 minuten</option>
              <option>25 minuten</option>
              <option>30 minuten</option>
            </select>
          </div>

          <div class="form-group">
            <label for="overOns">Over ons *</label>
            <textarea
              id="overOns"
              v-model="formData.overOns"
              placeholder="Beschrijf hier jullie missie, cultuur en troeven."
              rows="6"
              required
            ></textarea>
          </div>

          <div class="toestemming-richting">
            <input type="checkbox" v-model="formData.toestemming" id="toestemming-checkbox" required />
            <label for="toestemming-checkbox">
              Ik geef toestemming dat mijn ingevulde gegevens gebruikt mogen worden in het kader van deze toepassing. *
            </label>
          </div>

          <div class="submit-section">
            <button class="submit-knop" type="submit">Bevestig gegevens</button>
          </div>

          <p v-if="foutmelding" class="foutmelding">{{ foutmelding }}</p>
        </div>
      </form>
    </div>
  </main>
</template>

<style scoped>
.bedrijf-invoer {
  padding: 2rem 2rem 4rem;
  max-width: 1000px;
  margin: 0 auto;
  background: #f5f5f7;
  font-family: sans-serif;
}

.header-blok {
  background: #ffffff;
  padding: 3rem 2rem 2rem;
  text-align: center;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.titel {
  font-size: 2.6rem;
  font-weight: 700;
  color: #b80000;
  margin-bottom: 1rem;
}

.uitleg {
  font-size: 1.1rem;
  color: #6e6e73;
  max-width: 600px;
  margin: 0 auto;
}

.formulier-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

@media (min-width: 768px) {
  .formulier-grid {
    flex-direction: row;
  }

  .form-column {
    width: 50%;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
}

label {
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: #1d1d1f;
}

input[type='text'],
input[type='url'],
input[type='time'],
select,
textarea {
  font-size: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid #e0b4b4;
  border-radius: 12px;
  background-color: #fff;
  font-family: inherit;
}

input[type='email'],
input[type='tel'],
input[type='number'] {
  font-size: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid #e0b4b4;
  border-radius: 12px;
  background-color: #fff;
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
  border-radius: 24px;
  font-weight: 600;
  cursor: pointer;
  display: block;
  margin: 0.5rem auto 1rem;
  text-align: center;
}

.foutmelding {
  color: #b80000;
  font-weight: 600;
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
}

.submit-knop:hover {
  background-color: #990000;
}

.toestemming-richting {
  display: flex;
  gap: 0.8rem;
  margin-top: 1.5rem;
  font-size: 0.95rem;
}

.toestemming-richting input[type="checkbox"] {
  transform: scale(1.3);
  accent-color: #b80000;
}

/* Nieuwe layout voor Locatie, Startuur, Einduur */
.locatie-tijden-grid {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
}

.veld-blok {
  flex: 1;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .locatie-tijden-grid {
    flex-direction: column;
  }
}

/* Enhanced Mobile Responsive Styles */
@media (max-width: 768px) {
  .bedrijf-invoer {
    padding: 1rem 1rem 2rem;
  }

  .header-blok {
    padding: 2rem 1rem 1.5rem;
    margin-bottom: 1.5rem;
  }

  .titel {
    font-size: 2rem;
  }

  .uitleg {
    font-size: 1rem;
  }

  .formulier-grid {
    gap: 1.5rem;
  }

  .form-column {
    width: 100%;
  }

  .form-group {
    margin-bottom: 1.2rem;
  }

  .tijd-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .foto-preview-wrapper {
    width: 100px;
    height: 100px;
  }

  .chip-cloud {
    gap: 6px;
  }

  .chip {
    font-size: 0.85rem;
    padding: 4px 8px;
  }

  .custom-skill-input {
    flex-direction: column;
    gap: 0.5rem;
  }

  .custom-skill-input input {
    width: 100%;
  }

  .custom-skill-btn {
    align-self: flex-start;
  }

  .toestemming-richting {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .toestemming-richting input[type="checkbox"] {
    transform: scale(1.2);
  }
}

.tijd-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: end;
}

.tijd-veld label {
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
  display: block;
}

.tijd-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f8f9fa;
  cursor: pointer;
}

.tijd-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.8;
}

.chip-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 0.3rem;
}
.chip {
  display: inline-flex;
  align-items: center;
  background-color: #eee;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 0.9rem;
}
.chip-delete {
  background: none;
  border: none;
  color: #e53935;
  font-size: 16px;
  font-weight: bold;
  margin-left: 6px;
  cursor: pointer;
}
.custom-skill-input {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.custom-skill-input input {
  flex: 1;
}
.custom-skill-btn {
  background-color: #b80000;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.custom-skill-btn:hover {
  background-color: #990000;
}
</style>

