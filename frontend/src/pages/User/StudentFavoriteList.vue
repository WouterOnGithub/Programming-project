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
            <img :src="company.photo" alt="Company"/>
          </div>
          <div class="company-text">
            <strong>{{ company.name }}</strong>
            <p>Company</p>
          </div>
        </div>
        <button class="favorite-btn" @click="confirmRemove(company)">
          <i class="fas fa-heart"></i>
        </button>
      </div>

      <div class="button-wrapper">
        <button class="search-btn" @click="loadMore">Verder kijken</button>
      </div>
    </main>
    <div v-if="showConfirm" class="modal-overlay">
      <div class="modal-content">
        <p>Wil je {{ companyToRemove?.name }} echt uit je favorieten verwijderen?</p>
        <button @click="removeFavorite" class="modal-btn confirm">Ja</button>
        <button @click="showConfirm = false" class="modal-btn cancel">Nee</button>
      </div>
    </div>
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
      displayCount: 5,
      showConfirm: false,
      companyToRemove: null
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
  },
  confirmRemove(company) {
    this.companyToRemove = company;
    this.showConfirm = true;
  },
  removeFavorite() {
    if (this.companyToRemove) {
      this.visibleCompanies = this.visibleCompanies.filter(c => c.id !== this.companyToRemove.id);
      this.allCompanies = this.allCompanies.filter(c => c.id !== this.companyToRemove.id);
      this.showConfirm = false;
    }
  }
},
  mounted() {
    fetch('http://localhost:5000/api/student/favorites')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length && data[0].name && data[0].photo){
          this.allCompanies = data;
        }
        this.loadMore();
      })
      .catch(err => {
        console.error('Fout bij het laden van bedrijven:', err);
        this.loadMore();
      });
  }
};
</script>

<style src="../../css/StudentFavoriteList.css"></style>
