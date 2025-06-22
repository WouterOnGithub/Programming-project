<template>
  <BedrijfDashboardLayout>
    <main class="dashboard-main" v-if="!loading && student">
      <div class="profiel-container">
        <!-- Header -->
        <div class="profiel-header">
          <div class="terug-knop-container">
            <button @click="gaTerug" class="terug-knop">&larr; Terug</button>
          </div>
          <div class="avatar-container">
            <img v-if="student.fotoUrl" :src="student.fotoUrl" alt="Profielfoto" class="avatar" />
            <div v-else class="avatar-placeholder">{{ student.voornaam?.[0] }}{{ student.achternaam?.[0] }}</div>
          </div>
          <div class="header-info">
            <h1>{{ student.voornaam }} {{ student.achternaam }}</h1>
            <p v-if="student.domein" class="domein">{{ student.domein.join(', ') }}</p>
            <div v-if="student.linkedin" class="linkedin-link">
              <a :href="student.linkedin" target="_blank">LinkedIn Profiel</a>
            </div>
          </div>
          <div class="header-acties">
            <a v-if="student.cv && student.cv.url" :href="student.cv.url" target="_blank" download class="actie-knop cv-knop">
              Download CV
            </a>
            <!-- Hier kan later een "Plan gesprek" knop komen -->
          </div>
        </div>

        <!-- Details -->
        <div class="profiel-details">
          <div class="detail-kaart">
            <h3>Over mij</h3>
            <p>{{ student.intro || 'Geen introductie opgegeven.' }}</p>
          </div>
          <div class="detail-grid">
            <div class="detail-kaart">
              <h3>Details</h3>
              <ul>
                <li><strong>Leeftijd:</strong> {{ student.leeftijd || 'N/A' }}</li>
                <li><strong>Studiejaar:</strong> {{ student.studiejaar || 'N/A' }}</li>
                <li><strong>Beschikbaar vanaf:</strong> {{ student.beschikbaarVanaf || 'N/A' }}</li>
                <li><strong>Opportuniteit:</strong> {{ student.opportuniteit || 'N/A' }}</li>
              </ul>
            </div>
            <div class="detail-kaart">
              <h3>Talenkennis</h3>
              <ul v-if="student.talenkennis && student.talenkennis.length > 0">
                <li v-for="taal in student.talenkennis" :key="taal">{{ taal }}</li>
              </ul>
              <p v-else>Geen talenkennis opgegeven.</p>
            </div>
          </div>
          <div class="detail-kaart">
            <h3>Vaardigheden (Skills)</h3>
            <div v-if="student.skills && student.skills.length > 0" class="skills-container">
              <span v-for="skill in student.skills" :key="skill" class="skill-tag">{{ skill }}</span>
            </div>
            <p v-else>Geen vaardigheden opgegeven.</p>
          </div>
        </div>
      </div>
    </main>
    <div v-if="loading" class="loading-container">Laden...</div>
    <div v-if="error" class="error-container">{{ error }}</div>
  </BedrijfDashboardLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import BedrijfDashboardLayout from '../../../components/BedrijfDashboardLayout.vue';

const route = useRoute();
const router = useRouter();
const db = getFirestore();

const student = ref(null);
const loading = ref(true);
const error = ref(null);

const gaTerug = () => {
  router.go(-1);
};

onMounted(async () => {
  const studentId = route.params.id;
  if (!studentId) {
    error.value = "Geen student ID gevonden in de URL.";
    loading.value = false;
    return;
  }

  try {
    const studentDocRef = doc(db, 'student', studentId);
    const studentSnap = await getDoc(studentDocRef);

    if (studentSnap.exists()) {
      student.value = studentSnap.data();
    } else {
      error.value = "Kon het profiel van deze student niet vinden.";
    }
  } catch (e) {
    console.error("Fout bij ophalen van studentprofiel:", e);
    error.value = "Er is een fout opgetreden bij het laden van het profiel.";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.dashboard-main {
  padding: 2rem;
  background-color: #f9fafb;
}
.profiel-container {
  max-width: 1000px;
  margin: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  overflow: hidden;
}
.profiel-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: #4a5568;
  color: white;
  position: relative;
}
.terug-knop-container {
    position: absolute;
    top: 1rem;
    left: 1rem;
}
.terug-knop {
    background: rgba(255,255,255,0.2);
    border: 1px solid white;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
}
.terug-knop:hover {
    background: rgba(255,255,255,0.4);
}
.avatar-container {
    margin-left: 8rem;
}
.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
}
.avatar-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #c20000;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
}
.header-info h1 {
  margin: 0;
  font-size: 1.8rem;
}
.header-info .domein {
  margin: 0.25rem 0 0.5rem;
  font-style: italic;
  opacity: 0.9;
}
.linkedin-link a {
  color: white;
  text-decoration: underline;
}
.header-acties {
  margin-left: auto;
}
.actie-knop {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  text-decoration: none;
  display: inline-block;
}
.cv-knop {
  background-color: #c20000;
  color: white;
}
.profiel-details {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.detail-kaart {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 6px;
}
.detail-kaart h3 {
  margin-top: 0;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}
.detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}
ul {
    list-style: none;
    padding: 0;
}
li {
    margin-bottom: 0.5rem;
}
.skills-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}
.skill-tag {
    background-color: #e2e8f0;
    color: #4a5568;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.875rem;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .dashboard-main {
    padding: 1rem;
  }

  .profiel-container {
    margin: 0;
    border-radius: 0;
  }

  .profiel-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
    padding: 1rem;
  }

  .terug-knop-container {
    position: static;
    align-self: flex-start;
    margin-bottom: 0.5rem;
  }

  .avatar-container {
    margin-left: 0;
  }

  .avatar,
  .avatar-placeholder {
    width: 80px;
    height: 80px;
    font-size: 2rem;
  }

  .header-info h1 {
    font-size: 1.5rem;
  }

  .header-acties {
    margin-left: 0;
    margin-top: 0.5rem;
  }

  .actie-knop {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }

  .profiel-details {
    padding: 1rem;
    gap: 1rem;
  }

  .detail-kaart {
    padding: 1rem;
  }

  .detail-kaart p {
    word-wrap: break-word;
  }

  .detail-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .detail-kaart h3 {
    font-size: 1.1rem;
  }

  .skills-container {
    gap: 0.4rem;
  }

  .skill-tag {
    font-size: 0.8rem;
    padding: 0.2rem 0.6rem;
  }
}
</style> 