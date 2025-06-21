<template>
  <StudentDashboardLayout>
    <main class="dashboard-main">
      <section class="content-section">
        <div class="section-header">
          <h2 class="section-title">Komende Afspraken</h2>
          <div class="filter-knoppen">
            <button 
              @click="setFilter('all')" 
              :class="['filter-knop', { 'actief': activeFilter === 'all' }]">
              Alle
            </button>
            <button 
              @click="setFilter('upcoming')" 
              :class="['filter-knop', { 'actief': activeFilter === 'upcoming' }]">
              Komend
            </button>
            <button 
              @click="setFilter('afgerond')" 
              :class="['filter-knop', { 'actief': activeFilter === 'afgerond' }]">
              Afgerond
            </button>
          </div>
        </div>

        <div v-if="loading" class="empty-state">
          <p>Afspraken worden geladen...</p>
        </div>
        <div v-else-if="error" class="empty-state">
          <h3>Er is een fout opgetreden</h3>
          <p>{{ error }}</p>
        </div>
        <div v-else-if="filteredAppointments.length === 0" class="empty-state">
          <div class="empty-state-icon">📭</div>
          <h3>Geen afspraken</h3>
          <p>U heeft geen afspraken die voldoen aan dit filter.</p>
        </div>
        <div v-else class="appointments-list">
          <div v-for="appointment in filteredAppointments" :key="appointment.id" class="appointment-card">
            <div class="appointment-header">
              <div class="company-info">
                <div class="company-logo">{{ appointment.avatar }}</div>
                <div class="company-details">
                  <h3>{{ appointment.company }}</h3>
                  <div class="job-title">{{ appointment.position }}</div>
                </div>
              </div>
              <div class="status-badge" :class="appointment.status">
                {{ getStatusText(appointment.status) }}
              </div>
            </div>

            <div class="appointment-details">
              <div class="detail-item">
                <div class="detail-icon">⏰</div>
                <div class="detail-content">
                  <div class="detail-label">Tijd</div>
                  <div class="detail-text">{{ appointment.time }}</div>
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-icon">📍</div>
                <div class="detail-content">
                  <div class="detail-label">Locatie</div>
                  <div class="detail-text">{{ appointment.location }}</div>
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-icon">⏱️</div>
                <div class="detail-content">
                  <div class="detail-label">Duur</div>
                  <div class="detail-text">{{ appointment.duration }}</div>
                </div>
              </div>
            </div>

            <div v-if="appointment.status === 'upcoming'" class="appointment-actions">
              <button class="action-btn btn-edit" @click="startEditTime(appointment.id)">🕒 Aanpassen</button>
              <button class="action-btn btn-cancel" @click="cancelAppointment(appointment.id)">❌ Annuleren</button>
            </div>
          </div>
        </div>
      </section>

      <!-- Modal voor tijdslot selectie -->
      <div v-if="showTimeModal" class="modal-overlay">
        <div class="modal-content">
          <h3>Kies een nieuw tijdslot</h3>
          <div class="timeslot-grid">
            <button
              v-for="slot in timeSlots"
              :key="slot"
              :disabled="isSlotTaken(slot) && slot !== editingAppointmentOriginalTime"
              :class="['timeslot-btn', { taken: isSlotTaken(slot) && slot !== editingAppointmentOriginalTime, selected: selectedTimeSlot === slot }]"
              @click="selectTimeSlot(slot)"
            >
              {{ slot }}
            </button>
          </div>
          <div class="modal-actions">
            <button class="action-btn btn-save" :disabled="!selectedTimeSlot" @click="saveTime(editingAppointmentId, selectedTimeSlot)">Opslaan</button>
            <button class="action-btn btn-cancel-edit" @click="closeTimeModal">Annuleren</button>
          </div>
        </div>
      </div>
    </main>
  </StudentDashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import StudentDashboardLayout from '../../components/StudentDashboardLayout.vue'
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, updateDoc, doc, deleteDoc, query, where, documentId } from 'firebase/firestore';

const db = getFirestore();
const auth = getAuth();
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: 'fas fa-chart-pie' },
  { name: 'Job Swiping', href: '/swipe', icon: 'fas fa-heart' },
  { name: 'Afspraken', href: '/appointments', icon: 'fas fa-calendar' },
  { name: 'Profiel', href: '/WeergaveSt', icon: 'fas fa-user' },
  { name: 'Instellingen', href: '/settings', icon: 'fas fa-cog' },
];

const activeFilter = ref('all');
const appointments = ref([]);
const loading = ref(true);
const error = ref(null);
const route = useRoute();

const setFilter = (filter) => {
  activeFilter.value = filter;
};

onMounted(async () => {
  try {
    loading.value = true;
    error.value = null;
    let studentId = auth.currentUser?.uid;

    if (!studentId) {
      await new Promise((resolve, reject) => {
        const unsub = auth.onAuthStateChanged(user => {
          unsub();
          if (user) {
            studentId = user.uid;
            resolve();
          } else {
            reject(new Error("Gebruiker niet ingelogd."));
          }
        });
      });
    }
    
    // 1. Haal alleen de afspraken voor de huidige student op
    const afsprakenQuery = query(collection(db, 'afspraken'), where('studentUid', '==', studentId));
    const afsprakenSnap = await getDocs(afsprakenQuery);

    if (afsprakenSnap.empty) {
      appointments.value = [];
      loading.value = false;
      return;
    }

    // 2. Verzamel de unieke bedrijf ID's van die afspraken
    const bedrijfIds = [...new Set(afsprakenSnap.docs.map(doc => doc.data().bedrijfId).filter(Boolean))];
    const bedrijvenMap = {};

    // 3. Haal alleen de benodigde bedrijfsdata op
    if (bedrijfIds.length > 0) {
      const bedrijvenQuery = query(collection(db, 'bedrijf'), where(documentId(), 'in', bedrijfIds));
      const bedrijvenSnap = await getDocs(bedrijvenQuery);
      bedrijvenSnap.forEach(docu => { bedrijvenMap[docu.id] = docu.data(); });
    }

    // 4. Combineer de data
    appointments.value = afsprakenSnap.docs.map(docu => {
      const data = docu.data();
      const bedrijf = bedrijvenMap[data.bedrijfId] || {};
      return {
        id: docu.id,
        ...data,
        status: data.status || 'upcoming',
        company: bedrijf.bedrijfsnaam || 'Onbekend Bedrijf',
        location: bedrijf.gesitueerdIn || 'Onbekend',
        duration: data.duur || '10 min',
        avatar: (bedrijf.bedrijfsnaam || '?')[0]
      };
    });
  } catch (e) {
    console.error("Fout bij ophalen van afspraken:", e);
    error.value = "De afspraken konden niet geladen worden. Probeer het later opnieuw.";
  } finally {
    loading.value = false;
  }
});

const filteredAppointments = computed(() => {
  if (activeFilter.value === 'all') return appointments.value;
  if (activeFilter.value === 'upcoming') return appointments.value.filter(a => a.status === 'upcoming');
  if (activeFilter.value === 'afgerond') return appointments.value.filter(a => a.status === 'afgerond');
  return appointments.value;
});

const editingAppointmentId = ref(null);
const showTimeModal = ref(false);
const selectedTimeSlot = ref(null);
const editingAppointmentOriginalTime = ref(null);
const timeSlots = ref([]);

function generateTimeSlots(start, end, duurMinuten) {
  const slots = [];
  let [h, m] = start.split(':').map(Number);
  let [eh, em] = end.split(':').map(Number);
  let startMinutes = h * 60 + m;
  const endMinutes = eh * 60 + em;
  while (startMinutes + duurMinuten <= endMinutes) {
    const fromH = String(Math.floor(startMinutes / 60)).padStart(2, '0');
    const fromM = String(startMinutes % 60).padStart(2, '0');
    const toMinutes = startMinutes + duurMinuten;
    const toH = String(Math.floor(toMinutes / 60)).padStart(2, '0');
    const toM = String(toMinutes % 60).padStart(2, '0');
    slots.push(`${fromH}:${fromM} - ${toH}:${toM}`);
    startMinutes += duurMinuten;
  }
  return slots;
}

function startEditTime(id) {
  editingAppointmentId.value = id;
  showTimeModal.value = true;
  const appt = appointments.value.find(a => a.id === id);
  editingAppointmentOriginalTime.value = appt?.time || null;
  selectedTimeSlot.value = appt?.time || null;
  // Dynamisch tijdslotten genereren
  const bedrijf = appt;
  let duur = bedrijf.duration || '10 minuten';
  let duurMin = parseInt(duur);
  if (isNaN(duurMin)) duurMin = 10;
  // Haal starttijd en eindtijd uit de bedrijfsdata, met fallback
  const start = bedrijf.starttijd || (bedrijf.startTijd ? bedrijf.startTijd : '10:00');
  const end = bedrijf.eindtijd || (bedrijf.eindTijd ? bedrijf.eindTijd : '16:00');
  timeSlots.value = generateTimeSlots(start, end, duurMin);
}

function closeTimeModal() {
  showTimeModal.value = false;
  editingAppointmentId.value = null;
  selectedTimeSlot.value = null;
  editingAppointmentOriginalTime.value = null;
}

function selectTimeSlot(slot) {
  selectedTimeSlot.value = slot;
}

async function saveTime(id, slot) {
  const appt = appointments.value.find(a => a.id === id);
  if (!appt) return;
  await updateDoc(doc(db, 'afspraken', id), { time: slot });
  appt.time = slot;
  closeTimeModal();
}

function isSlotTaken(slot) {
  return appointments.value.some(a => a.time === slot && a.id !== editingAppointmentId.value && a.status !== 'geannuleerd');
}

function loadAppointments() {
  console.log('Afspraken opnieuw geladen!');
}

watch(
  () => route.fullPath,
  (to, from) => {
    if (to === from) {
      loadAppointments();
    }
  }
);

const isStudent = () => true;

function getStatusText(status) {
  return {
    upcoming: 'Komend',
    afgerond: 'Afgerond',
    geannuleerd: 'Geannuleerd'
  }[status] || status;
}

function formatDate(dateString) {
  // Eenvoudige formattering: YYYY-MM-DD naar DD/MM/YYYY
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;
  return `${day}/${month}/${year}`;
}
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
.content-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}
.filter-knoppen {
  display: flex;
  gap: 0.5rem;
}
.filter-knop {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: #fff;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}
.filter-knop:hover {
  background-color: #f3f4f6;
}
.filter-knop.actief {
  background-color: #c20000;
  color: #fff;
  border-color: #c20000;
}
.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.appointment-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 25px;
  transition: all 0.2s ease;
  background: white;
}
.appointment-card:hover {
  border-color: #dc2626;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.1);
}
.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.company-info {
  display: flex;
  align-items: center;
  gap: 15px;
}
.company-logo {
  width: 50px;
  height: 50px;
  border: 2px solid #dc2626;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  color: #dc2626;
  font-weight: bold;
  font-size: 14px;
}
.company-details h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}
.job-title {
  color: #dc2626;
  font-size: 14px;
  font-weight: 500;
}
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}
.status-badge.upcoming {
  background-color: #dbeafe;
  color: #1e40af;
}
.status-badge.afgerond {
  background-color: #d1fae5;
  color: #065f46;
}
.status-badge.geannuleerd {
    background-color: #fee2e2;
    color: #991b1b;
}
/* Fallback voor onbekende status */
.status-badge:not(.upcoming):not(.afgerond):not(.geannuleerd) {
    background-color: #e5e7eb;
    color: #4b5563;
}
.appointment-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}
.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.detail-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}
.detail-content {
  flex: 1;
}
.detail-label {
  color: #9ca3af;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}
.detail-text {
  color: #374151;
  font-size: 14px;
  font-weight: 500;
}
.appointment-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}
.action-btn {
  flex: 1;
  padding: 12px 20px;
  border: 1px solid;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
}
.btn-edit {
  background: #f3f4f6;
  color: #374151;
  border-color: #d1d5db;
}
.btn-edit:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}
.btn-save {
  background: #16a34a;
  color: white;
  border-color: #16a34a;
}
.btn-save:hover {
  background: #15803d;
  border-color: #15803d;
}
.btn-cancel-edit {
  background: #f3f4f6;
  color: #dc2626;
  border-color: #e5e7eb;
}
.btn-cancel-edit:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}
.btn-cancel {
  background: #dc2626;
  color: white;
  border-color: #dc2626;
}
.btn-cancel:hover {
  background: #b91c1c;
  border-color: #b91c1c;
}
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}
.empty-state-icon {
  font-size: 48px;
  margin-bottom: 16px;
}
.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #6b7280;
}
.empty-state p {
  font-size: 14px;
  color: #9ca3af;
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  border-radius: 16px;
  padding: 2rem 2.5rem;
  min-width: 350px;
  max-width: 95vw;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  max-height: 80vh;
  overflow-y: auto;
}
.timeslot-grid {
  max-height: 350px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.timeslot-btn {
  padding: 0.7rem 1.2rem;
  border-radius: 20px;
  border: 1px solid #d1d5db;
  background: #f3f4f6;
  color: #222;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}
.timeslot-btn.selected {
  background: #16a34a;
  color: #fff;
  border-color: #16a34a;
}
.timeslot-btn.taken {
  background: #d1d5db;
  color: #888;
  cursor: not-allowed;
  border-color: #d1d5db;
}
.timeslot-btn:not(.taken):hover {
  background: #e5e7eb;
}
.modal-actions {
  display: flex;
  gap: 1rem;
  width: 100%;
  margin-top: 1rem;
}
</style>
