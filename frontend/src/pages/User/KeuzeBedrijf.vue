<template>
    <div class="app-container">
      <!-- Rode glow langs de randen van de pagina -->
      <div class="page-glow glow-top-left"></div>
      <div class="page-glow glow-top-right"></div>
      <div class="page-glow glow-bottom-left"></div>
      <div class="page-glow glow-bottom-right"></div>
  
      <div class="profile-wrapper">
        <!-- De profielkaart -->
        <div
          class="profile-card"
          :class="{ 'swipe-left': swipeDirection === 'left', 'swipe-right': swipeDirection === 'right' }"
          @animationend="handleAnimationEnd"
        >
          <div class="profile-header">
            <img class="profile-image" :src="currentProfile.image" alt="Profielfoto" />
            <div class="profile-name-role">
              <h2 class="name">{{ currentProfile.name }}</h2>
              <h3 class="role">{{ currentProfile.role }}</h3>
              <p class="domain">Geïnteresseerd in: <strong>{{ currentProfile.interest }}</strong></p>
              <p class="domain">Domein: <strong>{{ currentProfile.domain }}</strong></p>
            </div>
          </div>
  
          <div class="profile-intro">
            <p v-for="(line, index) in currentProfile.intro" :key="index">{{ line }}</p>
          </div>
  
          <div class="skills">
            <h4>SKILLS</h4>
            <div class="skills-list">
              <span v-for="(skill, index) in currentProfile.skills" :key="index" class="skill">{{ skill }}</span>
            </div>
          </div>
  
          <div class="profile-links">
            <a :href="currentProfile.cv" download class="btn">
              <i class="fas fa-file-download"></i> cv-{{ currentProfile.name }}.pdf
            </a>
            <a :href="currentProfile.linkedin" target="_blank" class="btn linkedin">
              <i class="fab fa-linkedin"></i> LinkedIn
            </a>
          </div>
        </div>
  
        <!-- Swipe-knoppen -->
        <div class="button-bar">
          <button @click="swipe('left')" class="cross">✖</button>
          <button @click="swipe('right')" class="heart">♥</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import '../../css/KeuzeBedrijf.css';
  
  export default {
    data() {
      return {
        profiles: [
          {
            name: "Jonathan Primo",
            role: "STUDENT",
            interest: "Studentenjob",
            domain: "Cybersecurity",
            intro: [
              "Hallo,",
              "Ik ben Jonathan",
              "Ik hou van cybersecurity",
              "Ik ben sociaal en heb al eerder teams geleid",
              "Aangenaam kennis te maken"
            ],
            skills: ["Leiderschap", "Teamwork", "Cloud", "Python", "Machine learning", "Project management"],
            cv: "#",
            linkedin: "#",
            image: "https://via.placeholder.com/80"
          },
          {
            name: "Sarah Vermeulen",
            role: "STUDENT",
            interest: "Stageplaats",
            domain: "Data Science",
            intro: [
              "Hallo,",
              "Ik ben Sarah",
              "Ik werk graag met data",
              "Ik ben leergierig en proactief",
              "Aangenaam kennis te maken"
            ],
            skills: ["Data analyse", "Python", "SQL", "Machine learning", "Communicatie", "Statistiek"],
            cv: "#",
            linkedin: "#",
            image: "https://via.placeholder.com/80"
          }
        ],
        currentIndex: 0,
        swipeDirection: null
      };
    },
    computed: {
      currentProfile() {
        return this.profiles[this.currentIndex];
      }
    },
    methods: {
      swipe(direction) {
        if (this.swipeDirection) return;
        this.swipeDirection = direction;
      },
      handleAnimationEnd() {
        this.swipeDirection = null;
        this.currentIndex = (this.currentIndex + 1) % this.profiles.length;
      }
    }
  };
  </script>
  
  <style scoped>
  @import '../../css/KeuzeBedrijf.css';
  </style>
  