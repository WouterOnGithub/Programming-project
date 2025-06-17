StprofielWijizig.vue  RANIA
<template>
  <div class="student-wijzig">
    <!-- Sidebar identiek aan bedrijf -->
    <aside class="sidebar-nav">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <i class="fas fa-user-graduate"></i>
        </div>
        <div>
          <h1 class="sidebar-title">StudentMatch</h1>
          <p class="sidebar-subtitle">Studentendashboard</p>
        </div>
      </div>

      <nav class="sidebar-menu">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          :class="['sidebar-link', $route.path === item.href ? 'active' : '']"
        >
          <i :class="item.icon"></i>
          {{ item.name }}
        </router-link>
      </nav>

      <div class="sidebar-user">
        <div class="sidebar-user-avatar">
          <i class="fas fa-user"></i>
        </div>
        <div>
          <p class="sidebar-user-name">{{ voornaam }} {{ achternaam }}</p>
          <p class="sidebar-user-role">Student</p>
        </div>
      </div>

      <div class="sidebar-footer">
        <router-link
          to="/student/profiel"
          :class="['sidebar-link', $route.path === '/student/profiel' ? 'active' : '']"
        >
          <i class="fas fa-pen"></i> Wijzig
        </router-link>
        <router-link to="/" class="sidebar-link">
          <i class="fas fa-sign-out-alt"></i> Uitloggen
        </router-link>
      </div>
    </aside>

    <main class="main-content">
      <section class="banner">
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

      <!-- Formulier -->
      <form class="form" @submit.prevent="bevestigGegevens">
  <div class="form-grid">

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
      <div class="input-wrapper">
        <input v-model="domein" required />
        <img class="input-icon" :src="potlood" alt="potlood" />
      </div>
    </div>

    <div class="form-group">
      <label>Studiejaar</label>
      <div class="input-wrapper">
        <select v-model="studiejaar">
          <option>1e jaar</option>
          <option>2e jaar</option>
          <option>3e jaar</option>
          <option>4e jaar</option>
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

    <div class="form-group tekstvak volle-breedte">
      <label>Introductie *</label>
      <div class="input-wrapper">
        <textarea v-model="intro" required></textarea>
        <img class="input-icon" :src="potlood" alt="potlood" />
      </div>
    </div>

    <!-- De rest zoals talenkennis, skills en toestemming blijven gelijk -->

  </div>

  <div v-if="bevestiging" class="bevestiging-tekst">{{ bevestiging }}</div>
  <div v-if="foutmelding" class="error-message">{{ foutmelding }}</div>

  <button class="submit-knop" type="submit">Profiel opslaan</button>
</form>

    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import profielfotoDefault from '/Images/profielfoto.jpg'
import potlood from '/Images/potlood.png'

const route = useRoute()
const voornaam = ref('Jonathan')
const achternaam = ref('Primo')
const leeftijd = ref(22)
const domein = ref('Cybersecurity')
const studiejaar = ref('3e jaar')
const beschikbaarVanaf = ref('2025-09-01')
const opportuniteit = ref('Stage')
const linkedin = ref('https://www.linkedin.com/in/jonathan-primo')
const intro = ref('Hallo, ik ben Jonathan...')

const talenkennis = ref([])
const andereTaal = ref('')
const skills = ref([])
const nieuweSkill = ref('')
const toestemming = ref(false)
const bevestiging = ref('')
const foutmelding = ref('')
const profielfotoURL = ref(profielfotoDefault)
const fileInputKey = ref(Date.now())

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
  if (!voornaam.value || !achternaam.value || !leeftijd.value || !domein.value || !opportuniteit.value || !intro.value || !toestemming.value) {
    foutmelding.value = 'Gelieve alle verplichte velden in te vullen.'
    bevestiging.value = ''
    return
  }
  foutmelding.value = ''
  bevestiging.value = 'Gegevens succesvol opgeslagen!'
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

const navigation = [
  { name: 'Dashboard', href: '/student/dashboard', icon: 'fas fa-chart-pie' },
  { name: 'Favorieten', href: '/student/favorieten', icon: 'fas fa-heart' },
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
  padding: 3rem;
  max-width: 1100px;
  margin: 0 auto;
}

.banner {
  display: flex;
  align-items: center;
  background: #fff1f1;
  padding: 2rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  gap: 2rem;
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

</style>
