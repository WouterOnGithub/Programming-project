<template>
  <div id="app">
    <Navbar />
    <!-- Hero Section -->
    <section class="hero" id="home">
      <div class="hero-container">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">
              Vinden en gevonden worden.<br />
              <span class="highlight">Sneller dan ooit.</span>
            </h1>
            <p class="hero-description">
              Stop met eindeloos solliciteren. Bouw één keer je profiel en laat stage- en jobkansen naar jou toe komen.
            </p>
            <div class="hero-actions">
              <button class="btn-primary" @click="goToRegister">Registreren</button>
            </div>
          </div>
 
          <div class="hero-visual">
            <div class="hero-image">
              <img src="/Images/two-people.png" alt="Students showcasing talent" class="hero-img" />
            </div>
          </div>
        </div>
      </div>
    </section>
 
    <!-- Career Launch Section -->
    <section class="career-launch-banner-modern">
      <div class="career-launch-banner-inner">
        <img src="/Images/carreer-launch2026.png" alt="Career Launch 2026" class="career-launch-img-modern" />
        <div class="career-launch-content-modern">
          <h2 class="career-launch-title-modern">CAREER LAUNCH '25-'26</h2>
          <div class="career-launch-date-modern">DONDERDAG 13 MAART 2026</div>
          <p class="career-launch-desc-modern">
            Het ultieme netwerkevent van de design- en technologieopleidingen. Deze jaarlijkse jobbeurs slaat de brug tussen onze innovatieve opleidingen en het dynamische werkveld.
          </p>
        </div>
      </div>
    </section>
 
    <!-- Event Details Section -->
    <section class="event-details">
      <div class="container">
        <div class="details-grid">
          <div class="schedule-card">
            <h3>Dagplanning - Career Launch</h3>
            <div class="schedule-info">
              <p><strong>Datum:</strong> donderdag 13 maart 2026</p>
            </div>
            <ul class="schedule-list">
              <li><span class="time">10:00</span><span class="event">Start van het evenement</span></li>
              <li><span class="time">12:00 - 13:00</span><span class="event">Lunchmoment</span></li>
              <li><span class="time">16:00</span><span class="event">Einde van de beurs</span></li>
            </ul>
          </div>
 
          <div class="location-card">
            <h3>Locatie</h3>
            <div class="address">
              <p><strong>Nijverheidskaai 170</strong></p>
              <p>1070 Anderlecht</p>
            </div>
            <div class="google-map">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2520.516845654147!2d4.310765315770837!3d50.83432337952588!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c3c3e7a4f4a5ab%3A0x1d0c8e8c7a2b3c4d!2sNijverheidskaai%20170%2C%201070%20Anderlecht%2C%20Belgium!5e0!3m2!1sen!2sbe!4v1623456789012!5m2!1sen!2sbe"
                width="100%" height="300" style="border:0; border-radius: 12px;" allowfullscreen="" loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
 
    <!-- Companies -->
    <section class="companies">
      <div class="container">
        <h3>Deelnemende bedrijven:</h3>
        <div class="companies-grid">
          <div class="company-card" v-for="company in companies" :key="company.id">
            <div class="company-logo">
              <img :src="company.logo" :alt="company.name" class="company-logo-img" />
            </div>
            <span class="company-name">{{ company.name }}</span>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>
 
<script>
import Navbar from '../../components/Navbar.vue'
import '../../css/Home.css'
export default {
  name: 'Homepage',
  components: { Navbar},
  data() {
    return {
      isMenuOpen: false,
      companies: [
        { id: 1, name: 'Accenture', logo: '/Images/accenture-logo.png' },
        { id: 2, name: 'Cegeka', logo: '/Images/cegeka-logo.jpg' },
        { id: 3, name: 'Proximus', logo: '/Images/proximus-logo.png' },
        { id: 4, name: 'Cronos', logo: '/Images/cronos-logo.png' },
        { id: 5, name: 'Telenet', logo: '/Images/telenet-logo.png' }
      ]
    }
  },
  methods: {
    goToRegister() {
      this.$router.push('/register')
    },
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    },
    setActiveSection(section) {
      this.activeSection = section
      this.isMenuOpen = false
    }
  },
  mounted() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault()
        const target = document.querySelector(this.getAttribute('href'))
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    })
  }
}
</script>
 
