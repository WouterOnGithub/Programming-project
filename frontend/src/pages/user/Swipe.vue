<template>
  <StudentDashboardLayout>
    <!-- Alleen de main content van de swipepagina, zonder sidebar/header -->
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
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { db, auth } from '../../firebase/config';
import {
  collection,
  getDocs,
  setDoc,
  doc,
  serverTimestamp,
  getDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import StudentDashboardLayout from '../../components/StudentDashboardLayout.vue';
import { notificationService } from '../../services/notificationService';
import { useToast } from 'vue-toastification';

export default {
  name: 'JobSwiping',
  components: {
    StudentDashboardLayout
  },
  setup() {
    const toast = useToast();
    const animateReject = ref(false);
    const animateAccept = ref(false);
    const jobs = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const currentUser = ref(null);
    const router = useRouter();

    const viewProfile = (bedrijfId) => {
      if (bedrijfId) {
        router.push({ name: 'BedrijfProfielVoorStudent', params: { id: bedrijfId } });
      } else {
        console.error('No company ID provided to viewProfile function');
        toast.error('Fout: geen bedrijf gevonden.');
      }
    };

    const handleSwipe = async (collectionName, job, data) => {
      if (!currentUser.value?.uid || !job?.id) {
        console.error("Kan niet swipen: gebruiker of job niet gevonden.", {
          uid: currentUser.value?.uid,
          jobId: job?.id
        });
        error.value = `Kon actie niet verwerken. Probeer opnieuw in te loggen.`;
        toast.error("Je moet ingelogd zijn om deze actie uit te voeren.");
        return;
      }

      const { uid: studentId } = currentUser.value;
      const { id: bedrijfId } = job;

      try {
        const docRef = doc(db, 'student', studentId, collectionName, bedrijfId);
        await setDoc(docRef, data);

        if (collectionName === 'favorieten') {
          toast.success("Toegevoegd aan favorieten!");
        } else if (data.status === 'niet_interessant') {
          toast.info("Job afgewezen.");
        }
      } catch (e) {
        console.error(`Fout bij opslaan van ${collectionName}:`, e);
        error.value = `Kon actie niet verwerken. Probeer opnieuw.`;
        toast.error("Actie mislukt. Probeer opnieuw.");
      }
    };

    const loadInitialData = async (user) => {
      if (!user) {
        loading.value = false;
        error.value = "Geen gebruiker gevonden. Log in om te swipen.";
        toast.error("Geen gebruiker gevonden. Log in om te swipen.");
        return;
      }
    
      currentUser.value = user;
      const studentId = user.uid;
      loading.value = true;
      error.value = null;
    
      try {
        // Haal alle bestaande swipe-gerelateerde subcollecties op
        const getIdsFromSubcollection = async (subcollectionName) => {
          const subcollectionRef = collection(db, 'student', studentId, subcollectionName);
          const snapshot = await getDocs(subcollectionRef);
          return snapshot.docs.map(doc => doc.id);
        };
    
        const swipedIds = new Set(await getIdsFromSubcollection('swipes'));
        const favorietIds = new Set(await getIdsFromSubcollection('favorieten'));
        const matchIds = new Set(await getIdsFromSubcollection('matches'));
        const nietGeinteresseerdIds = new Set(await getIdsFromSubcollection('niet_geinteresseerd'));
    
        // Haal alle goedgekeurde bedrijven op
        const q = query(collection(db, 'bedrijf'), where('verificatieStatus', '==', 'goedgekeurd'));
        const companiesSnap = await getDocs(q);
    
        if (companiesSnap.empty) {
          console.log("Geen goedgekeurde bedrijven gevonden in de database.");
          jobs.value = [];
        } else {
          jobs.value = companiesSnap.docs
            .filter(doc =>
              !swipedIds.has(doc.id) &&
              !favorietIds.has(doc.id) &&
              !matchIds.has(doc.id) &&
              !nietGeinteresseerdIds.has(doc.id)
            )
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
              logo: doc.data().foto || null,
            }));
        }
    
      } catch (err) {
        console.error("Fout bij laden van bedrijven:", err);
        error.value = 'Fout bij laden van bedrijven.';
        toast.error('Fout bij laden van bedrijven. Probeer later opnieuw.');
        jobs.value = [];
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
          toast.error("Je bent uitgelogd. Log opnieuw in om te swipen.");
        }
      });
    });

    const currentJob = computed(() => jobs.value[0]);

    const nextJob = () => {
      setTimeout(() => {
        jobs.value.shift();
        animateReject.value = false;
        animateAccept.value = false;
      }, 300);
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

    const acceptJob = async () => {
      animateAccept.value = true;

      try {
        await handleSwipe('swipes', currentJob.value, {
          bedrijfUid: currentJob.value.id,
          status: 'interessant',
          timestamp: serverTimestamp()
        });

        const studentId = currentUser.value?.uid;
        const studentDoc = await getDoc(doc(db, 'student', studentId));
        const studentData = studentDoc.exists() ? studentDoc.data() : {};
        const studentName = `${studentData.voornaam || 'Onbekende'} ${studentData.achternaam || 'Student'}`;

        await notificationService.createCompanyNewMatchNotification(
          currentJob.value.id,
          studentName
        );

        toast.success("Je hebt een match! 🎉");
        nextJob();
      } catch (error) {
        console.error('Fout bij accepteren van job:', error);
        toast.error("Fout bij het verwerken van je match. Probeer opnieuw.");
        nextJob();
      }
    };

    const favoriteJob = () => {
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
      viewProfile
    };
  }
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

@media (max-width: 960px) {
  .job-card {
    flex-direction: column;
  }

  .left-section,
  .right-section {
    min-width: unset;
  }
}

@media (max-width: 768px) {
  .swiping-content {
    min-height: auto;
    padding: 1rem;
  }

  .job-card-container {
    margin-top: 0;
    min-height: auto;
  }

  .left-section,
  .right-section {
    padding: 20px;
  }

  .company-name {
    font-size: 24px;
    margin-top: 15px;
  }

  .job-title {
    font-size: 20px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }

  .action-btn {
    max-width: 100%;
  }

  .favorite-btn {
    top: 15px;
    right: 15px;
    width: 45px;
    height: 45px;
  }
}
</style>
