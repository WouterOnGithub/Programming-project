<template>
  <div class="verification-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Bedrijfsverificatie</h1>
        <p class="page-subtitle">Beheer en verifieer bedrijfsregistraties</p>
      </div>
      <div class="header-actions">
        <button @click="loadRejectionComments" class="btn btn-secondary">
          <span class="btn-icon">💬</span>
          Beheer Afwijzingsredenen
        </button>
      </div>
    </div>

    <!-- Status Filter -->
    <div class="filters-section">
      <div class="filter-controls">
        <button 
          v-for="status in statusOptions" 
          :key="status.value"
          @click="filterStatus = status.value"
          :class="['status-filter-btn', { active: filterStatus === status.value }]"
        >
          <span class="status-icon">{{ status.icon }}</span>
          {{ status.label }}
          <span class="count">({{ getStatusCount(status.value) }})</span>
        </button>
      </div>
    </div>

    <!-- Companies Table -->
    <div class="table-container">
      <table class="verification-table">
        <thead>
          <tr>
            <th>Bedrijf</th>
            <th>Contact</th>
            <th>Registratiedatum</th>
            <th>Status</th>
            <th>Acties</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="company in filteredCompanies" :key="company.id" class="company-row" @click="goToCompany(company.id)">
            <td>
              <div class="company-info">
                <div class="logo-circle">
                  <img v-if="company.foto" :src="company.foto" :alt="company.bedrijfsnaam" />
                  <span v-else>{{ (company.bedrijfsnaam || '?').charAt(0) }}</span>
                </div>
                <div class="company-details">
                  <h4>{{ company.bedrijfsnaam || 'Onbekend' }}</h4>
                  <p>{{ company.locatie || company.gesitueerdIn || '-' }}</p>
                </div>
              </div>
            </td>
            <td>
              <div class="contact-info">
                <p>{{ company.email || '-' }}</p>
                <p v-if="company.telefoonnummer">{{ company.telefoonnummer }}</p>
              </div>
            </td>
            <td>
              <span class="registration-date">
                {{ formatDate(company.aangemaaktOp) }}
              </span>
            </td>
            <td>
              <span :class="['status-badge', getStatusClass(company.verificatieStatus)]">
                {{ getStatusLabel(company.verificatieStatus) }}
              </span>
            </td>
            <td>
              <div class="actions-cell" @click.stop>
                <router-link :to="`/admin/companies/${company.id}`" class="action-btn view" title="Bekijken">
                  👁️
                </router-link>
                <button 
                  v-if="company.verificatieStatus !== 'goedgekeurd'"
                  @click="approveCompany(company)"
                  class="action-btn approve" 
                  title="Goedkeuren"
                >
                  ✅
                </button>
                <button 
                  v-if="company.verificatieStatus !== 'geweigerd'"
                  @click="openRejectModal(company)"
                  class="action-btn reject" 
                  title="Afwijzen"
                >
                  ❌
                </button>
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
      <p>Er zijn geen bedrijven met de geselecteerde status.</p>
    </div>

    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="modal-overlay" @click="closeRejectModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Bedrijf Afwijzen</h3>
          <button @click="closeRejectModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <p><strong>Bedrijf:</strong> {{ selectedCompany?.bedrijfsnaam }}</p>
          
          <div class="form-group">
            <label>Selecteer een reden:</label>
            <select v-model="selectedRejectionReason" class="form-select">
              <option value="">Kies een bestaande reden...</option>
              <option v-for="comment in rejectionComments" :key="comment.id" :value="comment.text">
                {{ comment.text }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Of voer een nieuwe reden in:</label>
            <textarea 
              v-model="customRejectionReason" 
              class="form-textarea"
              placeholder="Voer een afwijzingsreden in..."
              rows="4"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="saveAsReusable"
                :disabled="!customRejectionReason"
              >
              Sla deze reden op voor hergebruik
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeRejectModal" class="btn btn-secondary">Annuleren</button>
          <button @click="rejectCompany" class="btn btn-danger" :disabled="!getRejectionText()">
            Afwijzen
          </button>
        </div>
      </div>
    </div>

    <!-- Comments Management Modal -->
    <div v-if="showCommentsModal" class="modal-overlay" @click="closeCommentsModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>Beheer Afwijzingsredenen</h3>
          <button @click="closeCommentsModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nieuwe afwijzingsreden toevoegen:</label>
            <div class="input-group">
              <textarea 
                v-model="newComment" 
                class="form-textarea"
                placeholder="Voer een nieuwe afwijzingsreden in..."
                rows="3"
              ></textarea>
              <button @click="addRejectionComment" class="btn btn-primary" :disabled="!newComment.trim()">
                Toevoegen
              </button>
            </div>
          </div>
          
          <div class="comments-list">
            <h4>Bestaande afwijzingsredenen:</h4>
            <div v-for="comment in rejectionComments" :key="comment.id" class="comment-item">
              <p>{{ comment.text }}</p>
              <button @click="deleteRejectionComment(comment.id)" class="btn btn-danger btn-sm">
                Verwijderen
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeCommentsModal" class="btn btn-primary">Sluiten</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { db } from '../../../firebase/config'
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  getDocs,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore'
import { useRouter } from 'vue-router'

export default {
  name: 'CompanyVerification',
  setup() {
    // Reactive data
    const companies = ref([])
    const rejectionComments = ref([])
    const filterStatus = ref('alle')
    const showRejectModal = ref(false)
    const showCommentsModal = ref(false)
    const selectedCompany = ref(null)
    const selectedRejectionReason = ref('')
    const customRejectionReason = ref('')
    const saveAsReusable = ref(false)
    const newComment = ref('')
    
    // Unsubscribe functions
    let unsubscribeCompanies = null
    let unsubscribeComments = null

    // Status options
    const statusOptions = [
      { value: 'alle', label: 'Alle', icon: '📋' },
      { value: 'wachtend op verificatie', label: 'Wachtend', icon: '⏳' },
      { value: 'goedgekeurd', label: 'Goedgekeurd', icon: '✅' },
      { value: 'geweigerd', label: 'Geweigerd', icon: '❌' }
    ]

    // Computed properties
    const filteredCompanies = computed(() => {
      if (filterStatus.value === 'alle') {
        return companies.value
      }
      return companies.value.filter(company => 
        (company.verificatieStatus || 'wachtend op verificatie') === filterStatus.value
      )
    })

    // Methods
    const loadCompanies = () => {
      const companiesRef = collection(db, 'bedrijf')
      unsubscribeCompanies = onSnapshot(companiesRef, (snapshot) => {
        companies.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      })
    }

    const loadRejectionComments = () => {
      showCommentsModal.value = true
      if (!unsubscribeComments) {
        const commentsRef = query(
          collection(db, 'rejectionComments'),
          orderBy('createdAt', 'desc')
        )
        unsubscribeComments = onSnapshot(commentsRef, (snapshot) => {
          rejectionComments.value = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        })
      }
    }

    const getStatusCount = (status) => {
      if (status === 'alle') return companies.value.length
      return companies.value.filter(company => 
        (company.verificatieStatus || 'wachtend op verificatie') === status
      ).length
    }

    const getStatusClass = (status) => {
      const normalizedStatus = status || 'wachtend op verificatie'
      switch (normalizedStatus) {
        case 'goedgekeurd': return 'approved'
        case 'geweigerd': return 'rejected'
        case 'wachtend op verificatie': return 'pending'
        default: return 'pending'
      }
    }

    const getStatusLabel = (status) => {
      return status || 'Wachtend op verificatie'
    }

    const formatDate = (timestamp) => {
      if (!timestamp) return '-'
      const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp)
      return date.toLocaleDateString('nl-NL')
    }

    const approveCompany = async (company) => {
      try {
        await updateDoc(doc(db, 'bedrijf', company.id), {
          verificatieStatus: 'goedgekeurd',
          verificatieDatum: serverTimestamp()
        })

        // Create notification
        await addDoc(collection(db, 'notifications'), {
          companyId: company.id,
          type: 'verification_approved',
          title: 'Verificatie Goedgekeurd',
          message: `Uw bedrijf "${company.bedrijfsnaam}" is succesvol geverifieerd. U heeft nu toegang tot alle functies.`,
          read: false,
          createdAt: serverTimestamp()
        })

        alert('Bedrijf succesvol goedgekeurd!')
      } catch (error) {
        console.error('Error approving company:', error)
        alert('Fout bij goedkeuren: ' + error.message)
      }
    }

    const openRejectModal = (company) => {
      selectedCompany.value = company
      selectedRejectionReason.value = ''
      customRejectionReason.value = ''
      saveAsReusable.value = false
      showRejectModal.value = true
      
      // Load comments if not already loaded
      if (rejectionComments.value.length === 0) {
        loadRejectionComments()
      }
    }

    const closeRejectModal = () => {
      showRejectModal.value = false
      selectedCompany.value = null
    }

    const closeCommentsModal = () => {
      showCommentsModal.value = false
    }

    const getRejectionText = () => {
      return customRejectionReason.value.trim() || selectedRejectionReason.value
    }

    const rejectCompany = async () => {
      const rejectionText = getRejectionText()
      if (!rejectionText) return

      try {
        // Update company status
        await updateDoc(doc(db, 'bedrijf', selectedCompany.value.id), {
          verificatieStatus: 'geweigerd',
          verificatieDatum: serverTimestamp(),
          afwijzingsreden: rejectionText
        })

        // Create notification
        await addDoc(collection(db, 'notifications'), {
          companyId: selectedCompany.value.id,
          type: 'verification_rejected',
          title: 'Verificatie Geweigerd',
          message: `Uw bedrijf "${selectedCompany.value.bedrijfsnaam}" is geweigerd. Reden: ${rejectionText}`,
          read: false,
          createdAt: serverTimestamp()
        })

        // Save as reusable comment if requested
        if (saveAsReusable.value && customRejectionReason.value.trim()) {
          await addDoc(collection(db, 'rejectionComments'), {
            text: customRejectionReason.value.trim(),
            createdAt: serverTimestamp()
          })
        }

        closeRejectModal()
        alert('Bedrijf succesvol geweigerd!')
      } catch (error) {
        console.error('Error rejecting company:', error)
        alert('Fout bij afwijzen: ' + error.message)
      }
    }

    const addRejectionComment = async () => {
      if (!newComment.value.trim()) return

      try {
        await addDoc(collection(db, 'rejectionComments'), {
          text: newComment.value.trim(),
          createdAt: serverTimestamp()
        })
        newComment.value = ''
        alert('Afwijzingsreden toegevoegd!')
      } catch (error) {
        console.error('Error adding rejection comment:', error)
        alert('Fout bij toevoegen: ' + error.message)
      }
    }

    const deleteRejectionComment = async (commentId) => {
      if (!confirm('Weet je zeker dat je deze afwijzingsreden wilt verwijderen?')) return

      try {
        await deleteDoc(doc(db, 'rejectionComments', commentId))
        alert('Afwijzingsreden verwijderd!')
      } catch (error) {
        console.error('Error deleting rejection comment:', error)
        alert('Fout bij verwijderen: ' + error.message)
      }
    }

    const router = useRouter()
    const goToCompany = (id) => {
      router.push(`/admin/companies/${id}`)
    }

    // Lifecycle
    onMounted(() => {
      loadCompanies()
    })

    onUnmounted(() => {
      if (unsubscribeCompanies) unsubscribeCompanies()
      if (unsubscribeComments) unsubscribeComments()
    })

    return {
      companies,
      rejectionComments,
      filterStatus,
      showRejectModal,
      showCommentsModal,
      selectedCompany,
      selectedRejectionReason,
      customRejectionReason,
      saveAsReusable,
      newComment,
      statusOptions,
      filteredCompanies,
      loadRejectionComments,
      getStatusCount,
      getStatusClass,
      getStatusLabel,
      formatDate,
      approveCompany,
      openRejectModal,
      closeRejectModal,
      closeCommentsModal,
      getRejectionText,
      rejectCompany,
      addRejectionComment,
      deleteRejectionComment,
      goToCompany
    }
  }
}
</script>

<style scoped>
.verification-page {
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
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.875rem;
}

.filters-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.filter-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.status-filter-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.status-filter-btn:hover {
  border-color: #007bff;
  background: #f8f9fa;
}

.status-filter-btn.active {
  border-color: #007bff;
  background: #007bff;
  color: white;
}

.status-icon {
  font-size: 1.2rem;
}

.count {
  background: rgba(0,0,0,0.1);
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-filter-btn.active .count {
  background: rgba(255,255,255,0.2);
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.verification-table {
  width: 100%;
  border-collapse: collapse;
}

.verification-table th {
  background: #f8f9fa;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 1px solid #e0e0e0;
}

.verification-table td {
  padding: 16px;
  vertical-align: middle;
  border-bottom: 1px solid #f0f0f0;
}

.company-row:hover {
  background-color: #f8f9fa;
}

.company-row {
  cursor: pointer;
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

.company-details h4 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.company-details p {
  margin: 0;
  font-size: 0.875rem;
  color: #666;
}

.contact-info p {
  margin: 0 0 4px 0;
  font-size: 0.875rem;
  color: #666;
}

.registration-date {
  font-size: 0.875rem;
  color: #666;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-badge.approved {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: #f8f9fa;
  border: none;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.15s;
  cursor: pointer;
  text-decoration: none;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.action-btn.view:hover {
  background: #e3f2fd;
}

.action-btn.approve:hover {
  background: #d4edda;
}

.action-btn.reject:hover {
  background: #f8d7da;
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.modal-content.large {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f0f0f0;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #1a1a1a;
}

.form-select,
.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #007bff;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
}

.input-group {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.input-group .form-textarea {
  flex: 1;
}

.comments-list {
  margin-top: 24px;
}

.comments-list h4 {
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  color: #1a1a1a;
}

.comment-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 8px;
}

.comment-item p {
  margin: 0;
  flex: 1;
  color: #1a1a1a;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-controls {
    flex-direction: column;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .verification-table {
    min-width: 800px;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
}
</style>

