<template>
  <div class="company-detail">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Bedrijf Profiel</h1>
        <p class="page-subtitle">Gedetailleerde informatie over het bedrijf</p>
      </div>
      <div class="header-actions">
        <router-link to="/admin/companies" class="btn btn-secondary">
          <span class="btn-icon">←</span>
          Terug naar lijst
        </router-link>
        <router-link v-if="company" :to="'/admin/companies/' + company.id + '/edit'" class="btn btn-primary">
          <span class="btn-icon">✏️</span>
          Bewerken
        </router-link>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="company" class="profile-content">
      <!-- Basic Information -->
      <div class="profile-section">
        <div class="profile-header">
          <div class="company-logo">
            <img v-if="company.foto" :src="company.foto" :alt="company.bedrijfsnaam" />
            <span v-else>{{ (company.bedrijfsnaam || '?').charAt(0) }}</span>
          </div>
          <div class="company-info">
            <h2>{{ company.bedrijfsnaam || 'Onbekend' }}</h2>
            <div class="contact-info">
              <p v-if="company.email"><span class="icon">📧</span> {{ company.email }}</p>
              <p v-if="company.linkedin"><span class="icon">🔗</span> <a :href="company.linkedin" target="_blank">LinkedIn</a></p>
              <p v-if="company.gesitueerdIn"><span class="icon">📍</span> {{ company.gesitueerdIn }}</p>
              <p v-if="company.locatie"><span class="icon">🏢</span> {{ company.locatie }}</p>
            </div>
          </div>
        </div>
      </div>
      <!-- Details Section -->
      <div class="profile-section">
        <h3>Details</h3>
        <ul>
          <li><strong>Op zoek naar:</strong> {{ company.opZoekNaar }}</li>
          <li><strong>Gesprek duurt:</strong> {{ company.gesprekDuur }}</li>
          <li><strong>Aanwezig van:</strong> {{ company.starttijd }} tot {{ company.eindtijd }}</li>
          <li><strong>Over ons:</strong> {{ company.overOns }}</li>
          <li><strong>Aangemaakt op:</strong> {{ company.aangemaaktOp ? new Date(company.aangemaaktOp.seconds ? company.aangemaaktOp.seconds * 1000 : company.aangemaaktOp).toLocaleString() : '-' }}</li>
        </ul>
      </div>
    </div>
    <div v-else class="loading-message">
      Laden...
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from '../../../firebase/config'
import { getDoc, doc } from 'firebase/firestore'

export default {
  name: 'CompanyDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const company = ref(null)
    const error = ref(null)

    const loadCompany = async () => {
      try {
        const companyId = route.params.id
        const docSnap = await getDoc(doc(db, 'bedrijf', companyId))
        if (docSnap.exists()) {
          company.value = { id: docSnap.id, ...docSnap.data() }
        } else {
          throw new Error('Bedrijf niet gevonden')
        }
      } catch (err) {
        error.value = err.message
        setTimeout(() => {
          router.push('/admin/companies')
        }, 2000)
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('nl-NL')
    }

    const goBack = () => {
      router.push('/admin/companies')
    }

    onMounted(loadCompany)

    return {
      company,
      error,
      formatDate,
      goBack
    }
  }
}
</script>

<style scoped>
.company-detail {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 20px;
}

.header-content h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.header-content p {
  color: #666;
  margin: 0;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 20px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: #6c757d;
  color: #fff;
  border: none;
}

.btn-secondary:hover {
  background-color: #495057;
}

.btn-icon {
  font-size: 1.2rem;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.company-logo {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  margin-right: 1.5rem;
}

.company-logo img {
  width: 80%;
  height: 80%;
  object-fit: contain;
  display: block;
  margin: auto;
  padding: 6px;
  background: transparent;
}

.company-logo span {
  font-size: 1.6rem;
  font-weight: 700;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f3f4f6;
}

.company-info {
  flex: 1;
}

.company-info h2 {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  color: #1a1a1a;
}

.company-title {
  color: #6b7280;
  margin: 0 0 16px 0;
}

.contact-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.contact-info p {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4b5563;
}

.contact-info a {
  color: #2563eb;
  text-decoration: none;
}

.contact-info a:hover {
  text-decoration: underline;
}

.icon {
  font-size: 1.2rem;
}

.description {
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
}

.opportunities-list {
  display: grid;
  gap: 16px;
}

.opportunity-card {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 20px;
}

.opportunity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.opportunity-header h4 {
  margin: 0;
  font-size: 1.1rem;
  color: #1a1a1a;
}

.opportunity-type {
  background-color: #e5e7eb;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #4b5563;
}

.opportunity-description {
  color: #4b5563;
  margin: 0 0 16px 0;
}

.opportunity-details {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
}

.opportunity-details p {
  margin: 0;
  color: #4b5563;
}

.requirements-list {
  background-color: white;
  border-radius: 6px;
  padding: 16px;
}

.requirements-list h5 {
  margin: 0 0 8px 0;
  color: #1a1a1a;
}

.requirements-list ul {
  margin: 0;
  padding-left: 20px;
  color: #4b5563;
}

.benefits-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.benefit-tag {
  background-color: #e5e7eb;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #4b5563;
}

.contact-person {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 20px;
}

.contact-person h4 {
  margin: 0 0 4px 0;
  color: #1a1a1a;
}

.position {
  color: #6b7280;
  margin: 0 0 16px 0;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-details p {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4b5563;
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.social-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.social-link.linkedin {
  background-color: #0077b5;
  color: white;
}

.social-link.twitter {
  background-color: #1da1f2;
  color: white;
}

.social-link.facebook {
  background-color: #1877f2;
  color: white;
}

.social-link.instagram {
  background-color: #e4405f;
  color: white;
}

.social-link.behance {
  background-color: #1769ff;
  color: white;
}

.social-link:hover {
  opacity: 0.9;
}

.error-message {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.loading-message {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>

