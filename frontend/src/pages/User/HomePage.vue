<script setup>
import '../../css/home.css'
import { reactive, ref } from 'vue';
import axios from 'axios';

const student = reactive({
  voornaam: '',
  achternaam: '',
  email: '',
  linkedin_profiel: '',
  opleiding: '',
  afstudeerjaar: null,
  profiel_foto: '',
});

const message = ref('');

async function submitForm() {
  try {
    const response = await axios.post('http://localhost:3000/api/students', student);
    message.value = `Student toegevoegd met ID: ${response.data.student_id}`;
    Object.keys(student).forEach(key => student[key] = key === 'afstudeerjaar' ? null : '');
  } catch (error) {
    message.value = 'Fout bij toevoegen student: ' + (error.response?.data?.error || error.message);
  }
}
</script>
<template>
  <div class="homepage">
    <h1>Nieuwe student toevoegen</h1>

    <form @submit.prevent="submitForm">
      <div>
        <label>Voornaam:</label>
        <input v-model="student.voornaam" required />
      </div>

      <div>
        <label>Achternaam:</label>
        <input v-model="student.achternaam" required />
      </div>

      <div>
        <label>Email:</label>
        <input type="email" v-model="student.email" required />
      </div>

      <div>
        <label>LinkedIn profiel URL:</label>
        <input v-model="student.linkedin_profiel" />
      </div>

      <div>
        <label>Opleiding:</label>
        <input v-model="student.opleiding" />
      </div>

      <div>
        <label>Afstudeerjaar:</label>
        <input type="number" v-model.number="student.afstudeerjaar" min="1900" max="2100" />
      </div>

      <div>
        <label>Profiel foto URL:</label>
        <input v-model="student.profiel_foto" />
      </div>

      <button type="submit">Student toevoegen</button>
    </form>

    <p v-if="message">{{ message }}</p>
  </div>
</template>

