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
        <div class="carousel-search-bar">
          <input
            v-model="companySearch"
            type="text"
            placeholder="Zoek bedrijf..."
            class="carousel-search-input"
          />
          <span class="carousel-search-icon">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
        </div>
        <button class="toggle-companies-btn" @click="showAllCompanies = !showAllCompanies">
          {{ showAllCompanies ? 'Verberg bedrijven' : 'Toon alle bedrijven' }}
        </button>
        <div v-if="showAllCompanies" class="all-companies-grid">
          <div class="company-card" v-for="company in filteredCompanies" :key="company.id">
            <div class="company-logo">
              <img :src="company.logo" :alt="company.name" class="company-logo-img" />
            </div>
            <span class="company-name">{{ company.name }}</span>
          </div>
        </div>
        <div v-else class="carousel-container">
          <div class="carousel-wrapper">
            <div class="companies-carousel" ref="carousel">
              <div class="company-card" v-for="company in filteredCompanies" :key="company.id">
                <div class="company-logo">
                  <img :src="company.logo" :alt="company.name" class="company-logo-img" />
                </div>
                <span class="company-name">{{ company.name }}</span>
              </div>
            </div>
          </div>
          <button class="carousel-btn carousel-btn-prev" @click="prevSlide" :disabled="currentSlide === 0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>
          <button class="carousel-btn carousel-btn-next" @click="nextSlide" :disabled="currentSlide >= maxSlide">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
          <div class="carousel-dots">
            <button 
              v-for="(dot, index) in Math.ceil(companies.length / slidesToShow)" 
              :key="index"
              class="carousel-dot" 
              :class="{ active: currentSlide >= index * slidesToShow && currentSlide < (index + 1) * slidesToShow }"
              @click="goToSlide(index * slidesToShow)"
            ></button>
          </div>
        </div>
      </div>
    </section>

    <!-- Back to Top Button -->
    <button class="back-to-top" @click="scrollToTop" aria-label="Terug naar boven">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#c20000"/><path d="M8 14l4-4 4 4" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
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
      currentSlide: 0,
      slidesToShow: 3,
      companySearch: '',
      showAllCompanies: false,
      showBackToTop: false,
      companies: [
        { id: 1, name: 'Accenture', logo: '/Images/accenture-logo.png' },
        { id: 2, name: 'Cegeka', logo: '/Images/cegeka-logo.jpg' },
        { id: 3, name: 'Proximus', logo: '/Images/proximus-logo.png' },
        { id: 4, name: 'Cronos', logo: '/Images/cronos-logo.png' },
        { id: 5, name: 'Telenet', logo: '/Images/telenet-logo.png' }
      ]
    }
  },
  computed: {
    maxSlide() {
      return Math.max(0, this.filteredCompanies.length - this.slidesToShow)
    },
    filteredCompanies() {
      if (!this.companySearch) return this.companies
      return this.companies.filter(company =>
        company.name.toLowerCase().includes(this.companySearch.toLowerCase())
      )
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
    },
    nextSlide() {
      if (this.currentSlide < this.maxSlide) {
        this.currentSlide++
        this.updateCarousel()
      }
    },
    prevSlide() {
      if (this.currentSlide > 0) {
        this.currentSlide--
        this.updateCarousel()
      }
    },
    goToSlide(index) {
      this.currentSlide = index
      this.updateCarousel()
    },
    updateCarousel() {
      const carousel = this.$refs.carousel
      if (carousel) {
        const cardWidth = carousel.querySelector('.company-card').offsetWidth
        const gap = 32 // 2rem gap
        const translateX = -(this.currentSlide * (cardWidth + gap))
        carousel.style.transform = `translateX(${translateX}px)`
      }
    },
    handleResize() {
      const width = window.innerWidth
      if (width < 768) {
        this.slidesToShow = 1
      } else if (width < 1024) {
        this.slidesToShow = 2
      } else {
        this.slidesToShow = 3
      }
      this.currentSlide = Math.min(this.currentSlide, this.maxSlide)
      this.$nextTick(() => {
        this.updateCarousel()
      })
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    handleScroll() {
      this.showBackToTop = window.scrollY > 300
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
    
    // Initialize carousel
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
    
    // Touch support for mobile
    let startX = 0
    let isDragging = false
    
    const carousel = this.$refs.carousel
    if (carousel) {
      carousel.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX
        isDragging = true
      })
      
      carousel.addEventListener('touchmove', (e) => {
        if (!isDragging) return
        e.preventDefault()
      })
      
      carousel.addEventListener('touchend', (e) => {
        if (!isDragging) return
        isDragging = false
        
        const endX = e.changedTouches[0].clientX
        const diff = startX - endX
        
        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            this.nextSlide()
          } else {
            this.prevSlide()
          }
        }
      })
    }

    // Back to top scroll event
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    window.removeEventListener('scroll', this.handleScroll)
  }
}
</script>
 
<style scoped>
.back-to-top {
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  z-index: 1000;
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  opacity: 1;
  pointer-events: auto;
  transition: opacity 0.3s;
}
.back-to-top svg {
  display: block;
  box-shadow: 0 4px 16px rgba(194,0,0,0.18);
  border-radius: 50%;
}
</style>
