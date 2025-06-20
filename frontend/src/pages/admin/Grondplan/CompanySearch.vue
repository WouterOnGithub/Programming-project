<template>
  <div class="company-search">
    <div class="search-input-container">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Zoek bedrijf..."
        class="search-input"
        @input="handleSearch"
        @focus="showResults = true"
        @blur="handleBlur"
      />
      <div class="search-icon">🔍</div>
    </div>
    
    <div v-if="showResults && filteredCompanies.length > 0" class="search-results">
      <div
        v-for="company in filteredCompanies"
        :key="company.id"
        class="search-result-item"
        @mousedown="selectCompany(company)"
      >
        <div class="company-info">
          <div class="company-logo">
            <img v-if="company.logo" :src="company.logo" :alt="company.bedrijfsnaam || company.name" />
            <div v-else class="logo-placeholder">{{ (company.bedrijfsnaam || company.name).charAt(0) }}</div>
          </div>
          <div class="company-details">
            <h4>{{ company.bedrijfsnaam || company.name }}</h4>
            <p>{{ company.industry || company.branche }}</p>
          </div>
        </div>
        <div class="location-status">
          <span v-if="hasLocation(company)" class="status-badge located">📍 Geplaatst</span>
          <span v-else class="status-badge not-located">📍 Niet geplaatst</span>
        </div>
      </div>
    </div>
    
    <div v-if="showResults && searchQuery && filteredCompanies.length === 0" class="no-results">
      <p>Geen bedrijven gevonden voor "{{ searchQuery }}"</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

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
    
    const filteredCompanies = computed(() => {
      if (!searchQuery.value.trim()) {
        return props.companies.slice(0, 10) // Show first 10 companies when no search
      }
      
      const query = searchQuery.value.toLowerCase()
      return props.companies.filter(company => {
        const companyName = company.bedrijfsnaam || company.name
        const companyIndustry = company.industry || company.branche
        return companyName.toLowerCase().includes(query) ||
               companyIndustry.toLowerCase().includes(query)
      }).slice(0, 10) // Limit to 10 results
    })
    
    const hasLocation = (company) => {
      return props.markers.some(marker => marker.companyId === company.id)
    }
    
    const handleSearch = () => {
      showResults.value = true
    }
    
    const handleBlur = () => {
      // Delay hiding results to allow click events to fire
      setTimeout(() => {
        showResults.value = false
      }, 200)
    }
    
    const selectCompany = (company) => {
      searchQuery.value = company.bedrijfsnaam || company.name
      showResults.value = false
      emit('select-company', company)
    }
    
    // Watch for changes in search query
    watch(searchQuery, (newQuery) => {
      if (newQuery.trim()) {
        showResults.value = true
      }
    })
    
    return {
      searchQuery,
      showResults,
      filteredCompanies,
      hasLocation,
      handleSearch,
      handleBlur,
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

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  margin-top: 4px;
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
}

.company-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
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
  margin: 0;
  color: #666;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

