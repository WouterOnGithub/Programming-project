<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <aside class="sidebar-nav">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <i class="fas fa-graduation-cap"></i>
        </div>
        <div>
          <h1 class="sidebar-title">StudentMatch</h1>
          <p class="sidebar-subtitle">Student Dashboard</p>
        </div>
      </div>
      <nav class="sidebar-menu">
        <router-link v-for="item in navigation" :key="item.name" :to="item.href" :class="['sidebar-link', $route.path === item.href ? 'active' : '']">
          <i :class="item.icon"></i>
          {{ item.name }}
        </router-link>
      </nav>
      <div class="sidebar-user">
        <div class="sidebar-user-avatar">
          <i class="fas fa-user"></i>
        </div>
        <div>
          <p class="sidebar-user-name">{{ userData?.name || 'Gebruiker' }}</p>
          <p class="sidebar-user-role">Student</p>
        </div>
      </div>
    </aside>
    <!-- Main Content -->
    <main class="dashboard-main">
      <!-- Header -->
      <header class="dashboard-header">
        <div>
          <h1>Welkom terug, {{ userData?.name || 'Gebruiker' }}!</h1>
          <p>Hier is je job swiping overzicht</p>
        </div>
        <div class="dashboard-header-actions">
          <div class="dashboard-search">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="Zoeken..." />
          </div>
          <button class="dashboard-bell">
            <i class="fas fa-bell"></i>
            <span class="dashboard-bell-dot"></span>
          </button>
          <div class="dashboard-profile-avatar">{{ userData?.name?.[0] || 'G' }}</div>
        </div>
      </header>
      <!-- Swiping Content -->
      <div class="swiping-content">
        <div v-if="currentJob" class="job-card-container">
          <div class="job-card" :class="{ 'animate-reject': animateReject, 'animate-accept': animateAccept }">
            <div class="left-section">
              <div class="company-logo">{{ currentJob.company }}</div>
              <h1 class="company-name">{{ currentJob.company }}</h1>
              <h2 class="job-title">{{ currentJob.title }}</h2>
              <div class="location">{{ currentJob.location }}</div>
              <span class="stage-badge">{{ currentJob.type }}</span>

              <div class="linkedin-section">
                <a :href="currentJob.linkedinUrl" target="_blank" class="linkedin-link">Bekijk op LinkedIn</a>
              </div>
            </div>

            <div class="right-section">
              <div class="content-area">
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
                  Niet interessant
                </button>
                <button class="action-btn accept-btn" @click="acceptJob">
                  <span class="btn-icon">♥</span>
                  Interessant!
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
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { db, auth } from '../../firebase/config';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: 'fas fa-chart-pie' },
  { name: 'Job Swiping', href: '/swipe', icon: 'fas fa-heart' },
  { name: 'Afspraken', href: '/appointments', icon: 'fas fa-calendar' },
  { name: 'Profiel', href: '/profile', icon: 'fas fa-user' },
  { name: 'Instellingen', href: '/SettingsStu', icon: 'fas fa-cog' },
];
const userData = ref({ name: 'imad' }); // Dummy data, vervang door echte user info indien nodig

export default {
  name: 'JobSwiping',
  setup() {
    const animateReject = ref(false);
    const animateAccept = ref(false);

    const jobs = ref([]);
    const loading = ref(true);
    const error = ref(null);

    const loadCompanies = async () => {
      try {
        loading.value = true;
        const companiesSnap = await getDocs(collection(db, 'bedrijf'));
        jobs.value = companiesSnap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            company: data.bedrijfsnaam || 'Onbekend',
            title: data.opZoekNaar || 'Stageplaats',
            location: data.gesitueerdIn || '-',
            type: data.gesprekDuur || 'Stage',
            description: data.overOns || 'Geen beschrijving beschikbaar',
            duration: data.gesprekDuur ? `${data.gesprekDuur} min` : '10 min',
            schedule: data.starttijd && data.eindtijd ? `${data.starttijd} - ${data.eindtijd}` : '-',
            skills: data.skills || [],
            linkedinUrl: data.linkedin || '#',
            logo: data.foto || null
          };
        });
      } catch (err) {
        error.value = 'Fout bij laden van bedrijven';
      } finally {
        loading.value = false;
      }
    };

    onMounted(loadCompanies);

    const currentJob = computed(() => jobs.value[0]);

    const nextJob = () => {
      jobs.value.shift();
      animateReject.value = false;
      animateAccept.value = false;
    };

    const rejectJob = () => {
      animateReject.value = true;
      setTimeout(() => {
        nextJob();
      }, 300);
    };

    const acceptJob = async () => {
      animateAccept.value = true;
      // Like opslaan in Firestore
      try {
        let studentId = null;
        if (auth.currentUser) {
          studentId = auth.currentUser.uid;
        } else {
          // fallback: probeer user te detecteren
          await new Promise(resolve => onAuthStateChanged(auth, user => { studentId = user?.uid; resolve(); }));
        }
        if (studentId && currentJob.value) {
          await addDoc(collection(db, 'matches'), {
            studentId,
            companyId: currentJob.value.id,
            companyName: currentJob.value.company,
            createdAt: serverTimestamp(),
            status: 'pending'
          });
        }
      } catch (err) {
        console.error('Fout bij opslaan van like/match:', err);
      }
      setTimeout(() => {
        nextJob();
      }, 300);
    };

    return {
      animateReject,
      animateAccept,
      currentJob,
      rejectJob,
      acceptJob,
      navigation,
      userData,
      loading,
      error
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
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
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
  background: #fff;
  border-radius: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
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

.stage-badge {
  display: inline-block;
  background: linear-gradient(135deg, #fef5e7 0%, #f6e05e 100%);
  color: #744210;
  padding: 8px 20px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(246, 224, 94, 0.3);
  margin-bottom: 20px;
}

.linkedin-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #0077b5;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  padding: 8px 15px;
  border-radius: 12px;
  background: rgba(0, 119, 181, 0.1);
}

.linkedin-link:hover {
  color: #005885;
  transform: translateY(-2px);
  background: rgba(0, 119, 181, 0.15);
}

.linkedin-link::before {
  content: "\1F4BC";
  font-size: 20px;
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
  flex: 1;
  padding: 16px 24px;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
  min-height: 60px;
  border: 2px solid transparent;
}

.reject-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: white;
  box-shadow: 0 10px 40px rgba(255, 107, 107, 0.4);
}

.accept-btn {
  background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
  color: white;
  box-shadow: 0 10px 40px rgba(81, 207, 102, 0.4);
}
</style>
