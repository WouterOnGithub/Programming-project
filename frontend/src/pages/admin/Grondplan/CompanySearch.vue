<template>
  <div class="company-search">
    <div class="search-input-container">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Zoek bedrijf..."
        class="search-input"
        @input="handleSearch"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />
      <div class="search-icon">🔍</div>
      <div v-if="searchQuery" class="clear-button" @click="clearSearch">×</div>
    </div>
    
    <!-- Search results -->
    <div v-if="showResults && filteredCompanies.length > 0" class="search-results">
      <div class="results-header">
        <span>{{ filteredCompanies.length }} resultaten</span>
      </div>
      <div
        v-for="company in filteredCompanies"
        :key="company.id"
        class="search-result-item"
        @mousedown="selectCompany(company)"
        @click="selectCompany(company)"
      >
        <div class="company-info">
          <div class="company-logo">
            <img v-if="company.foto" :src="company.foto" :alt="getCompanyName(company)" />
            <div v-else class="logo-placeholder">{{ getCompanyInitial(company) }}</div>
          </div>
          <div class="company-details">
            <h4>{{ getCompanyName(company) }}</h4>
            <p>{{ getCompanyIndustry(company) }}</p>
            <small v-if="company.gesitueerdIn">{{ company.gesitueerdIn }}</small>
          </div>
        </div>
        <div class="location-status">
          <span v-if="hasLocation(company)" class="status-badge located">Geplaatst</span>
          <span v-else class="status-badge not-located">Niet geplaatst</span>
        </div>
      </div>
    </div>
    
    <!-- No results -->
    <div v-else-if="showResults && searchQuery && filteredCompanies.length === 0" class="no-results">
      <p>Geen bedrijven gevonden voor "{{ searchQuery }}"</p>
    </div>
    
    <!-- No companies loaded -->
    <div v-else-if="showResults && !searchQuery && companies.length === 0" class="no-results">
      <p>Geen bedrijven geladen</p>
    </div>
    
    <!-- Initial state -->
    <div v-else-if="showResults && !searchQuery && companies.length > 0" class="search-results">
      <div class="results-header">
        <span>Alle bedrijven ({{ companies.length }})</span>
      </div>
      <div
        v-for="company in companies.slice(0, 10)"
        :key="company.id"
        class="search-result-item"
        @mousedown="selectCompany(company)"
        @click="selectCompany(company)"
      >
        <div class="company-info">
          <div class="company-logo">
            <img v-if="company.foto" :src="company.foto" :alt="getCompanyName(company)" />
            <div v-else class="logo-placeholder">{{ getCompanyInitial(company) }}</div>
          </div>
          <div class="company-details">
            <h4>{{ getCompanyName(company) }}</h4>
            <p>{{ getCompanyIndustry(company) }}</p>
            <small v-if="company.gesitueerdIn">{{ company.gesitueerdIn }}</small>
          </div>
        </div>
        <div class="location-status">
          <span v-if="hasLocation(company)" class="status-badge located">Geplaatst</span>
          <span v-else class="status-badge not-located">Niet geplaatst</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, nextTick } from 'vue'

export default {
  name: 'CompanySearch',
  props: {
    companies: {
      type: Array,
      default: () => []
    },
    markers: {
      type: Array,
      default: () => []
    }
  },
  emits: ['select-company'],
  setup(props, { emit }) {
    const searchQuery = ref('')
    const showResults = ref(false)
    
    // Helper functions for company data
    const getCompanyName = (company) => {
      return company.bedrijfsnaam || company.name || 'Onbekend bedrijf'
    }
    
    const getCompanyIndustry = (company) => {
      return company.branche || company.industry || 'Geen branche'
    }
    
    const getCompanyInitial = (company) => {
      const name = getCompanyName(company)
      return name.charAt(0).toUpperCase()
    }
    
    const filteredCompanies = computed(() => {
      if (!searchQuery.value.trim()) {
        return props.companies.slice(0, 10)
      }
      
      const query = searchQuery.value.toLowerCase().trim()
      
      const filtered = props.companies.filter(company => {
        const companyName = getCompanyName(company).toLowerCase()
        const companyIndustry = getCompanyIndustry(company).toLowerCase()
        const companyLocation = (company.gesitueerdIn || '').toLowerCase()
        
        const nameMatch = companyName.includes(query)
        const industryMatch = companyIndustry.includes(query)
        const locationMatch = companyLocation.includes(query)
        
        return nameMatch || industryMatch || locationMatch
      })
      
      return filtered.slice(0, 10)
    })
    
    const hasLocation = (company) => {
      return props.markers.some(marker => marker.companyId === company.id)
    }
    
    const handleSearch = () => {
      showResults.value = true
    }
    
    const handleFocus = () => {
      showResults.value = true
    }
    
    const handleBlur = () => {
      // Delay hiding results to allow click events to fire
      setTimeout(() => {
        showResults.value = false
      }, 300)
    }
    
    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        showResults.value = false
        searchQuery.value = ''
      }
    }
    
    const clearSearch = () => {
      searchQuery.value = ''
      showResults.value = false
    }
    
    const selectCompany = (company) => {
      searchQuery.value = getCompanyName(company)
      showResults.value = false
      emit('select-company', company)
    }
    
    // Watch for changes in search query
    watch(searchQuery, (newQuery) => {
      if (newQuery.trim()) {
        showResults.value = true
      }
    })
    
    // Watch for changes in companies prop
    watch(() => props.companies, (newCompanies) => {
      // Force recomputation of filtered companies
      if (showResults.value) {
        showResults.value = false
        setTimeout(() => {
          showResults.value = true
        }, 100)
      }
    }, { immediate: true, deep: true })
    
    onMounted(async () => {
      await nextTick()
    })
    
    return {
      searchQuery,
      showResults,
      filteredCompanies,
      hasLocation,
      getCompanyName,
      getCompanyIndustry,
      getCompanyInitial,
      handleSearch,
      handleFocus,
      handleBlur,
      handleKeydown,
      clearSearch,
      selectCompany
    }
  }
}
</script>

<style scoped>
.company-search {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 45px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.search-icon {
  position: absolute;
  left: 15px;
  color: #6c757d;
  font-size: 1.1rem;
  pointer-events: none;
}

.clear-button {
  position: absolute;
  right: 15px;
  color: #6c757d;
  font-size: 1.2rem;
  cursor: pointer;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.clear-button:hover {
  background: #f0f0f0;
  color: #333;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-height: 400px;
  overflow-y: auto;
  z-index: 9999;
  margin-top: 4px;
  min-width: 300px;
}

.results-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f3f4;
  background: #f8f9fa;
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
}

.search-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f1f3f4;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background-color: #f8f9fa;
}

.company-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.company-logo {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.company-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-placeholder {
  width: 100%;
  height: 100%;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.2rem;
}

.company-details {
  flex: 1;
  min-width: 0;
}

.company-details h4 {
  margin: 0 0 4px 0;
  color: #333;
  font-size: 0.95rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.company-details p {
  margin: 0 0 2px 0;
  color: #666;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.company-details small {
  color: #999;
  font-size: 0.75rem;
}

.location-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.status-badge.located {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-badge.not-located {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.no-results {
  padding: 20px;
  text-align: center;
  color: #666;
  font-style: italic;
}

.no-results p {
  margin: 0;
}

/* Scrollbar styling for search results */
.search-results::-webkit-scrollbar {
  width: 6px;
}

.search-results::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.search-results::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.search-results::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive design */
@media (max-width: 768px) {
  .company-search {
    max-width: 100%;
  }
  
  .search-result-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .company-info {
    width: 100%;
  }
  
  .location-status {
    align-self: flex-end;
  }
}
</style>

