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
        <!-- Titel en ondertitel -->
        <div class="companies-header">
          <h2 class="section-title">Deelnemende bedrijven</h2>
          <p class="section-subtitle">
            Ontdek de innovatieve bedrijven die deelnemen aan Career Launch 2026
          </p>
        </div>

        <!-- Zoekveld + toggle -->
        <div class="companies-controls">
          <div class="search-with-toggle">
            <div class="search-container">
              <input
                v-model="companySearch"
                type="text"
                placeholder="Zoek bedrijf..."
                class="search-input"
                aria-label="Zoek naar een bedrijf"
              />
              <span class="search-icon">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
            </div>

            <div class="view-toggle" role="group" aria-label="Wissel tussen carousel en grid-weergave">
              <button
                class="toggle-btn"
                :class="{ active: !showAllCompanies }"
                @click="showAllCompanies = false"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="6" width="18" height="4" rx="2" />
                  <rect x="3" y="14" width="18" height="4" rx="2" />
                </svg>
                Carousel
              </button>
              <button
                class="toggle-btn"
                :class="{ active: showAllCompanies }"
                @click="showAllCompanies = true"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                Grid
              </button>
            </div>
          </div>
        </div>

       <!-- Carousel weergave -->
<div v-if="!showAllCompanies" class="carousel-section">
  <div class="carousel-main-container">
    <div class="carousel-container">
      <button
        class="carousel-nav carousel-nav-prev"
        @click="prevSlide"
        :disabled="currentSlide === 0"
        :class="{ disabled: currentSlide === 0 }"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15,18 9,12 15,6"></polyline>
        </svg>
      </button>

      <div class="carousel-wrapper">
        <div class="carousel-track" ref="carousel" :style="carouselStyle">
      <a
        class="company-card-carousel"
        v-for="company in filteredCompanies"
        :key="company.id"
        :href="company.linkedin"
        target="_blank"
        rel="noopener"
      >
        <div class="company-logo-container">
          <img :src="company.foto" :alt="company.naam" class="company-logo" />
        </div>
        <div class="company-details">
          <h3 class="company-name">{{ company.naam }}</h3>
        </div>
      </a>

        </div>
      </div>

      <button
        class="carousel-nav carousel-nav-next"
        @click="nextSlide"
        :disabled="currentSlide >= maxSlide"
        :class="{ disabled: currentSlide >= maxSlide }"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9,18 15,12 9,6"></polyline>
        </svg>
      </button>
    </div>

    <div class="carousel-indicators" v-if="filteredCompanies.length > slidesToShow">
      <button
        v-for="(page, index) in totalPages"
        :key="index"
        class="carousel-dot"
        :class="{ active: currentPage === index + 1 }"
        @click="goToSlide(index)"
      ></button>
    </div>

    <div class="carousel-info">
      <span class="carousel-counter">
        Pagina {{ currentPage }} van {{ totalPages }}
      </span>
    </div>
  </div>
</div>

<!-- Grid weergave -->
<div v-else class="carousel-section">
  <div class="carousel-main-container">
    <div class="all-companies-grid">
      <a
        class="company-card"
        v-for="company in filteredCompanies"
        :key="company.id"
        :href="company.linkedin"
        target="_blank"
        rel="noopener"
      >
        <div class="company-logo company-logo--grid">
          <img :src="company.foto" :alt="company.naam" class="company-logo-img" />
        </div>
        <span class="company-name">{{ company.naam }}</span>
      </a>
    </div>
  </div>
</div>

      </div>
    </section>
  </div>
</template>

<script>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '../../components/Navbar.vue'
import '../../css/Home.css'
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'
import { useToast } from 'vue-toastification'

export default {
  name: 'Homepage',
  components: { Navbar },
  setup() {

    const toast = useToast()

    const router = useRouter()

    const db = getFirestore()
    const bedrijven = ref([])
    const loading = ref(true)
    const error = ref(null)
    const showAllCompanies = ref(false)
    const companySearch = ref('')
    const currentSlide = ref(0)
    const slidesToShow = ref(5)

    const goToRegister = () => {
      router.push('/register')
    }

    const fetchBedrijven = async () => {
      try {
        const bedrijvenRef = collection(db, 'bedrijf')
        const q = query(bedrijvenRef, where('verificatieStatus', '==', 'goedgekeurd'))
        const snapshot = await getDocs(q)

        bedrijven.value = snapshot.docs.map(doc => ({
          id: doc.id,
          naam: doc.data().bedrijfsnaam,
          foto: doc.data().foto,
          linkedin: doc.data().linkedin
        }))
      } catch (err) {
        error.value = 'Fout bij ophalen van bedrijven.'
        console.error(err)
        toast.error('Er ging iets mis bij het laden van de bedrijven.')
      } finally {
        loading.value = false
      }
    }

    const filteredCompanies = computed(() => {
      return bedrijven.value.filter(c =>
        c.naam.toLowerCase().includes(companySearch.value.toLowerCase())
      )
    })

    const maxSlide = computed(() => Math.max(0, filteredCompanies.value.length - slidesToShow.value))
    const carouselStyle = computed(() => ({
      transform: `translateX(-${currentSlide.value * (100 / slidesToShow.value)}%)`,
      transition: 'transform 0.4s ease'
    }))
    const totalPages = computed(() =>
      Math.ceil(filteredCompanies.value.length / slidesToShow.value)
    )
    const currentPage = computed(() =>
      Math.floor(currentSlide.value / slidesToShow.value) + 1
    )

    const nextSlide = () => {
      if (currentSlide.value < maxSlide.value) {
        currentSlide.value = Math.min(currentSlide.value + slidesToShow.value, maxSlide.value)
      }
    }

    const prevSlide = () => {
      if (currentSlide.value > 0) {
        currentSlide.value = Math.max(currentSlide.value - slidesToShow.value, 0)
      }
    }

    const goToSlide = (index) => {
      currentSlide.value = Math.min(index * slidesToShow.value, maxSlide.value)
    }

    onMounted(() => {
      fetchBedrijven()
    })

    return {
      goToRegister,
      showAllCompanies,
      bedrijven,
      filteredCompanies,
      companySearch,
      currentSlide,
      slidesToShow,
      carouselStyle,
      maxSlide,
      totalPages,
      currentPage,
      nextSlide,
      prevSlide,
      goToSlide,
      loading,
      error
    }
  }
}
</script>

<style scoped>
/***** Bedrijven Header *****/
.companies-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.125rem;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/***** Zoek en toggle *****/
.search-with-toggle {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  align-items: center;
  gap: 2rem;
}


.search-container {
  position: relative;
  max-width: 350px;
  width: 100%;
}


.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #c20000;
  box-shadow: 0 0 0 3px rgba(194, 0, 0, 0.1);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}

.view-toggle {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  transition: all 0.2s ease;
}

.toggle-btn.active {
  background: #c20000;
  color: white;
}

.toggle-btn:hover:not(.active) {
  background: #f1f5f9;
  color: #1e293b;
}

/***** Carousel *****/
.carousel-section {
  padding: 3rem 0 2rem;
  overflow: visible;
}

.carousel-main-container {
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: visible;
}

.carousel-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.carousel-wrapper {
  overflow: hidden;
  flex: 1;
  margin: 0 3rem;
  position: relative;
  padding-top: 1rem;
}

.carousel-track {
  display: flex;
  transition: transform 0.4s ease;
  will-change: transform;
}

.company-card-carousel {
  flex: 0 0 calc(100% / 5);
  padding: 0 0.75rem;
  text-decoration: none;
  box-sizing: border-box;
  display: block;
}

.company-logo-container {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.2rem;
  margin: 0.5rem 0 1rem;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.company-card-carousel:hover .company-logo-container {
  background: white;
  border-color: #c20000;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(194, 0, 0, 0.12);
}

.company-logo-carousel {
  max-width: 100%;
  max-height: 80px;
  object-fit: contain;
}

.company-details {
  text-align: center;
}

.company-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, background 0.3s ease;
}

.carousel-nav-prev {
  left: 0;
}

.carousel-nav-next {
  right: 0;
}

.carousel-nav:hover:not(.disabled) {
  background: #c20000;
  color: white;
  transform: translateY(-50%) scale(1.05);
}

.carousel-nav.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.carousel-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #cbd5e1;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.3s ease;
}

.carousel-dot.active {
  background: #c20000;
  transform: scale(1.2);
}

.carousel-dot:hover {
  background: #94a3b8;
}

.carousel-info {
  text-align: center;
  margin-top: 1rem;
}

.carousel-counter {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

/***** Grid view *****/
.all-companies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.company-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.2s ease;
  display: block;
  text-decoration: none;
  color: inherit;
}

.company-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
}

.company-logo--grid {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  border-radius: 12px;
  margin-bottom: 1rem;
  padding: 1rem;
  aspect-ratio: 1;
  width: 100%;
  box-sizing: border-box;
}

.company-logo-img {
  max-height: 60px;
  max-width: 100%;
  object-fit: contain;
  display: block;
}

/***** Responsive tweaks *****/
@media (max-width: 992px) {
  .company-card-carousel {
    flex: 0 0 calc(100% / 3);
  }
}

@media (max-width: 768px) {
  .company-card-carousel {
    flex: 0 0 calc(100% / 2);
  }

  .carousel-nav {
    width: 40px;
    height: 40px;
  }

  .carousel-wrapper {
    margin: 0 1.5rem;
  }
}

@media (max-width: 576px) {
  .company-card-carousel {
    flex: 0 0 100%;
  }

  .carousel-main-container {
    padding: 1rem;
    border-radius: 16px;
  }

  .carousel-wrapper {
    margin: 0 1rem;
  }

  .search-with-toggle {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
