<template>
  <div class="student-list">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Studenten Beheer</h1>
        <p class="page-subtitle">Beheer alle studenten in het systeem</p>
      </div>
      <div class="header-actions">
        <router-link to="/admin/students/new" class="btn btn-primary">
          <span class="btn-icon">➕</span>
          Nieuwe Student
        </router-link>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Zoek studenten..."
          class="search-input"
        >
        <span class="search-icon">🔍</span>
      </div>
      
      <div class="filter-controls">
        <select v-model="filterStudyYear" class="filter-select">
          <option value="">Alle studiejaren</option>
          <option value="1e jaar">1e jaar</option>
          <option value="2e jaar">2e jaar</option>
          <option value="3e jaar">3e jaar</option>
          <option value="Afgestudeerd">Afgestudeerd</option>
        </select>
        
        <select v-model="filterOpportunity" class="filter-select">
          <option value="">Alle opportuniteiten</option>
          <option value="Stage">Stage</option>
          <option value="Studentenjob">Studentenjob</option>
          <option value="Voltijdse job">Voltijdse job</option>
        </select>
      </div>
    </div>

    <!-- Students Table -->
    <div class="table-container">
      <table class="students-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Leeftijd</th>
            <th>Studiejaar</th>
            <th>Domein</th>
            <th>Gezochte Opportuniteit</th>
            <th>Acties</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in filteredStudents" :key="student.id" class="student-row">
            <td class="student-info">
              <div class="student-avatar">
                <img v-if="student.photo" :src="student.photo" :alt="student.name">
                <span v-else>{{ student.firstName.charAt(0) }}{{ student.lastName.charAt(0) }}</span>
              </div>
              <div class="student-details">
                <router-link :to="`/admin/students/${student.id}`" class="student-name">
                  {{ student.firstName }} {{ student.lastName }}
                </router-link>
                <p class="student-email">{{ student.email }}</p>
                <p class="student-phone">{{ student.phone }}</p>
                <p class="student-location">{{ student.location }}</p>
              </div>
            </td>
            <td>{{ student.age }}</td>
            <td>
              <span class="study-year-badge">{{ student.studyYear }}</span>
            </td>
            <td>{{ student.domain }}</td>
            <td>
              <span :class="['opportunity-badge', student.opportunity.toLowerCase().replace(' ', '-')]">
                {{ student.opportunity }}
              </span>
            </td>
            <td class="actions">
              <router-link 
                :to="`/admin/students/${student.id}`" 
                class="action-btn view"
                title="Bekijken"
              >
                👁️
              </router-link>
              <router-link 
                :to="`/admin/students/${student.id}/edit`" 
                class="action-btn edit"
                title="Bewerken"
              >
                ✏️
              </router-link>
              <button 
                @click="deleteStudent(student.id)" 
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
    <div v-if="filteredStudents.length === 0" class="empty-state">
      <div class="empty-icon">👥</div>
      <h3>Geen studenten gevonden</h3>
      <p>Er zijn geen studenten die voldoen aan je zoekcriteria.</p>
    </div>
  </div>
</template>

<script>
import { getAllStudents } from '../../../data/studentData'

export default {
  name: 'StudentList',
  data() {
    return {
      searchQuery: '',
      filterStudyYear: '',
      filterOpportunity: '',
      students: getAllStudents()
    }
  },
  computed: {
    filteredStudents() {
      let filtered = this.students;
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(student => 
          student.firstName.toLowerCase().includes(query) ||
          student.lastName.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          student.domain.toLowerCase().includes(query)
        );
      }
      
      if (this.filterStudyYear) {
        filtered = filtered.filter(student => student.studyYear === this.filterStudyYear);
      }
      
      if (this.filterOpportunity) {
        filtered = filtered.filter(student => student.opportunity === this.filterOpportunity);
      }
      
      return filtered;
    }
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('nl-NL');
    },
    deleteStudent(studentId) {
      if (confirm('Weet je zeker dat je deze student wilt verwijderen?')) {
        this.students = this.students.filter(student => student.id !== studentId);
      }
    }
  }
}
</script>

<style scoped>
.student-list {
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

.header-actions {
  display: flex;
  gap: 12px;
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

.students-table {
  width: 100%;
  border-collapse: collapse;
}

.students-table th {
  background: #f8f9fa;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 1px solid #e0e0e0;
}

.student-row {
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.student-row:hover {
  background-color: #f8f9fa;
}

.students-table td {
  padding: 16px;
  vertical-align: middle;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.student-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  overflow: hidden;
  flex-shrink: 0;
}

.student-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.student-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  text-decoration: none;
  transition: color 0.2s;
}

.student-name:hover {
  color: #2563eb;
}

.student-email {
  color: #666;
  margin: 0;
  font-size: 0.875rem;
}

.student-phone {
  color: #666;
  margin: 0;
  font-size: 0.875rem;
}

.student-location {
  color: #666;
  margin: 0;
  font-size: 0.875rem;
}

.study-year-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
}

.opportunity-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
}

.opportunity-badge.stage {
  background: #fff3e0;
  color: #f57c00;
}

.opportunity-badge.studentenjob {
  background: #e8f5e8;
  color: #2d7d32;
}

.opportunity-badge.voltijdse-job {
  background: #fce4ec;
  color: #c2185b;
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

/* Responsive Design */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .filters-section {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }

  .search-box {
    width: 100%;
  }

  .filter-controls {
    width: 100%;
    flex-direction: column;
    gap: 8px;
  }

  .filter-select {
    width: 100%;
  }

  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .students-table {
    min-width: 800px;
  }

  .student-info {
    min-width: 250px;
  }

  .actions {
    min-width: 120px;
  }

  .study-year-badge,
  .opportunity-badge {
    white-space: nowrap;
  }
}

@media (max-width: 480px) {
  .page-header {
    margin-bottom: 20px;
  }

  .header-content h1 {
    font-size: 1.5rem;
  }

  .header-content p {
    font-size: 0.9rem;
  }

  .filters-section {
    padding: 12px;
  }

  .search-input {
    padding: 10px 16px 10px 36px;
    font-size: 0.9rem;
  }

  .filter-select {
    padding: 10px 12px;
    font-size: 0.9rem;
  }

  .students-table th,
  .students-table td {
    padding: 12px;
    font-size: 0.9rem;
  }

  .student-avatar {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }

  .student-name {
    font-size: 0.9rem;
  }

  .student-email {
    font-size: 0.8rem;
  }

  .student-phone {
    font-size: 0.8rem;
  }

  .student-location {
    font-size: 0.8rem;
  }

  .study-year-badge,
  .opportunity-badge {
    font-size: 0.8rem;
    padding: 3px 6px;
  }

  .action-btn {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }

  .empty-state {
    padding: 32px 16px;
  }

  .empty-icon {
    font-size: 2.5rem;
  }

  .empty-state h3 {
    font-size: 1.2rem;
  }

  .empty-state p {
    font-size: 0.9rem;
  }
}
</style>

