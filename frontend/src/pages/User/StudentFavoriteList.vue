<template>
    <header>
        <div class="home">
            <nav class="navbar">
                <img src="/Images/ehb-logo.png" alt="Erasmus logo" class="logo" />
                <div class="menu">
                  <button class="btn">❤️</button>
                  <button class="btn">🏠</button>
                  <button class="btn">👤</button>
                  <button class="btn">💬</button>
                </div>
            </nav>
        </div>
    </header>
    <p v-if="!visibleCompanies.length" class="loading">Even geduld...</p>
    <main class="main-content">
      <div
        class="company-row"
        v-for="company in visibleCompanies"
        :key="company.id"
        v-if="visibleCompanies.length"
      >
        <div class="company-info">
          <div class="circle">
            <img :src="company.photo" alt="company"/>
          </div>
          <div class="company-text">
            <strong>{{ company.name }}</strong>
          </div>
        </div>
        <i class="fas fa-heart"></i>
      </div>

      <div class="button-wrapper">
        <button class="search-btn" @click="loadMore">Verder kijken</button>
      </div>
    </main>

</template>

<script>
export default {
  name: 'StudentFavoriteList',
  data() {
    return {
      allCompanies: [
        {id: '1', name: 'naam1', photo: '/Images/ehb-logo.png'},
        {id: '2', name: 'naam2', photo: '/Images/ehb-logo.png'},
        {id: '3', name: 'naam3', photo: '/Images/ehb-logo.png'},
        {id: '4', name: 'naam4', photo: '/Images/ehb-logo.png'},
        {id: '5', name: 'naam5', photo: '/Images/ehb-logo.png'},
        {id: '6', name: 'naam6', photo: '/Images/ehb-logo.png'},
        {id: '7', name: 'naam7', photo: '/Images/ehb-logo.png'},
        {id: '8', name: 'naam8', photo: '/Images/ehb-logo.png'},
        {id: '9', name: 'naam9', photo: '/Images/ehb-logo.png'},
        {id: '10', name: 'naam10', photo: '/Images/ehb-logo.png'},
      ],
      visibleCompanies: [],
      currentindex: 0,
      displayCount: 5
    };
  },

methods: {
  loadMore() {
    const start = this.currentindex;
    const end = start + this.displayCount;

    this.visibleCompanies = this.allCompanies.slice(start, end);

    if (end >= this.allCompanies.length) {
      this.currentindex = 0;
    } else {
      this.currentindex = end;
    }
  }
},
  mounted() {
    fetch('http://localhost:5000/api/company/favorites')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length && data[0].name && data[0].photo){
          this.allCompanies = data;
        }
        this.loadMore();
      })
      .catch(err => {
        console.error('Fout bij het laden van studenten:', err);
        this.loadMore();
      });
  }
};
</script>

<style src="../../css/StudentFavoriteList.css"></style>