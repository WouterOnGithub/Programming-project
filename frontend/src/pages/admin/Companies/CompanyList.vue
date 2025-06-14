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
          <option value="">Alle industrieën</option>
          <option value="IT & Software">IT & Software</option>
          <option value="Marketing & Communicatie">Marketing & Communicatie</option>
          <option value="Design & Creatief">Design & Creatief</option>
        </select>
        
        <select v-model="filterSize" class="filter-select">
          <option value="">Alle groottes</option>
          <option value="10-20">10-20 werknemers</option>
          <option value="20-50">20-50 werknemers</option>
          <option value="50-100">50-100 werknemers</option>
        </select>
      </div>
    </div>

    <!-- Companies Table -->
    <div class="table-container">
      <table class="companies-table">
        <thead>
          <tr>
            <th>Bedrijf</th>
            <th>Industrie</th>
            <th>Grootte</th>
            <th>Locatie</th>
            <th>Acties</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="company in filteredCompanies" :key="company.id" class="company-row">
            <td class="company-info">
              <div class="company-logo">
                <img v-if="company.logo" :src="company.logo" :alt="company.name">
                <span v-else>{{ company.name.charAt(0) }}</span>
              </div>
              <div class="company-details">
                <router-link :to="`/admin/companies/${company.id}`" class="company-name">
                  {{ company.name }}
                </router-link>
                <p class="company-email">{{ company.email }}</p>
              </div>
            </td>
            <td>{{ company.industry }}</td>
            <td>{{ company.size }}</td>
            <td>{{ company.location }}</td>
            <td class="actions">
              <router-link 
                :to="`/admin/companies/${company.id}`" 
                class="action-btn view"
                title="Bekijken"
              >
                👁️
              </router-link>
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
import { getAllCompanies } from '../../../data/companyData'

export default {
  name: 'CompanyList',
  data() {
    return {
      searchQuery: '',
      filterIndustry: '',
      filterSize: '',
      companies: getAllCompanies()
    }
  },
  computed: {
    filteredCompanies() {
      let filtered = this.companies;
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(company => 
          company.name.toLowerCase().includes(query) ||
          company.email.toLowerCase().includes(query) ||
          company.industry.toLowerCase().includes(query)
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
    deleteCompany(companyId) {
      if (confirm('Weet je zeker dat je dit bedrijf wilt verwijderen?')) {
        this.companies = this.companies.filter(company => company.id !== companyId);
      }
    }
  }
}
</script>

<style scoped>
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
  transition: all 0.2s;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-icon {
  font-size: 1.2rem;
}

.filters-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  padding-left: 40px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.filter-controls {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  min-width: 160px;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.companies-table {
  width: 100%;
  border-collapse: collapse;
}

.companies-table th {
  background-color: #f9fafb;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.companies-table td {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.company-row:hover {
  background-color: #f9fafb;
}

.company-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.company-logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #4b5563;
}

.company-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.company-details {
  display: flex;
  flex-direction: column;
}

.company-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  text-decoration: none;
  transition: color 0.2s;
}

.company-name:hover {
  color: #2563eb;
}

.company-email {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #f3f4f6;
}

.action-btn.view:hover {
  color: #2563eb;
}

.action-btn.edit:hover {
  color: #059669;
}

.action-btn.delete:hover {
  color: #dc2626;
}

.empty-state {
  text-align: center;
  padding: 48px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #1a1a1a;
}

.empty-state p {
  margin: 0;
  color: #6b7280;
}
</style>

