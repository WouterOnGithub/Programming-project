<template>
  <StudentDashboardLayout>
    <!-- Mobile-only header -->
    <header class="mobile-header">
      <img src="/Images/ehb-logo.png" alt="EhB Logo" class="mobile-logo" />
      <button @click="toggleMobileSidebar" class="hamburger-menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>

    <!-- Mobile-only welcome banner -->
    <section class="welcome-banner-mobile">
      <div class="welcome-text">
        <h1 class="welcome-title">Welkom, {{ studentData.name }}!</h1>
        <p class="welcome-subtitle">Hier is je dashboard overzicht</p>
      </div>
      <div class="welcome-avatar" @click="handleAvatarClick">
        <img v-if="studentData.foto" :src="studentData.foto" alt="Profielfoto" class="avatar-img" />
        <span v-else>{{ studentData.name ? studentData.name.charAt(0) : 'G' }}</span>
      </div>
      <div v-if="showDropdown" id="mobile-profile-dropdown" class="profile-dropdown-mobile">
        <button class="dropdown-item" @click="goToProfile">Profiel</button>
        <button class="dropdown-item" @click="handleLogout">Uitloggen</button>
      </div>
    </section>

    <!-- Main Content -->
    <main class="dashboard-main">
      <!-- Swiping Content -->
      <div class="swiping-content">
        <div v-if="currentJob" class="job-card-container">
          <div class="job-card" :class="{ 'animate-reject': animateReject, 'animate-accept': animateAccept }">
            <button class="action-btn favorite-btn" @click="favoriteJob">
              <span class="btn-icon">★</span>
            </button>
            <div class="left-section">
              <div class="company-logo">{{ currentJob.company }}</div>
              <h1 class="company-name">{{ currentJob.company }}</h1>
              <h2 class="job-title">{{ currentJob.title }}</h2>
              <div class="location">{{ currentJob.location }}</div>

              <div class="links-section">
                <a :href="currentJob.linkedinUrl" target="_blank" class="linkedin-link">Bekijk op LinkedIn</a>
                <button @click="viewProfile(currentJob.id)" class="view-more-btn">View More</button>
              </div>
            </div>

            <div class="right-section">
              <div class="content-area">
                <h3 class="intro-title">Introductie</h3>
                <p class="description">{{ currentJob.description }}</p>

                <div class="job-details">
                  <div class="detail-item">
                    <span class="detail-icon">⏱️</span>
                    <span class="detail-text">{{ currentJob.duration }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-icon">🏢</span>
                    <span class="detail-text">{{ currentJob.schedule }}</span>
                  </div>
                </div>

                <div class="tags">
                  <span
                    v-for="skill in currentJob.skills"
                    :key="skill"
                    class="tag"
                    :class="skill.toLowerCase()"
                  >{{ skill }}</span>
                </div>
              </div>

              <div class="action-buttons">
                <button class="action-btn reject-btn" @click="rejectJob">
                  <span class="btn-icon">✕</span>
                  No match
                </button>
                <button class="action-btn accept-btn" @click="acceptJob">
                  Match
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="loading">
          <p>Bedrijven laden...</p>
        </div>
        <div v-else>
          <p>Geen bedrijven meer om te swipen!</p>
        </div>
      </div>
    </main>
  </StudentDashboardLayout>
  
  <!-- Mobile-only sidebar -->
  <aside class="mobile-sidebar" :class="{ 'is-open': isMobileSidebarOpen }">
    <div class="mobile-sidebar-header">
      <button @click="toggleMobileSidebar" class="close-sidebar-btn">
        <span></span>
        <span></span>
      </button>
      <div class="sidebar-header-content">
        <img src="/Images/ehb-logo.png" alt="EhB Logo" class="sidebar-header-logo" />
        <div class="sidebar-header-text">
          <h3>StudentMatch</h3>
          <p>Studentdashboard</p>
        </div>
      </div>
    </div>
    <nav class="mobile-nav">
      <router-link v-for="item in navigation" :key="item.name" :to="item.href" class="mobile-nav-link" :class="{ 'active-link': $route.path === item.href }">
        <span>{{ item.name }}</span>
      </router-link>
    </nav>
  </aside>
  <div v-if="isMobileSidebarOpen" @click="toggleMobileSidebar" class="sidebar-overlay"></div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { db, auth } from '../../firebase/config';
import { collection, getDocs, setDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import StudentDashboardLayout from '../../components/StudentDashboardLayout.vue'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: 'fas fa-chart-pie' },
  { name: 'Job Swiping', href: '/swipe', icon: 'fas fa-heart' },
  { name: 'Afspraken', href: '/appointments', icon: 'fas fa-calendar' },
  { name: 'Favorieten', href: '/Favorietenst', icon: 'fas fa-star' },
  { name: 'Matches', href: '/stmatch', icon: 'fas fa-check-double' },
  { name: 'Profiel', href: '/profile', icon: 'fas fa-user' },
  { name: 'Instellingen', href: '/SettingsStu', icon: 'fas fa-cog' },
];

export default {
  name: 'JobSwiping',
  components: {
    StudentDashboardLayout
  },
  setup() {
    const animateReject = ref(false);
    const animateAccept = ref(false);
    const jobs = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const currentUser = ref(null);
    const router = useRouter();
    const isMobileSidebarOpen = ref(false);
    const showDropdown = ref(false);

    const studentData = ref({
      name: 'Gebruiker',
      foto: null,
    });

    const toggleMobileSidebar = () => {
      isMobileSidebarOpen.value = !isMobileSidebarOpen.value;
    };

    const handleAvatarClick = () => {
      showDropdown.value = !showDropdown.value;
    };

    const handleLogout = () => {
      router.push('/');
    };

    const goToProfile = () => {
      router.push('/WeergaveSt');
    };

    const handleClickOutside = (event) => {
      const dropdown = document.getElementById('mobile-profile-dropdown');
      const avatar = document.querySelector('.welcome-avatar');
      if (dropdown && !dropdown.contains(event.target) && avatar && !avatar.contains(event.target)) {
        showDropdown.value = false;
      }
    };

    const viewProfile = (bedrijfId) => {
      if (bedrijfId) {
        router.push({ name: 'BedrijfProfielVoorStudent', params: { id: bedrijfId } });
      } else {
        console.error('No company ID provided to viewProfile function');
      }
    };

    const handleSwipe = async (collectionName, job, data) => {
      if (!currentUser.value?.uid || !job?.id) {
        console.error("Kan niet swipen: gebruiker of job niet gevonden.", { uid: currentUser.value?.uid, jobId: job?.id });
        error.value = `Kon actie niet verwerken. Probeer opnieuw in te loggen.`;
        return;
      }
      const { uid: studentId } = currentUser.value;
      const { id: bedrijfId } = job;

      try {
        const docRef = doc(db, 'student', studentId, collectionName, bedrijfId);
        await setDoc(docRef, data);
      } catch (e) {
        console.error(`Fout bij opslaan van ${collectionName}:`, e);
        error.value = `Kon actie niet verwerken. Probeer opnieuw.`;
      }
    };

    const loadInitialData = async (user) => {
      if (!user) {
        loading.value = false;
        error.value = "Geen gebruiker gevonden. Log in om te swipen.";
        return;
      }
      currentUser.value = user;
      const studentId = user.uid;

      try {
        loading.value = true;
        
        // Fetch student data for mobile banner
        const studentDocRef = doc(db, 'student', studentId);
        const studentDocSnap = await getDoc(studentDocRef);
        if (studentDocSnap.exists()) {
          const data = studentDocSnap.data();
          studentData.value.name = data.voornaam ? `${data.voornaam} ${data.achternaam || ''}`.trim() : 'Gebruiker';
          studentData.value.foto = data.foto || null;
        }

        const swipedIds = new Set();
        
        const swipesSnap = await getDocs(collection(db, 'student', studentId, 'swipes'));
        swipesSnap.forEach(doc => swipedIds.add(doc.id));
        
        const favSnap = await getDocs(collection(db, 'student', studentId, 'favorieten'));
        favSnap.forEach(doc => swipedIds.add(doc.id));

        const companiesSnap = await getDocs(collection(db, 'bedrijf'));
        jobs.value = companiesSnap.docs
          .map(doc => ({
            id: doc.id,
            bedrijfUid: doc.id,
            company: doc.data().bedrijfsnaam || 'Onbekend',
            title: Array.isArray(doc.data().opZoekNaar) ? doc.data().opZoekNaar.join(', ') : (doc.data().opZoekNaar || 'Stageplaats'),
            location: doc.data().gesitueerdIn || '-',
            type: doc.data().gesprekDuur || 'Stage',
            description: doc.data().overOns || 'Geen beschrijving beschikbaar',
            duration: doc.data().gesprekDuur ? `${doc.data().gesprekDuur} min` : '10 min',
            schedule: doc.data().starttijd && doc.data().eindtijd ? `${doc.data().starttijd} - ${doc.data().eindtijd}` : '-',
            skills: doc.data().skills || [],
            linkedinUrl: doc.data().linkedin || '#',
            logo: doc.data().foto || null
          }))
          .filter(job => !swipedIds.has(job.bedrijfUid));
      } catch (err) {
        console.error("Fout bij laden van bedrijven:", err);
        error.value = 'Fout bij laden van bedrijven.';
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          loadInitialData(user);
        } else {
          currentUser.value = null;
          loading.value = false;
          jobs.value = [];
          error.value = "Log in om bedrijven te swipen.";
        }
      });
      if (typeof window !== 'undefined') {
        window.addEventListener('mousedown', handleClickOutside);
      }
    });

    onBeforeUnmount(() => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousedown', handleClickOutside);
      }
    });

    const currentJob = computed(() => jobs.value[0]);

    const nextJob = () => {
      setTimeout(() => {
        jobs.value.shift();
        animateReject.value = false;
        animateAccept.value = false;
      }, 300); // Wacht tot animatie klaar is
    };

    const rejectJob = () => {
      animateReject.value = true;
      handleSwipe('swipes', currentJob.value, {
        bedrijfUid: currentJob.value.id,
        status: 'niet_interessant',
        timestamp: serverTimestamp()
      });
      nextJob();
    };

    const acceptJob = () => {
      animateAccept.value = true;
      handleSwipe('swipes', currentJob.value, {
        bedrijfUid: currentJob.value.id,
        status: 'interessant',
        timestamp: serverTimestamp()
      });
      nextJob();
    };

    const favoriteJob = () => {
      // Optioneel: animatie voor favoriet
      handleSwipe('favorieten', currentJob.value, {
        bedrijfUid: currentJob.value.id,
        timestamp: serverTimestamp()
      });
      nextJob();
    };

    return {
      animateReject,
      animateAccept,
      currentJob,
      rejectJob,
      acceptJob,
      favoriteJob,
      navigation,
      loading,
      error,
      viewProfile,
      isMobileSidebarOpen,
      toggleMobileSidebar,
      studentData,
      showDropdown,
      handleAvatarClick,
      handleLogout,
      goToProfile
    };
  },
};
</script>

<style scoped>
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
}
.sidebar-nav {
  width: 16rem;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 1rem 1rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}
.sidebar-logo {
  width: 2rem;
  height: 2rem;
  background: #c20000;
  color: #fff;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}
.sidebar-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
}
.sidebar-subtitle {
  font-size: 0.8rem;
  color: #6b7280;
}
.sidebar-menu {
  flex: 1;
  padding: 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  color: #6b7280;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
}
.sidebar-link.active, .sidebar-link:hover {
  background: #f3f4f6;
  color: #c20000;
}
.sidebar-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}
.sidebar-user-avatar {
  width: 2rem;
  height: 2rem;
  background: #c20000;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}
.sidebar-user-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
}
.sidebar-user-role {
  font-size: 0.8rem;
  color: #6b7280;
}
.dashboard-main {
  padding: 1rem;
  height: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem 2rem 1.5rem 2rem;
}
.dashboard-header h1 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #c20000;
}
.dashboard-header p {
  color: #6b7280;
  font-size: 0.95rem;
}
.dashboard-header-actions {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}
.dashboard-search {
  position: relative;
  display: flex;
  align-items: center;
  background: #f3f4f6;
  border-radius: 0.5rem;
  padding: 0.2rem 0.7rem;
}
.dashboard-search i {
  color: #6b7280;
  margin-right: 0.5rem;
}
.dashboard-search input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.95rem;
  color: #111827;
  width: 8rem;
}
.dashboard-bell {
  background: #f3f4f6;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem;
  position: relative;
  cursor: pointer;
}
.dashboard-bell-dot {
  position: absolute;
  top: 0.3rem;
  right: 0.3rem;
  width: 0.6rem;
  height: 0.6rem;
  background: #ef4444;
  border-radius: 50%;
}
.dashboard-profile-avatar {
  width: 2rem;
  height: 2rem;
  background: #c20000;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
}
.swiping-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 600px;
  background: transparent;
}
.job-card-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 600px;
}
.job-card-container {
  max-width: 900px;
  width: 100%;
  perspective: 1000px;
  position: relative;
  margin-top: 2rem;
}

.job-card {
  position: relative;
  background: #ffffff;
  border-radius: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.07);
  overflow: hidden;
  transition: all 0.3s ease;
  transform-style: preserve-3d;
  display: flex;
  flex-direction: row;
  padding-top: 20px;
}

.left-section {
  background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(248,249,250,0.1));
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex: 1;
  min-width: 280px;
}

.right-section {
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: rgba(255,255,255,0.05);
  flex: 2;
}

.company-logo {
  width: 80px;
  height: 80px;
  border: 3px solid #e53e3e;
  border-radius: 50%;
  margin: 0 auto 15px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  box-shadow: 0 5px 15px rgba(229, 62, 62, 0.2);
  font-weight: bold;
  color: #e53e3e;
  font-size: 1.1rem;
}

.company-name {
  font-size: 28px;
  font-weight: bold;
  color: #2d3748;
  margin-top: 30px;
}

.job-title {
  font-size: 22px;
  font-weight: 700;
  color: #e53e3e;
  margin-bottom: 10px;
}

.location {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #e53e3e;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
}

.location::before {
  content: "\1F4CD";
  font-size: 18px;
}

.links-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.linkedin-link, .view-more-btn {
  display: inline-block;
  padding: 8px 15px;
  border-radius: 20px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease-in-out;
}

.linkedin-link {
  background-color: #eef2f7;
  color: #2d64ac;
}

.linkedin-link:hover {
  background-color: #dbe4f0;
}

.view-more-btn {
  background-color: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
  cursor: pointer;
}

.view-more-btn:hover {
  background-color: #bae7ff;
}

.description {
  color: #2d3748;
  line-height: 1.6;
  font-size: 16px;
  margin-bottom: 25px;
  text-align: justify;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255,255,255,0.15);
  border-radius: 12px;
  border-left: 4px solid #e53e3e;
  margin-bottom: 10px;
}

.detail-text {
  color: #2d3748;
  font-size: 14px;
  font-weight: 500;
}

.tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 25px;
}

.tag {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: 2px solid;
  transition: all 0.3s ease;
}

.tag.it,
.tag.consulting,
.tag.communicatie {
  background: #fed7d7;
  color: #c53030;
  border-color: #feb2b2;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: auto;
}

.action-btn {
  flex-grow: 1;
  max-width: 48%;
  padding: 15px;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.favorite-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: transparent;
  color: #a0aec0;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 24px;
  box-shadow: none;
  padding: 0;
  max-width: none;
}
.favorite-btn .btn-icon {
  margin: 0;
}
.favorite-btn:hover {
  background-color: #fffbeb;
  color: #f6e05e;
  transform: translateY(-3px) scale(1.1);
  box-shadow: 0 12px 35px rgba(246, 224, 94, 0.5);
}
.reject-btn {
  background-color: #fff1f2;
  color: #e53e3e;
  border: 2px solid #fed7d7;
}
.reject-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(229, 62, 62, 0.2);
}

.accept-btn {
  background-color: #f0fff4;
  color: #38a169;
  box-shadow: 0 10px 40px rgba(81, 207, 102, 0.4);
  border: 2px solid #c6f6d5;
}
.accept-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(56, 161, 105, 0.2);
}

.intro-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
  text-align: left;
  color: #333;
}

.job-details {
  display: flex;
  flex-direction: column;
  font-weight: 500;
  line-height: 1.6;
  text-align: left;
}

.btn-icon {
  font-size: 18px;
}

/* === MOBILE RESPONSIVE STYLES === */
.mobile-header,
.welcome-banner-mobile,
.mobile-sidebar,
.sidebar-overlay {
  display: none;
}

@media (max-width: 992px) {
  .job-card {
    flex-direction: column;
    height: auto;
    max-height: 90vh;
    overflow-y: auto;
  }
  .left-section, .right-section {
    width: 100%;
    min-height: auto;
    border-right: none;
    padding: 1.5rem;
  }
  .left-section {
    border-bottom: 1px solid #e5e7eb;
  }
  .action-buttons {
    flex-direction: row;
    gap: 1rem;
  }
  .action-btn {
    width: 100%;
  }
  /* Hide desktop-specific elements from the layout component */
  :deep(.sidebar-nav),
  :deep(.dashboard-header) {
    display: none !important;
  }

  /* Show mobile-specific elements */
  .mobile-header,
  .welcome-banner-mobile,
  .mobile-sidebar {
    display: flex;
  }

  .dashboard-main {
    padding: 0;
    background-color: #f8f9fa;
  }

  .swiping-content {
    padding: 0 1.5rem 1.5rem;
  }

  .job-card-container {
    padding: 0;
    height: 100%;
    border: 1px solid #e5e7eb;
  }

  .job-card {
    border-radius: 1rem;
    box-shadow: none;
    border: 1px solid #e5e7eb;
  }

  .left-section, .right-section {
    padding: 1.25rem;
  }

  .company-logo {
    width: 60px;
    height: 60px;
    font-size: 0.9rem;
    margin-bottom: 10px;
  }

  .company-name {
    font-size: 1.5rem;
    margin-top: 1rem;
  }

  .job-title {
    font-size: 1.25rem;
  }

  .location, .description, .detail-text {
    font-size: 0.9rem;
  }

  .links-section {
    margin-top: 1rem;
  }

  .links-section .linkedin-link, .links-section .view-more-btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .detail-item {
    padding: 0.75rem 1rem;
    margin-bottom: 0.5rem;
  }

  .tags {
    margin-bottom: 1rem;
    gap: 0.5rem;
  }

  .tag {
    padding: 0.25rem 0.75rem;
    font-size: 0.7rem;
  }
  
  .action-btn {
    padding: 0.8rem;
    font-size: 0.9rem;
  }

  .favorite-btn {
    width: 40px;
    height: 40px;
    font-size: 20px;
    top: 15px;
    right: 15px;
  }

  /* Mobile Header */
  .mobile-header {
    background: #fff;
    padding: 1rem 1.5rem;
    justify-content: space-between;
    align-items: center;
    margin: 1.5rem 1.5rem 0;
    border-radius: 0.75rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }

  .mobile-logo {
    height: 42px;
  }

  .hamburger-menu {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 28px;
    height: 21px;
    z-index: 1002;
  }

  .hamburger-menu span {
    display: block;
    width: 100%;
    height: 3px;
    background-color: #c20000;
    border-radius: 2px;
  }

  /* Mobile Sidebar */
  .mobile-sidebar {
    position: fixed;
    top: 0;
    left: -280px;
    width: 280px;
    height: 100%;
    background: #fff;
    z-index: 1001;
    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    flex-direction: column;
    border-right: 1px solid #e5e7eb;
  }

  .mobile-sidebar.is-open {
    left: 0;
  }

  .mobile-sidebar-header {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .sidebar-header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .sidebar-header-logo {
    height: 36px;
  }
  
  .sidebar-header-text h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #111827;
  }
  
  .sidebar-header-text p {
    font-size: 0.9rem;
    color: #6b7280;
  }

  .close-sidebar-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    position: relative;
    align-self: flex-end;
    margin-bottom: 1rem;
  }

  .close-sidebar-btn span {
    display: block;
    position: absolute;
    width: 100%;
    height: 2.5px;
    background-color: #c20000;
    border-radius: 2px;
    top: 50%;
    left: 0;
  }

  .close-sidebar-btn span:first-child {
    transform: translateY(-50%) rotate(45deg);
  }

  .close-sidebar-btn span:last-child {
    transform: translateY(-50%) rotate(-45deg);
  }

  .mobile-nav {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .mobile-nav-link {
    padding: 0.8rem 1.2rem;
    border-radius: 0.5rem;
    color: #6b7280;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.2s, background-color 0.2s;
  }

  .mobile-nav-link:hover {
    color: #c20000;
    background-color: #f3f4f6;
  }

  .mobile-nav-link.active-link {
    background: #f3f4f6;
    color: #c20000;
    font-weight: 600;
  }

  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: none;
  }

  .mobile-sidebar.is-open + .sidebar-overlay {
    display: block;
  }

  .welcome-banner-mobile {
    background: #fff;
    padding: 1.5rem;
    justify-content: space-between;
    align-items: center;
    margin: 1rem 1.5rem;
    border-radius: 0.75rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    position: relative;
  }

  .welcome-title {
    color: #c20000;
    font-size: 1.25rem;
    font-weight: 600;
  }
  .welcome-subtitle {
    color: #6b7280;
    font-size: 0.9rem;
  }
  .welcome-avatar {
    width: 2.5rem; /* 40px */
    height: 2.5rem; /* 40px */
    border-radius: 50%;
    background: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2rem;
    font-weight: 600;
    color: #c20000;
    border: 1.5px solid #222;
    cursor: pointer;
  }
  .welcome-avatar .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    background-color: #f9fafb;
  }

  .profile-dropdown-mobile {
    position: absolute;
    top: 75px;
    right: 1.5rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    z-index: 1100;
    border: 1px solid #f3f4f6;
    width: 160px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .profile-dropdown-mobile .dropdown-item {
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    text-align: left;
    width: 100%;
    font-size: 0.95rem;
    color: #374151;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .profile-dropdown-mobile .dropdown-item:hover {
    background-color: #f9fafb;
  }
}

@media (min-width: 769px) {
  .mobile-header,
  .welcome-banner-mobile,
  .mobile-sidebar,
  .sidebar-overlay {
    display: none !important;
  }
}
</style>
