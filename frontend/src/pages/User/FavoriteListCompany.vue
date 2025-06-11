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
      <div
        class="student-row"
        v-for="student in students"
        :key="student.id"
      >
        <div class="student-info">
          <div class="circle">
            <img :src="student.photo" alt="Student photo" />
          </div>
          <div class="student-text">
            <strong>{{ student.name }}</strong>
            <p>Student</p>
          </div>
        </div>
        <i class="fas fa-heart"></i>
      </div>

      <div class="button-wrapper">
        <button class="search-btn">Verder kijken</button>
      </div>
    </main>
</template>

<script>
export default {
  name: 'FavoriteStudentList',
  data() {
    return {
      students: []
    };
  },
  mounted() {
    fetch('http://localhost:5000/api/company/favorites')
      .then(res => res.json())
      .then(data => {
        this.students = data;
      })
      .catch(err => {
        console.error('Fout bij het laden van studenten:', err);
      });
  }
};
</script>

<style src="../../css/FavoriteListCompany.css"></style>
