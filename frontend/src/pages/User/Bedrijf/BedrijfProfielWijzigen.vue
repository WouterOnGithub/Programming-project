<template>
  <BedrijfDashboardLayout>
    <main class="main-content">
      <section v-if="loading" class="section-card">Laden...</section>
      <section v-else-if="error" class="section-card" style="color: #b80000;">{{ error }}</section>
      <template v-else>
        <section class="banner">
          <router-link to="/WeergaveBd" class="go-back-knop">
            <span class="go-back-arrow">&#8592;</span> Terug
          </router-link>
          <div class="image-wrapper">
            <img :src="profielfotoURL" alt="Profielfoto bedrijf" class="banner-img" />
            <label for="foto-upload" class="upload-icon" title="Wijzig profielfoto">
              <img :src="potlood" alt="Upload icoon" />
              <input id="foto-upload" type="file" accept="image/*" @change="wijzigAfbeelding" hidden />
            </label>
          </div>
          <div class="banner-text">
            <h2>{{ bedrijfsdata.bedrijfsnaam || 'Bedrijfsnaam' }}</h2>
            <p>Werk mee aan de toekomst — pas je bedrijfsprofiel aan.</p>
          </div>
        </section>

        <div class="form-container">
          <form class="form" @submit.prevent="bevestigGegevens">
            <div class="form-grid">
              <div class="form-group">
                <label for="bedrijfsnaam">Bedrijfsnaam *</label>
                <input id="bedrijfsnaam" v-model="bedrijfsdata.bedrijfsnaam" type="text" placeholder="Bv. CoolCompany" required />
              </div>
              <div class="form-group">
                <label for="gesitueerdIn">Gesitueerd in *</label>
                <input id="gesitueerdIn" v-model="bedrijfsdata.gesitueerdIn" type="text" placeholder="Bv. Brussel" required />
              </div>
              <TimePicker
                label="Starttijd *"
                v-model="bedrijfsdata.starttijd"
                min="10:00"
                max="16:00"
              />
              <TimePicker
                label="Eindtijd *"
                v-model="bedrijfsdata.eindtijd"
                :min="bedrijfsdata.starttijd"
                max="16:00"
              />
              <div class="form-group">
                <label for="linkedin">LinkedIn</label>
                <input id="linkedin" v-model="bedrijfsdata.linkedin" type="text" placeholder="https://www.linkedin.com/..." />
              </div>
              <div class="form-group">
                <label for="overOns">Over ons *</label>
                <textarea id="overOns" v-model="bedrijfsdata.overOns" placeholder="Bv. Wij zijn een innovatief bedrijf..." required></textarea>
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
                  <span class="chip" v-for="(profiel, index) in bedrijfsdata.opZoekNaar || []" :key="index">
                    {{ profiel }}
                    <button type="button" class="chip-delete" @click="removeOpZoekNaar(index)">&times;</button>
                  </span>
                </div>
              </div>
              <div class="form-group">
                <label for="typePositie">Type posities</label>
                <select class="skills-dropdown" v-model="selectedTypePositie" @change="addTypePositie">
                  <option disabled value="">Selecteer type positie</option>
                  <option v-for="opt in typePositieOpties" :key="opt" :value="opt">{{ opt }}</option>
                </select>
                <div class="chip-cloud">
                  <span class="chip" v-for="(type, index) in bedrijfsdata.typePosities || []" :key="index">
                    {{ type }}
                    <button type="button" class="chip-delete" @click="removeTypePositie(index)">&times;</button>
                  </span>
                </div>
              </div>
              <div class="form-group">
                <label for="gesprekDuur">Elk gesprek duurt *</label>
                <select id="gesprekDuur" v-model="bedrijfsdata.gesprekDuur" required>
                  <option disabled value="">Kies duur</option>
                  <option>10 minuten</option>
                  <option>15 minuten</option>
                  <option>20 minuten</option>
                  <option>25 minuten</option>
                  <option>30 minuten</option>
                </select>
              </div>
              <div class="form-group">
                <label for="contactEmail">Contact e-mail</label>
                <input id="contactEmail" v-model="bedrijfsdata.email" type="email" placeholder="contact@bedrijf.nl" />
              </div>
              <div class="form-group">
                <label for="website">Website</label>
                <input id="website" v-model="bedrijfsdata.website" type="url" placeholder="https://www.bedrijf.nl" />
              </div>
              <div class="form-group">
                <label for="telefoonnummer">Telefoonnummer</label>
                <input id="telefoonnummer" v-model="bedrijfsdata.telefoonnummer" type="tel" placeholder="+31 20 123 4567" />
              </div>
              <div class="form-group">
                <label for="branche">Branche</label>
                <select id="branche" v-model="bedrijfsdata.branche" class="skills-dropdown">
                  <option disabled value="">Selecteer branche</option>
                  <option v-for="opt in brancheOpties" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>
              <div class="form-group">
                <label for="bedrijfsgrootte">Bedrijfsgrootte</label>
                <select id="bedrijfsgrootte" v-model="bedrijfsdata.bedrijfsgrootte" class="skills-dropdown">
                  <option disabled value="">Selecteer grootte</option>
                  <option v-for="opt in bedrijfsgrootteOpties" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>
              <div class="form-group">
                <label for="opgerichtIn">Opgericht in</label>
                <input id="opgerichtIn" v-model="bedrijfsdata.opgerichtIn" type="number" min="1800" :max="new Date().getFullYear()" placeholder="2020" />
              </div>
            </div>

            <div v-if="foutmelding" class="error-message">{{ foutmelding }}</div>
            <button class="submit-knop" type="submit">Gegevens opslaan</button>
          </form>
        </div>
      </template>
    </main>
  </BedrijfDashboardLayout>
</template>

<script setup>
import { ref, nextTick, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'
import { useToast } from 'vue-toastification'
import profielfotoDefault from '/Images/profielfoto.jpg'
import potlood from '/Images/potlood.png'
import BedrijfDashboardLayout from '../../../components/BedrijfDashboardLayout.vue'
import TimePicker from '../../../components/TimePicker.vue'

const toast = useToast()
const profielfotoURL = ref(profielfotoDefault)
const bedrijfsdata = ref({})
const bedrijfsDocId = ref(null)
const loading = ref(true)
const error = ref(null)
const foutmelding = ref("")
const router = useRouter()

const opZoekNaarOpties = [
  'IT-studenten',
  'Marketing profielen',
  'Boekhouders',
  'Stagiairs',
  'Vrijwilligers',
  'Anders'
]
const typePositieOpties = [
  'Stage',
  'Studentenjob',
  'Voltijdse job',
  'Parttime'
]
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

const geselecteerdeZoekprofielen = ref([])
const selectedOpZoekNaar = ref('')
const showCustomOpZoekNaar = ref(false)
const customOpZoekNaar = ref('')
const gesprekDuur = ref("")
const toestemming = ref(true)
const aangepasteZoektermInput = ref(null)

const geselecteerdeTypePosities = ref([])

onMounted(async () => {
  const db = getFirestore()
  const auth = getAuth()
  const user = auth.currentUser
  if (!user) {
    error.value = 'Niet ingelogd.'
    loading.value = false
    return
  }
  try {
    const q = query(collection(db, 'bedrijf'), where('authUid', '==', user.uid))
    const snapshot = await getDocs(q)
    if (!snapshot.empty) {
      bedrijfsdata.value = snapshot.docs[0].data()
      bedrijfsDocId.value = snapshot.docs[0].id
      profielfotoURL.value = bedrijfsdata.value.foto || profielfotoDefault
    } else {
      error.value = 'Geen bedrijfsprofiel gevonden.'
    }
  } catch (e) {
    error.value = 'Fout bij ophalen bedrijfsprofiel.'
  } finally {
    loading.value = false
  }
})

watch(() => bedrijfsdata.value.starttijd, (newStartTime) => {
  if (newStartTime && bedrijfsdata.value.eindtijd && newStartTime >= bedrijfsdata.value.eindtijd) {
    bedrijfsdata.value.eindtijd = newStartTime
  }
})

function wijzigAfbeelding(event) {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = () => {
      profielfotoURL.value = reader.result
      bedrijfsdata.value.foto = reader.result
    }
    reader.readAsDataURL(file)
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

function addTypePositie() {
  if (
    selectedTypePositie.value &&
    !geselecteerdeTypePosities.value.includes(selectedTypePositie.value)
  ) {
    geselecteerdeTypePosities.value.push(selectedTypePositie.value)
    selectedTypePositie.value = ''
  }
}

function removeTypePositie(index) {
  geselecteerdeTypePosities.value.splice(index, 1)
}

async function bevestigGegevens() {
  if (!bedrijfsdata.value.bedrijfsnaam || !bedrijfsdata.value.gesitueerdIn || !bedrijfsdata.value.starttijd || !bedrijfsdata.value.eindtijd) {
    foutmelding.value = 'Vul alle verplichte velden in.'
    toast.error('Vul alle verplichte velden in.')
    return
  }

  if (bedrijfsdata.value.starttijd >= bedrijfsdata.value.eindtijd) {
    foutmelding.value = 'Starttijd moet voor eindtijd zijn.'
    toast.error('Starttijd moet voor eindtijd zijn.')
    return
  }

  try {
    const db = getFirestore()
    const docRef = doc(db, 'bedrijf', bedrijfsDocId.value)
    await updateDoc(docRef, bedrijfsdata.value)
    toast.success('Bedrijfsgegevens succesvol opgeslagen.')
    router.push('/WeergaveBd')
  } catch (e) {
    foutmelding.value = 'Fout bij het opslaan van de gegevens.'
    toast.error('Fout bij het opslaan van de gegevens.')
  }
}
</script>


<style scoped>
.bedrijf-wijzig {
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f7;
  font-family: 'Segoe UI', sans-serif;
}

.sidebar-nav {
  width: 16rem;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.sidebar-header,
.sidebar-user,
.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  border-top: none;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-logo {
  width: 2rem;
  height: 2rem;
  background: #b80000;
  color: white;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.sidebar-title {
  font-size: 1.1rem;
  font-weight: 600;
}

.sidebar-subtitle {
  font-size: 0.8rem;
  color: #6b7280;
}

.sidebar-menu {
  padding: 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  color: #111827;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
}

.sidebar-link.active {
  background-color: #b80000;
  color: white;
  font-weight: bold;
}

.sidebar-link:hover {
  background: #f3f4f6;
}

.sidebar-user-avatar {
  width: 2rem;
  height: 2rem;
  background: #b80000;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.main-content {
  flex: 1;
  padding: 2.5rem;
  width: 100%;
  max-width: none;
  margin: 0;
}

.banner {
  display: flex;
  align-items: center;
  background: #fff1f1;
  padding: 2.5rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  gap: 2rem;
  position: relative;
}

.banner-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.banner-text h2 {
  font-size: 1.8rem;
  color: #b80000;
}

.banner-text p {
  margin-top: 0.5rem;
  color: #6e6e73;
}

.image-wrapper {
  position: relative;
  display: inline-block;
}

.upload-icon {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: white;
  border-radius: 50%;
  padding: 6px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.upload-icon img {
  width: 18px;
  height: 18px;
}

.form-container {
  width: 100%;
  background: white;
  padding: 2rem 2.5rem;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  margin: 0 auto 2rem auto;
  max-width: 950px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.input-wrapper {
  position: relative;
}

input,
select,
textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  padding-right: 2.5rem;
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: white;
  font-family: inherit;
}

textarea {
  resize: vertical;
  min-height: 80px;
  max-height: 180px;
  overflow-y: auto;
}

.input-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  opacity: 0.6;
  pointer-events: none;
}

.custom-input input {
  margin-top: 0.5rem;
}

.submit-knop {
  align-self: flex-start;
  padding: 0.9rem 2rem;
  background-color: #b80000;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.submit-knop:hover {
  background-color: #990000;
}

.error-message {
  color: #b80000;
  font-weight: 600;
  font-size: 0.95rem;
  margin-top: -1rem;
}

.go-back-knop {
  position: absolute;
  right: 2rem;
  top: 2rem;
  background: #fff;
  color: #b80000;
  border: 2px solid #b80000;
  border-radius: 2rem;
  padding: 0.4rem 1.2rem 0.4rem 1.2rem;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s, color 0.2s;
  z-index: 3;
}

.go-back-knop:hover {
  background: #b80000;
  color: #fff;
}

.go-back-arrow {
  font-size: 1.2rem;
  margin-right: 0.3rem;
}

@media (max-width: 900px) {
  .sidebar-nav {
    display: none;
  }

  .main-content {
    padding: 2rem 1rem;
    margin-left: 0;
    width: 100%;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
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
    