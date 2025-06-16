<template>
        <header>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <div class="home">
            <nav class="navbar">
                <img src="/Images/ehb-logo.png" alt="Erasmus logo" class="logo" />
                <div class="menu">
                  <button class="btn"><i class="fa-solid fa-heart"></i></button>
                  <button class="btn"><i class="fa-solid fa-house"></i></button>
                  <button class="btn"><i class="fa-solid fa-user"></i></button>
                  <button class="btn"><i class="fa-solid fa-comment"></i></button>
                </div>
            </nav>
        </div>
    </header>
    <main class="main-content">
      <div class="search-bar">
        <div class="filter-title">
          <strong>Zoek op:</strong>
          <a @click="showFilter = !showFilter" class="skill-link">Vaardigheden</a>
        </div>
        <div v-if="showFilter" class="filter-panel">
          <div class="skills-grid">
            <label v-for="skill in allskills" :key="skill">
              <input type="checkbox" :value="skill" v-model="selectedSkills"/>
              {{ skill }}
            </label>
          </div>
          <div class="andere-row">
            <label>
              <input type="checkbox" value="andere" v-model="selectedSkills" @change="toggleCustomInput"/>
              andere
            </label>
            <input v-if="showCustomInput"
              type="text"
              v-model="customSkill"
              class="custom-skill-input"
              placeholder="Voeg een vaardigheid toe"
            />
          </div>
        </div>
      </div>
      <div class="student-row" 
      v-for="student in filteredStudents" 
      :key="student.id">
        <div class="student-info">
          <div class="circle">
            <img :src="student.photo" alt="photo" />
          </div>
          <strong>{{ student.name }}</strong>
          <p class="skills">
            {{ student.skills.join(', ') }}
          </p>
      </div>
        <router-link :to="`/student/${student.id}`" class="profile-btn">
          Bekijk profiel
        </router-link>
      </div>
    </main>
</template>

<script>
export default {
  name: 'StudentList',
  data() {
    return {
      students: [
        { id: 1, 
          name: 'Naam Voornaam', 
          photo: '/Images/ehb-logo.png',
          skills: ['frontend']},
        { id: 2, 
          name: 'Naam Voornaam', 
          photo: '/Images/ehb-logo.png',
          skills: ['netwerk']},
        { id: 3,
          name: 'Naam Voornaam',
          photo: '/Images/ehb-logo.png',
          skills: ['python']},
      ],
      showFilter: false,
      allskills: ['frontend','backend','fullstack','netwerk','database','AI','cybersecurity','game','design'],
      selectedSkills: [],
      showCustomInput: false,
      customSkill: ''
    }
  },
  computed: {
    filteredStudents() {
      let selected = [...this.selectedSkills];

      if(this.selectedSkills.includes('andere')&& this.customSkill.trim() !== ''){
        selected.push(this.customSkill.trim().toLowerCase());
      }

      if (this.selectedSkills.length === 0) return this.students;

      return this.students.filter(student => 
        student.skills && 
        selected.some(skill => student.skills.map(s => s.toLowerCase()).includes(skill))
      )
    }
  },
  methods: {
    toggleCustomInput() {
      this.showCustomInput = this.selectedSkills.includes('andere');
    }
  },
  mounted() {
    fetch('http://localhost:5000/api/students')
      .then(res => res.json())
      .then(data => {
        this.students = data;
      })
      .catch(error => {
        console.error('Fout bij het laden van studenten:', error);
      });
  }
};
</script>

<style src="../../css/StudentList.css"></style>
