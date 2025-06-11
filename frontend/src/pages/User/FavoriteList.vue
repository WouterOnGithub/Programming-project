<template>
    <header>
        <nav class="nav-bar">
            <button class="nav-btn"><i class="fas fa-heart"></i></button>
            <button class="nav-btn"><i class="fas fa-home"></i></button>
            <button class="nav-btn"><i class="fas fa-user"></i></button>
            <button class="nav-btn"><i class="fas fa-comment-dots"></i></button>
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
  </template>

<script>
export default {
  name: 'FavoriteList',
  data() {
    return {
      companies: []
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

<style src="../../css/FavoriteList.css"></style>