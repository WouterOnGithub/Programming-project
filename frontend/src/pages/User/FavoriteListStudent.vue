<template>
    <header>
      <nav class="navbar">
        <img src="/Images/ehb-logo.png" alt="Erasmus logo" class="logo" />
        <div class="menu">
          <button class="btn"><i class="fas fa-heart"></i></button>
          <button class="btn"><i class="fas fa-home"></i></button>
          <button class="btn"><i class="fas fa-user"></i></button>
          <button class="btn"><i class="fas fa-comment-dots"></i></button>
      </div>
    </nav>
    </header>
      <main class="main-content">
        <div class="company-row"
        v-for="company in companies"
        :key="company.name">
  <div class="company-info">
    <div class="circle">
        <img :src="company.foto" alt="Company Logo" />
    </div>
    <strong>{{ company.name }}</strong>
  </div>
  <div class="company-links">
    <a :href="company.linkedin" target="_blank">Linkedin</a>
    <i class="fas fa-heart"></i>
  </div>
</div>
        <div class="button-wrapper">
            <button class="search-btn">Verder Zoeken</button>
        </div>
      </main>
          <footer class="footer">
      <div>
        <p><a href="#">Contact</a></p>
        <p><a href="#">Sociale Media</a></p>
      </div>
      <img src="/Images/ehb-logo.png" alt="Erasmus" class="logo" />
    </footer>
  </template>

<script>
export default {
  name: 'FavoriteList',
  data() {
    return {
      companies: [
        { id: 1, name: 'Anne Bosseman', photo: '/Images/ehb-logo.png' },
        { id: 2, name: 'Imad Ben Ali', photo: '/Images/ehb-logo.png' }
      ]
    };
  },
  mounted() {
    fetch('http://localhost:5000/api/favorite')
      .then(response => response.json())
      .then(data => {
        this.companies = data;
      })
      .catch(error => {
        console.error('Fout bij het laden van favorieten:', error);
      });
  }
};
</script>

<style src="../../css/FavoriteListStudent.css"></style>