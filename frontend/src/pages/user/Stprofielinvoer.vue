<template>
  <div class="profiel-wrapper">
    <div class="profiel-container">

      <!-- Linkerzijde: Formulier -->
      <section class="profiel-links">
        <h2>Profiel Student</h2>

        <label>Voornaam/Achternaam:</label>
        <input type="text" placeholder="Jouw naam" />

        <label>Leeftijd:</label>
        <input type="number" placeholder="Leeftijd" />

        <label>LinkedIn (link):</label>
        <input type="url" placeholder="https://linkedin.com/in/gebruikersnaam" />

        <label>Domein:</label>
        <select>
          <option disabled selected>Kies een domein</option>
          <option>IT</option>
          <option>Design</option>
          <option>Marketing</option>
        </select>

        <label>CV Upload:</label>
        <input type="file" />

        <label>Voorstelling:</label>
        <textarea placeholder="Stel jezelf kort voor..." rows="4"></textarea>

        <!-- Skills -->
        <label>Vaardigheden:</label>
        <select class="skills-dropdown" @change="addSkill">
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

        <div class="selected-skills">
          <span v-for="(skill, index) in selectedSkills" :key="index" class="skill-tag">
            {{ skill }} <button @click="removeSkill(index)" aria-label="Verwijder skill">&times;</button>
          </span>
        </div>
      </section>

      <!-- Rechterzijde: Extra info + foto upload -->
      <section class="profiel-rechts">
        <div class="foto-upload">
          <label for="foto" class="foto-label">
            <input id="foto" type="file" hidden />
            <div class="upload-circle">
              <span>Upload<br />foto</span>
              <i class="icon-upload"></i>
            </div>
          </label>
        </div>

        <label>Studiejaar:</label>
        <select>
          <option disabled selected>Selecteer studiejaar</option>
          <option>1e jaar</option>
          <option>2e jaar</option>
          <option>3e jaar</option>
          <option>Afgestudeerd</option>
        </select>

        <label>Beschikbaar vanaf:</label>
        <input type="date" />

        <label>Gezochte opportuniteit:</label>
        <select>
          <option disabled selected>Kies een type</option>
          <option>Stage</option>
          <option>Studentenjob</option>
          <option>Fulltime job</option>
        </select>

        <label>Talenkennis:</label>
        <input type="text" placeholder="Bijv. Nederlands, Engels..." />

        <div class="toestemming">
          <input type="checkbox" id="toestemming" />
          <label for="toestemming">
            Ik geef toestemming dat mijn gegevens gebruikt mogen worden in het kader van deze toepassing.
          </label>
        </div>

        <button class="submit-btn">Bevestig gegevens</button>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedSkills = ref([])
const showCustomSkill = ref(false)
const customSkill = ref('')

function addSkill(event) {
  const value = event.target.value
  if (value === 'custom') {
    showCustomSkill.value = true
  } else if (value && !selectedSkills.value.includes(value)) {
    selectedSkills.value.push(value)
  }
  event.target.selectedIndex = 0
}

function confirmCustomSkill() {
  if (customSkill.value && !selectedSkills.value.includes(customSkill.value)) {
    selectedSkills.value.push(customSkill.value)
    customSkill.value = ''
    showCustomSkill.value = false
  }
}

function removeSkill(index) {
  selectedSkills.value.splice(index, 1)
}
</script>

<style scoped>
.profiel-wrapper {
  padding: 3rem 1.5rem;
  background: linear-gradient(to bottom, #ffffff, #e6f0f5);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profiel-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 1200px;
  width: 100%;
}

.profiel-links,
.profiel-rechts {
  flex: 1 1 400px;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

h2 {
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
  color: #c20000;
}

label {
  font-weight: 600;
  color: #333;
}

input,
select,
textarea {
  padding: 0.9rem;
  border-radius: 10px;
  border: 1px solid #ccc;
  font-size: 1rem;
  background-color: #f5f7fa;
  transition: border-color 0.3s;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #c20000;
  outline: none;
}

textarea {
  resize: vertical;
}

.skills-dropdown {
  padding: 0.9rem;
  border-radius: 10px;
  border: 1px solid #d0d0d0;
  background-color: #f5f7fa;
  font-size: 1rem;
  width: 100%;
}

.custom-skill-input {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.5rem;
}

.custom-skill-input input {
  flex: 1;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  background-color: #f5f5f5;
}

.custom-skill-input button {
  padding: 0.7rem 1rem;
  border-radius: 8px;
  background-color: #c20000;
  color: white;
  border: none;
  cursor: pointer;
}

.selected-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.skill-tag {
  background-color: #c20000;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.skill-tag button {
  background: none;
  border: none;
  color: white;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
}

.foto-upload {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.upload-circle {
  width: 150px;
  height: 150px;
  background-color: #c20000;
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.submit-btn {
  background-color: #c20000;
  color: white;
  padding: 0.9rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 1rem;
}

.submit-btn:hover {
  background-color: #a00000;
}

.toestemming {
  display: flex;
  gap: 0.7rem;
  align-items: flex-start;
  margin-top: 1rem;
  font-size: 0.95rem;
  color: #444;
}
</style>
