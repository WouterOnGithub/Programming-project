<template>
  <div class="company-list">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Bedrijven Beheer</h1>
        <p class="page-subtitle">Beheer alle bedrijven in het systeem</p>
      </div>
      <div class="header-actions">
        <router-link to="/admin/companies/new" class="btn btn-primary">
          <span class="btn-icon">➕</span>
          Nieuw Bedrijf
        </router-link>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="Zoek bedrijven..."
          class="search-input"
        >
        <span class="search-icon">🔍</span>
      </div>
      
      <div class="filter-controls">
        <select v-model="filterIndustry" class="filter-select">
          <option value="">Alle branches</option>
          <option value="IT & Software">IT & Software</option>
          <option value="Marketing & Communicatie">Marketing & Communicatie</option>
          <option value="Finance & Banking">Finance & Banking</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Education">Education</option>
        </select>
        
        <select v-model="filterSize" class="filter-select">
          <option value="">Alle groottes</option>
          <option value="1-10">1-10 medewerkers</option>
          <option value="11-50">11-50 medewerkers</option>
          <option value="51-200">51-200 medewerkers</option>
          <option value="201-500">201-500 medewerkers</option>
          <option value="500+">500+ medewerkers</option>
        </select>
      </div>
    </div>

    <!-- Companies Table -->
    <div class="table-container">
      <table class="companies-table">
        <thead>
          <tr>
            <th>Bedrijf</th>
            <th>Locatie</th>
            <th>Branche</th>
            <th>Grootte</th>
            <th>Op zoek naar</th>
            <th>Acties</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="company in filteredCompanies" :key="company.id" class="company-row">
            <td class="company-info">
              <div class="company-logo">
                <img 
                  v-if="company.logoUrl" 
                  :src="company.logoUrl" 
                  :alt="company.name"
                >
                <div v-else class="no-logo">
                  <span class="logo-icon">🏢</span>
                </div>
              </div>
              <div class="company-details">
                <h4 class="company-name">{{ company.name }}</h4>
                <p class="company-website">{{ company.website }}</p>
              </div>
            </td>
            <td>{{ company.location }}</td>
            <td>
              <span class="industry-badge">{{ company.industry }}</span>
            </td>
            <td>{{ company.size }}</td>
            <td class="looking-for">{{ company.lookingFor }}</td>
            <td class="actions">
              <button 
                @click="viewCompany(company.id)" 
                class="action-btn view"
                title="Bekijken"
              >
                👁️
              </button>
              <router-link 
                :to="`/admin/companies/${company.id}/edit`" 
                class="action-btn edit"
                title="Bewerken"
              >
                ✏️
              </router-link>
              <button 
                @click="deleteCompany(company.id)" 
                class="action-btn delete"
                title="Verwijderen"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="filteredCompanies.length === 0" class="empty-state">
      <div class="empty-icon">🏢</div>
      <h3>Geen bedrijven gevonden</h3>
      <p>Er zijn geen bedrijven die voldoen aan je zoekcriteria.</p>
    </div>
  </div>
</template>

<script>
import { db } from '../../../firebase/config'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'

export default {
  name: 'CompanyList',
  data() {
    return {
      searchQuery: '',
      filterIndustry: '',
      filterSize: '',
      companies: []
    }
  },
  async mounted() {
    await this.loadCompanies()
  },
  computed: {
    filteredCompanies() {
      let filtered = this.companies;
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(company => 
          company.name.toLowerCase().includes(query) ||
          company.location.toLowerCase().includes(query) ||
          company.industry.toLowerCase().includes(query) ||
          company.lookingFor.toLowerCase().includes(query)
        );
      }
      
      if (this.filterIndustry) {
        filtered = filtered.filter(company => company.industry === this.filterIndustry);
      }
      
      if (this.filterSize) {
        filtered = filtered.filter(company => company.size === this.filterSize);
      }
      
      return filtered;
    }
  },
  methods: {
    async loadCompanies() {
      const querySnapshot = await getDocs(collection(db, 'bedrijf'))
      this.companies = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    },
    async deleteCompany(id) {
      if (confirm('Weet je zeker dat je dit bedrijf wilt verwijderen?')) {
        await deleteDoc(doc(db, 'bedrijf', id))
        this.companies = this.companies.filter(c => c.id !== id)
      }
    },
    viewCompany(companyId) {
      // Tijdelijk alert omdat CompanyDetail nog niet bestaat
      alert(`Bekijk bedrijf ${companyId} - CompanyDetail.vue nog niet geïmplementeerd`);
    }
  }
}
</script>

<style scoped>
/* Hergebruik dezelfde styling als StudentList.vue */
.company-list {
  padding: 0;
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

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.filters-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.filter-controls {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  font-size: 0.95rem;
  min-width: 160px;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.companies-table {
  width: 100%;
  border-collapse: collapse;
}

.companies-table th {
  background: #f8f9fa;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 1px solid #e0e0e0;
}

.company-row {
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.company-row:hover {
  background-color: #f8f9fa;
}

.companies-table td {
  padding: 16px;
  vertical-align: middle;
}

.company-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.company-logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  overflow: hidden;
  flex-shrink: 0;
}

.company-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.company-name {
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.company-website {
  color: #666;
  margin: 0;
  font-size: 0.875rem;
}

.industry-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
}

.looking-for {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: none;
  background: #f8f9fa;
  color: #495057;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.action-btn.view:hover {
  background: #e3f2fd;
  color: #1976d2;
}

.action-btn.edit:hover {
  background: #fff3e0;
  color: #f57c00;
}

.action-btn.delete:hover {
  background: #ffebee;
  color: #d32f2f;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.empty-state p {
  color: #666;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .filter-controls {
    flex-direction: column;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .companies-table {
    min-width: 800px;
  }
}
</style>

