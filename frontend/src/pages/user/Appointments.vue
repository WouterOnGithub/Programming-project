<template>
  <div class="dashboard-container">
    <aside class="sidebar-nav">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <i class="fas fa-graduation-cap"></i>
        </div>
        <div>
          <h1 class="sidebar-title">StudentMatch</h1>
          <p class="sidebar-subtitle">Student Dashboard</p>
        </div>
      </div>
      <nav class="sidebar-menu">
        <router-link v-for="item in navigation" :key="item.name" :to="item.href" :class="['sidebar-link', $route.path === item.href ? 'active' : '']">
          <i :class="item.icon"></i>
          {{ item.name }}
        </router-link>
      </nav>
      <div class="sidebar-user">
        <div class="sidebar-user-avatar">
          <i class="fas fa-user"></i>
        </div>
        <div>
          <p class="sidebar-user-name">{{ userData?.name || 'Gebruiker' }}</p>
          <p class="sidebar-user-role">Student</p>
        </div>
      </div>
    </aside>
    <main class="dashboard-main">
      <header class="dashboard-header">
        <div>
          <h1>Welkom terug, {{ userData?.name || 'Gebruiker' }}!</h1>
          <p>Hier is je afspraken overzicht</p>
        </div>
        <div class="dashboard-header-actions">
          <div class="dashboard-search">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="Zoeken..." />
          </div>
          <button class="dashboard-bell">
            <i class="fas fa-bell"></i>
            <span class="dashboard-bell-dot"></span>
          </button>
          <div class="dashboard-profile-avatar">{{ userData?.name?.[0] || 'G' }}</div>
        </div>
      </header>
      <section class="content-section">
        <div class="section-header">
          <h2 class="section-title">Komende Afspraken</h2>
          <div class="filter-tabs">
            <button class="filter-tab" :class="{ active: activeFilter === 'all' }" @click="setFilter('all')">Alle</button>
            <button class="filter-tab" :class="{ active: activeFilter === 'upcoming' }" @click="setFilter('upcoming')">Komend</button>
            <button class="filter-tab" :class="{ active: activeFilter === 'completed' }" @click="setFilter('completed')">Afgerond</button>
          </div>
        </div>

        <div v-if="filteredAppointments.length" class="appointments-list">
          <div v-for="appointment in filteredAppointments" :key="appointment.id" class="appointment-card">
            <div class="appointment-header">
              <div class="company-info">
                <div class="company-logo">{{ appointment.company.charAt(0) }}</div>
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
                <div class="detail-icon">📅</div>
                <div class="detail-content">
                  <div class="detail-label">Datum</div>
                  <div class="detail-text">{{ formatDate(appointment.date) }}</div>
                </div>
              </div>
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

            <div v-if="appointment.status !== 'completed'" class="appointment-actions">
              <button class="action-btn btn-edit" @click="startEditTime(appointment.id)">🕒 Aanpassen</button>
              <button class="action-btn btn-cancel" @click="cancelAppointment(appointment.id)">❌ Annuleren</button>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-state-icon">📭</div>
          <h3>Er is een fout opgetreden bij het ophalen van de afspraken</h3>
          <p>Geen afspraken gevonden voor dit filter.</p>
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: 'fas fa-chart-pie' },
  { name: 'Job Swiping', href: '/swipe', icon: 'fas fa-heart' },
  { name: 'Afspraken', href: '/afspraken', icon: 'fas fa-calendar' },
  { name: 'Profiel', href: '/profile', icon: 'fas fa-user' },
  { name: 'Instellingen', href: '/settings', icon: 'fas fa-cog' },
];
const userData = ref({ name: 'imad' }); // Dummy data, vervang door echte user info indien nodig

const activeFilter = ref('all');

const appointments = ref([
  {
    id: 1,
    company: 'Deloitte',
    position: 'Junior IT Consultant',
    date: '2026-03-13',
    time: '14:00 - 14:30',
    location: 'Aula 1',
    duration: '30 minuten',
    status: 'upcoming'
  },
  {
    id: 2,
    company: 'ASML',
    position: 'Software Engineer Intern',
    date: '2026-03-13',
    time: '10:30 - 11:00',
    location: 'Aula 2',
    duration: '30 minuten',
    status: 'today'
  },
  {
    id: 3,
    company: 'Philips',
    position: 'UX Design Trainee',
    date: '2026-03-13',
    time: '15:15 - 15:45',
    location: 'Aula 3',
    duration: '30 minuten',
    status: 'upcoming'
  },
  {
    id: 4,
    company: 'ING Bank',
    position: 'Data Analyst Stage',
    date: '2026-03-13',
    time: '11:00 - 11:30',
    location: 'Aula 4',
    duration: '30 minuten',
    status: 'completed'
  }
]);

const filteredAppointments = computed(() => {
  if (activeFilter.value === 'all') return appointments.value;
  return appointments.value.filter(a => a.status === activeFilter.value);
});

const editingAppointmentId = ref(null);
const showTimeModal = ref(false);
const selectedTimeSlot = ref(null);
const editingAppointmentOriginalTime = ref(null);
const timeSlots = [
  '10:00 - 10:30',
  '10:30 - 11:00',
  '11:00 - 11:30',
  '11:30 - 12:00',
  '12:00 - 12:30',
  '12:30 - 13:00',
  '13:00 - 13:30',
  '13:30 - 14:00',
  '14:00 - 14:30',
  '14:30 - 15:00',
  '15:00 - 15:30',
  '15:30 - 16:00',
];

function setFilter(filter) {
  activeFilter.value = filter;
}

function getStatusText(status) {
  return {
    upcoming: 'Komend',
    today: 'Komend',
    completed: 'Afgerond'
  }[status] || status;
}

function formatDate(dateString) {
  return 'vrijdag 13 maart 2026';
}

function startEditTime(id) {
  editingAppointmentId.value = id;
  showTimeModal.value = true;
  const apt = appointments.value.find(a => a.id === id);
  selectedTimeSlot.value = apt?.time || null;
  editingAppointmentOriginalTime.value = apt?.time || null;
}

function closeTimeModal() {
  showTimeModal.value = false;
  editingAppointmentId.value = null;
  selectedTimeSlot.value = null;
  editingAppointmentOriginalTime.value = null;
}

function selectTimeSlot(slot) {
  if (!isSlotTaken(slot) || slot === editingAppointmentOriginalTime.value) {
    selectedTimeSlot.value = slot;
  }
}

function isSlotTaken(slot) {
  return appointments.value.some(
    a => a.id !== editingAppointmentId.value && a.time === slot
  );
}

function saveTime(id, newTime) {
  const apt = appointments.value.find(a => a.id === id);
  if (apt) {
    apt.time = newTime;
  }
  closeTimeModal();
}

function cancelAppointment(id) {
  const index = appointments.value.findIndex(a => a.id === id);
  if (index !== -1 && confirm(`Weet je zeker dat je de afspraak met ${appointments.value[index].company} wilt annuleren?`)) {
    appointments.value.splice(index, 1);
    alert('Afspraak succesvol geannuleerd!');
  }
}

function getAvailableTimeSlots(appointmentId) {
  const currentApt = appointments.value.find(a => a.id === appointmentId);
  const takenSlots = appointments.value
    .filter(a => a.id !== appointmentId)
    .map(a => a.time);
  return timeSlots.filter(slot => !takenSlots.includes(slot) || slot === currentApt.time);
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
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}
.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}
.filter-tabs {
  display: flex;
  gap: 8px;
}
.filter-tab {
  padding: 8px 20px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #374151;
}
.filter-tab.active {
  background: #dc2626;
  color: white;
  border-color: #dc2626;
}
.filter-tab:hover:not(.active) {
  background: #f3f4f6;
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
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.status-badge.upcoming {
  background: #d1fae5;
  color: #065f46;
}
.status-badge.today {
  background: #fef3c7;
  color: #92400e;
}
.status-badge.completed {
  background: #dbeafe;
  color: #1e40af;
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
}
.timeslot-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin: 1.5rem 0;
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
