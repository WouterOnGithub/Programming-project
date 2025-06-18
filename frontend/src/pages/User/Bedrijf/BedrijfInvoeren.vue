<script setup>
import { ref, reactive, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, addDoc } from 'firebase/firestore'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import profielfoto from '/Images/profielfoto.jpg'
import BedrijfDashboardLayout from '../../../components/BedrijfDashboardLayout.vue'

const router = useRouter()
const auth = getAuth()
const db = getFirestore()
const storage = getStorage()

const formData = reactive({
  bedrijfsnaam: '',
  gesitueerdIn: '',
  opZoekNaar: '',
  aangepasteZoekterm: '',
  linkedin: '',
  gesprekDuur: '',
  overOns: '',
  locatie: '',
  starttijd: '',
  eindtijd: '',
  toestemming: false,
  foto: null,
  fotoUrl: null
})

const fotoPreview = ref(null)
const aangepasteZoektermInput = ref(null)
const foutmelding = ref('')

watch(() => formData.opZoekNaar, async (val) => {
  if (val === 'Anders') {
    await nextTick()
    aangepasteZoektermInput.value?.focus()
  }
})

function handleFotoUpload(e) {
  const file = e.target.files[0]
  if (file) {
    formData.foto = file
    fotoPreview.value = URL.createObjectURL(file)
  }
}

async function bevestigGegevens() {
  const gekozenZoekterm = formData.opZoekNaar === 'Anders' ? formData.aangepasteZoekterm : formData.opZoekNaar

  if (
    !formData.bedrijfsnaam ||
    !formData.gesitueerdIn ||
    !gekozenZoekterm ||
    !formData.gesprekDuur ||
    !formData.overOns ||
    !formData.locatie ||
    !formData.starttijd ||
    !formData.eindtijd ||
    !formData.toestemming
  ) {
    foutmelding.value = 'Gelieve alle verplichte velden in te vullen en toestemming te geven.'
    return
  }

  foutmelding.value = ''
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('Geen ingelogde gebruiker gevonden')
    }

    // Upload foto indien aanwezig
    let fotoUrl = null
    if (formData.foto) {
      const fotoRef = storageRef(storage, `bedrijf_fotos/${user.uid}_${Date.now()}`)
      await uploadBytes(fotoRef, formData.foto)
      fotoUrl = await getDownloadURL(fotoRef)
    }

    // Voeg bedrijf toe aan Firestore
    await addDoc(collection(db, 'bedrijf'), {
      bedrijfsnaam: formData.bedrijfsnaam,
      gesitueerdIn: formData.gesitueerdIn,
      opZoekNaar: gekozenZoekterm,
      linkedin: formData.linkedin,
      gesprekDuur: formData.gesprekDuur,
      overOns: formData.overOns,
      locatie: formData.locatie,
      starttijd: formData.starttijd,
      eindtijd: formData.eindtijd,
      toestemming: formData.toestemming,
      foto: fotoUrl,
      authUid: user.uid,
      email: user.email,
      aangemaaktOp: new Date()
    })
    alert('Bedrijfsprofiel succesvol opgeslagen!')
    router.push('/BedrijfDashboard')
  } catch (error) {
    console.error('Error saving company profile:', error)
    foutmelding.value = 'Er is een fout opgetreden bij het opslaan van het bedrijfsprofiel.'
  }
}
</script>

<template>
  <BedrijfDashboardLayout>
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

            <!-- Locatie onder elkaar -->
            <div class="form-group">
              <label for="locatie">Locatie *</label>
              <input
                type="text"
                id="locatie"
                v-model="formData.locatie"
                placeholder="Bijv. Brussels Expo"
                required
              />
            </div>

            <!-- Startuur en Einduur naast elkaar -->
            <div class="tijd-grid">
              <div class="tijd-veld">
                <label for="starttijd">Startuur *</label>
                <input
                  type="time"
                  id="starttijd"
                  v-model="formData.starttijd"
                  required
                />
              </div>

              <div class="tijd-veld">
                <label for="eindtijd">Einduur *</label>
                <input
                  type="time"
                  id="eindtijd"
                  v-model="formData.eindtijd"
                  required
                />
              </div>
            </div>

          </div>

          <div class="form-column">
            <div class="form-group">
              <label for="linkedin">LinkedIn</label>
              <input id="linkedin" v-model="formData.linkedin" type="url" placeholder="https://linkedin.com/company/jouwbedrijf" />
            </div>

            <div class="form-group">
              <label for="opZoekNaar">Op zoek naar *</label>
              <select id="opZoekNaar" v-model="formData.opZoekNaar" required>
                <option disabled value="">Selecteer een profiel</option>
                <option>IT-studenten</option>
                <option>Marketing profielen</option>
                <option>Boekhouders</option>
                <option>Stagiairs</option>
                <option>Vrijwilligers</option>
                <option>Anders</option>
              </select>
              <div v-if="formData.opZoekNaar === 'Anders'" class="form-group">
                <input
                  ref="aangepasteZoektermInput"
                  type="text"
                  v-model="formData.aangepasteZoekterm"
                  placeholder="Specificeer waar je naar zoekt..."
                  required
                />
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
  </BedrijfDashboardLayout>
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
.tijd-grid {
  display: flex;
  gap: 1rem;
}

.tijd-veld {
  flex: 1;
  display: flex;
  flex-direction: column;
}

</style>
