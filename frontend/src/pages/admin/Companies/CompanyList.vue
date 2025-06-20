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
            <th>Logo</th>
            <th>Bedrijfsnaam</th>
            <th>Locatie</th>
            <th>Op zoek naar</th>
            <th>Acties</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="company in filteredCompanies" :key="company.id" @click="viewCompany(company.id)" class="clickable-row">
            <td>
              <div class="logo-circle">
                <img v-if="company.foto" :src="company.foto" :alt="company.bedrijfsnaam" />
                <span v-else>{{ (company.bedrijfsnaam || '?').charAt(0) }}</span>
              </div>
            </td>
            <td>{{ company.bedrijfsnaam }}</td>
            <td>{{ company.locatie }}</td>
            <td>
              <div class="looking-for-tags">
                <span v-if="Array.isArray(company.opZoekNaar)" v-for="item in company.opZoekNaar" :key="item" class="looking-for-tag">
                  {{ item }}
                </span>
                <span v-else-if="company.opZoekNaar" class="looking-for-tag">
                  {{ company.opZoekNaar }}
                </span>
                <span v-else class="no-data">-</span>
              </div>
            </td>
            <td @click.stop>
              <div class="actions-cell">
                <router-link :to="`/admin/companies/${company.id}`" class="action-btn view" title="Bekijken">👁️</router-link>
                <router-link :to="`/admin/companies/${company.id}/edit`" class="action-btn edit" title="Bewerken">✏️</router-link>
                <button @click="deleteCompany(company.id)" class="action-btn delete" title="Verwijderen">🗑️</button>
              </div>
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
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore'

export default {
  name: 'CompanyList',
  data() {
    return {
      searchQuery: '',
      filterIndustry: '',
      filterSize: '',
      companies: [],
      unsubscribe: null,
      lastClickedCompanyId: localStorage.getItem('lastClickedCompanyId') || null
    }
  },
  mounted() {
    this.loadCompanies()
  },
  beforeUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  },
  computed: {
    filteredCompanies() {
      let filtered = this.companies;
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(company =>
          (company.bedrijfsnaam && company.bedrijfsnaam.toLowerCase().includes(query)) ||
          (company.locatie && company.locatie.toLowerCase().includes(query)) ||
          (company.opZoekNaar && company.opZoekNaar.toLowerCase().includes(query))
        );
      }
      return filtered;
    }
  },
  methods: {
    loadCompanies() {
      const companiesRef = collection(db, 'bedrijf')
      this.unsubscribe = onSnapshot(companiesRef, (snapshot) => {
        this.companies = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      })
    },
    async deleteCompany(id) {
      if (confirm('Weet je zeker dat je dit bedrijf wilt verwijderen?')) {
        try {
          await deleteDoc(doc(db, 'bedrijf', id))
        } catch (error) {
          alert('Fout bij verwijderen: ' + error.message)
        }
      }
    },
    viewCompany(companyId) {
      this.$router.push(`/admin/companies/${companyId}`);
    },
    handleCompanyClick(id) {
      this.lastClickedCompanyId = id
      localStorage.setItem('lastClickedCompanyId', id)
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

.companies-table tr {
  height: 56px;
  transition: background-color 0.2s ease;
}

.companies-table tr:hover {
  background-color: #f8f9fa;
}

.companies-table td.actions,
.companies-table td.actions-cell {
  vertical-align: middle;
  padding-top: 0;
  padding-bottom: 0;
  height: 56px;
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

.logo-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.logo-circle img {
  width: 80%;
  height: 80%;
  object-fit: contain;
  display: block;
  margin: auto;
  padding: 6px;
  background: transparent;
}

.logo-circle span {
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

.company-name {
  color: inherit;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.company-name.active-link {
  color: #7c3aed;
  font-weight: 700;
  background: none;
  border-radius: 0;
  padding: 0;
}

.company-name:hover {
  color: #1976d2;
  text-decoration: none;
}

.company-email {
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

.looking-for-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-width: 200px;
}

.looking-for-tag {
  background: #f8f9fa;
  color: #6c757d;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  border: 1px solid #e9ecef;
}

.no-data {
  color: #999;
  font-style: italic;
  font-size: 0.875rem;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: #f8f9fa;
  border: none;
  border-radius: 6px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: background 0.15s, box-shadow 0.15s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  cursor: pointer;
  margin: 0;
  padding: 0;
  text-decoration: none !important;
}

.action-btn:hover {
  background: #ececec;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  text-decoration: none !important;
}

.action-btn:visited, .action-btn:active, .action-btn:focus {
  text-decoration: none !important;
  outline: none;
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

.actions-cell {
  display: flex;
  gap: 0.3rem;
}

.clickable-row {
  cursor: pointer;
}

.clickable-row:hover {
  background-color: #f8f9fa;
}
</style>

