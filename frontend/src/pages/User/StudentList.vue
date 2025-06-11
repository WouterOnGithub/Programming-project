<template>
        <header>
        <div class="home">
            <nav class="navbar">
                <img src="/Images/ehb-logo.png" alt="Erasmus logo" class="logo" />
                <div class="menu">
                    <button class="btn"><i class="fas fa-heart"></i></button>
                    <button class="btn"><i class="fas fa-home"></i></button>
                    <button class="btn"><i class="fas fa-user"></i></button>
                    <button class="btn"><i class="fas fa-comment-dots"></i></button>
                </div>
            </nav>
        </div>
    </header>
    <main class="main-content">
      <div class="search-bar">
        <strong>Zoek op:</strong> <a href="#" class="skill-link">Vaardigheden</a>
      </div>

      <div class="student-row" 
      v-for="student in students" 
      :key="student.id">
        <div class="student-info">
          <div class="circle">
            <img :src="student.photo" alt="photo" />
          </div>
          <strong>{{ student.name }}</strong>
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
        { id: 1, name: 'Naam Voornaam', photo: '/Images/ehb-logo.png'},
      ],
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
