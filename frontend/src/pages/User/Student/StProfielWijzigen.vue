StprofielWijizig.vue  RANIA
<template>
  <StudentDashboardLayout>
    <main class="main-content">
      <section class="banner">
        <router-link to="/WeergaveSt" class="go-back-knop">
          <span class="go-back-arrow">&#8592;</span> Terug
        </router-link>
        <div class="image-wrapper">
          <img :src="profielfotoURL" alt="Profielfoto" class="banner-img" />
          <label for="foto-upload" class="upload-icon">
            <img :src="potlood" alt="Upload icoon" />
            <input
              :key="fileInputKey"
              name="foto"
              id="foto-upload"
              type="file"
              accept="image/*"
              @change="wijzigAfbeelding"
              hidden
            />
          </label>
        </div>
        <div class="banner-text">
          <h2>{{ voornaam }} {{ achternaam }}</h2>
          <p>{{ domein }} – {{ studiejaar }}</p>
        </div>
      </section>

      <form class="form" @submit.prevent="bevestigGegevens">
        <!-- 2-koloms grid voor basisgegevens -->
        <section class="section-card">
          <div class="gegevens-grid">
            <div class="form-group">
              <label>Voornaam *</label>
              <div class="input-wrapper">
                <input v-model="voornaam" required />
                <img class="input-icon" :src="potlood" alt="potlood" />
              </div>
            </div>
            <div class="form-group">
              <label>Achternaam *</label>
              <div class="input-wrapper">
                <input v-model="achternaam" required />
                <img class="input-icon" :src="potlood" alt="potlood" />
              </div>
            </div>
            <div class="form-group">
              <label>Leeftijd *</label>
              <div class="input-wrapper">
                <input type="number" v-model="leeftijd" required />
                <img class="input-icon" :src="potlood" alt="potlood" />
              </div>
            </div>
            <div class="form-group">
              <label>Domein *</label>
              <select class="skills-dropdown" v-model="selectedDomein" @change="addDomein">
                <option disabled value="">Selecteer je domein</option>
                <option v-for="d in possibleDomeinen" :key="d" :value="d">{{ d }}</option>
                <option value="custom">Andere domein...</option>
              </select>
              <div v-if="showCustomDomein" class="custom-skill-input">
                <input type="text" v-model="customDomein" placeholder="Typ je eigen domein..." />
                <button type="button" class="custom-domein-btn" @click="confirmCustomDomein">Toevoegen</button>
              </div>
              <div class="chip-cloud">
                <span class="chip" v-for="(d, index) in domein" :key="index">
                  {{ d }}
                  <button type="button" class="chip-delete" @click="removeDomein(index)">&times;</button>
                </span>
              </div>
            </div>
            <div class="form-group">
              <label>Studiejaar</label>
              <div class="input-wrapper">
                <select v-model="studiejaar">
                  <option>1e jaar</option>
                  <option>2e jaar</option>
                  <option>3e jaar</option>
                  <option>Afgestudeerd</option>
                </select>
                <img class="input-icon" :src="potlood" alt="potlood" />
              </div>
            </div>
            <div class="form-group">
              <label>Beschikbaar vanaf</label>
              <div class="input-wrapper">
                <input type="date" v-model="beschikbaarVanaf" />
                <img class="input-icon" :src="potlood" alt="potlood" />
              </div>
            </div>
            <div class="form-group">
              <label>Opportuniteit *</label>
              <div class="input-wrapper">
                <select v-model="opportuniteit" required>
                  <option>Stage</option>
                  <option>Studentenjob</option>
                  <option>Vrijwilligerswerk</option>
                  <option>Andere</option>
                </select>
                <img class="input-icon" :src="potlood" alt="potlood" />
              </div>
            </div>
            <div class="form-group">
              <label>LinkedIn</label>
              <div class="input-wrapper">
                <input v-model="linkedin" />
                <img class="input-icon" :src="potlood" alt="potlood" />
              </div>
            </div>
          </div>
        </section>

        <!-- Introductie -->
        <section class="section-card">
          <label>Introductie *</label>
          <div class="input-wrapper">
            <textarea v-model="intro" required class="intro-textarea"></textarea>
            <img class="input-icon" :src="potlood" alt="potlood" />
          </div>
        </section>

        <!-- Vaardigheden -->
        <section class="section-card">
          <h2>Vaardigheden</h2>
          <select class="skills-dropdown" v-model="selectedSkill" @change="addSkill">
            <option disabled value="">Maak een keuze</option>
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
            <button type="button" class="custom-skill-btn" @click="confirmCustomSkill">Toevoegen</button>
          </div>
          <div class="chip-cloud">
            <span class="chip" v-for="(skill, index) in skills" :key="index">
              {{ skill }}
              <button type="button" class="chip-delete" @click="removeSkill(index)">&times;</button>
            </span>
          </div>
        </section>

        <!-- Talenkennis -->
        <section class="section-card">
          <h2>Talenkennis</h2>
          <select class="skills-dropdown" v-model="selectedTaal" @change="addTaal">
            <option disabled value="">Maak een keuze</option>
            <option v-for="taal in possibleTalen" :key="taal" :value="taal">{{ taal }}</option>
            <option value="custom">Andere taal...</option>
          </select>
          <div v-if="showCustomTaal" class="custom-skill-input">
            <input type="text" v-model="customTaal" placeholder="Typ je eigen taal..." />
            <button type="button" class="custom-skill-btn" @click="confirmCustomTaal">Toevoegen</button>
          </div>
          <div class="chip-cloud">
            <span class="chip" v-for="(taal, index) in talenkennis" :key="index">
              {{ taal }}
              <button type="button" class="chip-delete" @click="removeTaal(index)">&times;</button>
            </span>
          </div>
        </section>

        <!-- CV -->
        <section class="section-card">
          <h2>CV</h2>
          <div class="input-wrapper">
            <input type="file" accept=".pdf,.doc,.docx" @change="uploadCV" />
            <img class="input-icon" :src="potlood" alt="potlood" />
          </div>
          <div v-if="cv.naam" class="cv-info">
            <span><strong>Huidige CV:</strong> {{ cv.naam }} ({{ cv.grootte }})</span>
            <button type="button" class="cv-verwijder-knop" @click="verwijderCV">Verwijder</button>
          </div>
        </section>

        <div v-if="bevestiging" class="bevestiging-tekst">{{ bevestiging }}</div>
        <div v-if="foutmelding" class="error-message">{{ foutmelding }}</div>
        <button class="submit-knop" type="submit">Profiel opslaan</button>
      </form>
    </main>
  </StudentDashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import profielfotoDefault from '/Images/profielfoto.jpg'
import potlood from '/Images/potlood.png'
import StudentDashboardLayout from '../../../components/StudentDashboardLayout.vue'

const route = useRoute()
const router = useRouter()
const voornaam = ref('Jonathan')
const achternaam = ref('Primo')
const leeftijd = ref(22)
const studiejaar = ref('3e jaar')
const beschikbaarVanaf = ref('2025-09-01')
const opportuniteit = ref('Stage')
const linkedin = ref('https://www.linkedin.com/in/jonathan-primo')
const intro = ref('Hallo, ik ben Jonathan...')

const talenkennis = ref(['Nederlands', 'Engels', 'Frans', 'Andere (Japans)'])
const andereTaal = ref('')
const skills = ref(['Teamwork', 'Python', 'Machine Learning', 'Leiderschap'])
const nieuweSkill = ref('')
const toestemming = ref(false)
const bevestiging = ref('')
const foutmelding = ref('')
const profielfotoURL = ref(profielfotoDefault)
const fileInputKey = ref(Date.now())
const cv = ref({ naam: '', grootte: '' })

const talenSuggesties = ['Nederlands', 'Engels', 'Frans', 'Duits', 'Spaans']
const skillsSuggesties = ['JavaScript', 'Vue.js', 'Python', 'SQL', 'Java']

const gefilterdeTaalSuggesties = computed(() => {
  return andereTaal.value
    ? talenSuggesties.filter(t =>
        t.toLowerCase().includes(andereTaal.value.toLowerCase()) &&
        !talenkennis.value.includes(t)
      )
    : []
})

const gefilterdeSkillSuggesties = computed(() => {
  return nieuweSkill.value
    ? skillsSuggesties.filter(s =>
        s.toLowerCase().includes(nieuweSkill.value.toLowerCase()) &&
        !skills.value.includes(s)
      )
    : []
})

const possibleTalen = [
  'Nederlands', 'Engels', 'Frans', 'Duits', 'Spaans',
  'Chinees', 'Arabisch', 'Russisch', 'Italiaans', 'Portugees'
]
const selectedTaal = ref('')
const showCustomTaal = ref(false)
const customTaal = ref('')

const selectedSkill = ref("");
const showCustomSkill = ref(false);
const customSkill = ref("");

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
];
const domein = ref([]);
const selectedDomein = ref("");
const showCustomDomein = ref(false);
const customDomein = ref("");

// Mock profieldata (voor demo)
const profiel = {
  voornaam: 'Jonathan',
  achternaam: 'Primo',
  leeftijd: 22,
  domein: 'Cybersecurity', // of ['Cybersecurity', 'Cloud Computing']
  studiejaar: '3e jaar',
  beschikbaarVanaf: '2025-09-01',
  opportuniteit: 'Stage',
  linkedin: 'https://www.linkedin.com/in/jonathan-primo',
  intro: 'Hallo, ik ben Jonathan...'
  // ... andere velden ...
}

onMounted(() => {
  // Zet domein-array correct bij laden van de pagina
  if (profiel.domein) {
    domein.value = Array.isArray(profiel.domein) ? profiel.domein : [profiel.domein];
  }
  // Eventueel ook andere velden initialiseren
  voornaam.value = profiel.voornaam;
  achternaam.value = profiel.achternaam;
  leeftijd.value = profiel.leeftijd;
  studiejaar.value = profiel.studiejaar;
  beschikbaarVanaf.value = profiel.beschikbaarVanaf;
  opportuniteit.value = profiel.opportuniteit;
  linkedin.value = profiel.linkedin;
  intro.value = profiel.intro;
});

function wijzigAfbeelding(event) {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = () => {
      profielfotoURL.value = reader.result
      fileInputKey.value = Date.now()
    }
    reader.readAsDataURL(file)
  }
}

function bevestigGegevens() {
  foutmelding.value = ''
  bevestiging.value = 'Gegevens succesvol opgeslagen!'
  setTimeout(() => {
    router.push('/WeergaveSt');
  }, 1000);
}

function voegTaalToe(taal = andereTaal.value) {
  if (taal && !talenkennis.value.includes(taal)) {
    talenkennis.value.push(taal)
    andereTaal.value = ''
  }
}

function verwijderTaal(taal) {
  talenkennis.value = talenkennis.value.filter(t => t !== taal)
}

function voegSkillToe(skill = nieuweSkill.value) {
  if (skill && !skills.value.includes(skill)) {
    skills.value.push(skill)
    nieuweSkill.value = ''
  }
}

function verwijderSkill(index) {
  skills.value.splice(index, 1)
}

function uploadCV(event) {
  const file = event.target.files[0]
  if (file) {
    cv.value.naam = file.name
    cv.value.grootte = Math.round(file.size / 1024) + ' kB'
  }
}

function verwijderCV() {
  cv.value = { naam: '', grootte: '' }
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
}

function confirmCustomTaal() {
  const trimmed = customTaal.value.trim();
  if (trimmed && !talenkennis.value.includes(trimmed)) {
    talenkennis.value.push(trimmed);
  }
  customTaal.value = '';
}

function removeTaal(index) {
  talenkennis.value.splice(index, 1)
}

function addSkill() {
  if (selectedSkill.value === "custom") {
    showCustomSkill.value = true;
  } else if (
    selectedSkill.value &&
    !skills.value.includes(selectedSkill.value)
  ) {
    skills.value.push(selectedSkill.value);
    showCustomSkill.value = false;
    selectedSkill.value = "";
  }
}

function confirmCustomSkill() {
  const trimmed = customSkill.value.trim();
  if (trimmed && !skills.value.includes(trimmed)) {
    skills.value.push(trimmed);
  }
  customSkill.value = "";
  showCustomSkill.value = false;
  selectedSkill.value = "";
}

function removeSkill(index) {
  skills.value.splice(index, 1);
}

function addDomein() {
  if (selectedDomein.value === "custom") {
    showCustomDomein.value = true;
  } else if (
    selectedDomein.value &&
    !domein.value.includes(selectedDomein.value)
  ) {
    domein.value.push(selectedDomein.value);
    showCustomDomein.value = false;
    selectedDomein.value = "";
  }
}

function confirmCustomDomein() {
  const trimmed = customDomein.value.trim();
  if (trimmed && !domein.value.includes(trimmed)) {
    domein.value.push(trimmed);
  }
  customDomein.value = "";
  showCustomDomein.value = false;
  selectedDomein.value = "";
}

function removeDomein(index) {
  domein.value.splice(index, 1);
}

const navigation = [
  { name: 'Dashboard', href: '/student/dashboard', icon: 'fas fa-chart-pie' },
  { name: 'Favorieten', href: '/student/favorieten', icon: 'fas fa-heart' },
  { name: 'Matches', href: '/stmatch' },
  { name: 'Gesprekken', href: '/student/gesprekken', icon: 'fas fa-comments' },
  { name: 'Profiel', href: '/student/profiel', icon: 'fas fa-user' }
]
</script>

<style scoped>
.student-wijzig {
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

.form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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

input,
select,
textarea {
  width: 100%;
  padding: 0.9rem 1rem;
  font-size: 1rem;
  border-radius: 10px;
  border: 1px solid #ccc;
  background: white;
  font-family: inherit;
}

textarea {
  resize: vertical;
  min-height: 120px;
  max-height: 180px;
  width: 100%;
  padding: 0.9rem 1rem;
  font-size: 1rem;
  border-radius: 10px;
  border: 1px solid #ccc;
  background: white;
  font-family: inherit;
}

.input-wrapper {
  position: relative;
}

.input-wrapper input,
.input-wrapper textarea {
  padding-right: 2.5rem;
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

.input-with-button {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.input-with-button input {
  flex: 1;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.toevoeg-knop {
  background-color: #e53935;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 8px;
  font-weight: bold;
}

.suggestie-lijst {
  list-style: none;
  margin-top: 5px;
  padding-left: 0;
  border: 1px solid #ccc;
  max-height: 120px;
  overflow-y: auto;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.suggestie-item {
  padding: 6px 12px;
  cursor: pointer;
}

.suggestie-item:hover {
  background-color: #f0f0f0;
}

.toestemming-box {
  grid-column: span 2;
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid #ccc;
}

.checkbox-label input[type="checkbox"] {
  accent-color: #b80000;
  width: 20px;
  height: 20px;
}

.bevestiging-tekst {
  color: #e53935;
  font-size: 0.9rem;
  font-style: italic;
}

.error-message {
  color: #b80000;
  font-weight: 600;
  font-size: 0.95rem;
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
  transition: background 0.2s;
}

.submit-knop:hover {
  background-color: #990000;
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
.volle-breedte {
  grid-column: span 2;
}

.input-wrapper {
  position: relative;
}

.input-wrapper input,
.input-wrapper select,
.input-wrapper textarea {
  padding-right: 2.5rem; /* ruimte voor icoon aan rechterkant */
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

.cv-info {
  margin-top: 0.5rem;
  color: #333;
  font-size: 0.98rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.cv-verwijder-knop {
  background: #fff;
  color: #b80000;
  border: 1px solid #b80000;
  border-radius: 1.2rem;
  padding: 0.2rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.cv-verwijder-knop:hover {
  background: #b80000;
  color: #fff;
}

.gegevens-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem 2rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 900px) {
  .gegevens-grid {
    grid-template-columns: 1fr;
  }
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

.custom-domein-btn {
  background-color: #b80000;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.custom-domein-btn:hover {
  background-color: #990000;
}
</style>
