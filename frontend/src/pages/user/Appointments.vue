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
              @click="setFilter('geannuleerd')" 
              :class="['filter-knop', { 'actief': activeFilter === 'geannuleerd' }]">
              Geannuleerd
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
                  <div v-if="appointment.hasSpecificLocation" class="location-info">
                    <div class="detail-text">Stand {{ appointment.location }}</div>
                    <router-link :to="'/student/grondplan/' + appointment.bedrijfId" class="map-link">
                      Zie op grondplan
                    </router-link>
                  </div>
                  <div v-else class="detail-text no-location">
                    Dit bedrijf heeft nog geen locatie.
                  </div>
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

            <div v-if="appointment.status === 'geannuleerd' && appointment.annuleringsReden" class="cancellation-reason">
              <div class="reason-header">Reden van annulering:</div>
              <p class="reason-text">"{{ appointment.annuleringsReden }}"</p>
            </div>

            <div v-if="appointment.status === 'upcoming'" class="appointment-actions">
              <button class="action-btn btn-edit" @click="startEditTime(appointment.id)">🕒 Aanpassen</button>
              <button class="action-btn btn-cancel" @click="openCancelConfirmModal(appointment.id)">❌ Annuleren</button>
            </div>
          </div>
        </div>
      </section>

      <!-- Modal voor tijdslot selectie -->
      <div v-if="showTimeModal" class="modal-overlay">
        <div class="modal-content stmatch-modal">
          <h3>Kies een tijdslot voor je gesprek</h3>
          <div class="timeslot-grid stmatch-grid">
            <template v-for="slot in timeSlots" :key="slot">
              <button
                :disabled="getSlotStatus(slot).status !== 'free'"
                :class="['timeslot-btn stmatch-btn', { 
                  'pauze': getSlotStatus(slot).status === 'pauze', 
                  'taken-by-other': getSlotStatus(slot).status === 'taken_by_other',
                  'taken-by-me': getSlotStatus(slot).status === 'taken_by_me',
                  'selected': selectedTimeSlot === slot 
                }]"
                @click="getSlotStatus(slot).status === 'free' && selectTimeSlot(slot)"
              >
                <div v-if="getSlotStatus(slot).status === 'taken_by_me'" class="taken-by-me-content">
                  <span class="main-time">{{ slot }}</span>
                  <span class="sub-text">Al geboekt bij: {{ getSlotStatus(slot).companyName }}</span>
                </div>
                <span v-else>{{ slot }}</span>
              </button>
            </template>
          </div>
          <div class="modal-actions stmatch-actions">
            <button class="action-btn btn-save stmatch-save" :disabled="!selectedTimeSlot" @click="saveTime(editingAppointmentId, selectedTimeSlot)">Bevestig</button>
            <button class="action-btn btn-cancel-edit stmatch-cancel" @click="closeTimeModal">Annuleren</button>
          </div>
        </div>
      </div>

      <!-- Nieuwe Modal voor Annuleerbevestiging -->
      <div v-if="showCancelConfirmModal" class="modal-overlay">
        <div class="modal-content confirmation-modal">
          <h3>Afspraak Annuleren</h3>
          <p>Weet u zeker dat u deze afspraak wilt annuleren? Deze actie kan niet ongedaan gemaakt worden.</p>
          <div class="modal-actions">
            <button class="action-btn btn-cancel-edit" @click="closeCancelConfirmModal">Terug</button>
            <button class="action-btn btn-cancel" @click="confirmCancellation">Ja, annuleer</button>
          </div>
        </div>
      </div>
    </main>
  </StudentDashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import StudentDashboardLayout from '../../components/StudentDashboardLayout.vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  documentId,
  onSnapshot,
  getDoc,
} from 'firebase/firestore';
import { notificationService } from '../../services/notificationService';
import { useToast } from 'vue-toastification';

const toast = useToast();
const db = getFirestore();
const auth = getAuth();
const route = useRoute();

const activeFilter = ref('all');
const appointments = ref([]);
const loading = ref(true);
const error = ref(null);
let appointmentsUnsubscribe = null;

const setFilter = (filter) => {
  activeFilter.value = filter;
  toast.info(`Filter gewijzigd naar "${filter}"`, { timeout: 2000 });
};

const setupAppointmentsListener = (studentId) => {
  const afsprakenQuery = query(collection(db, 'afspraken'), where('studentUid', '==', studentId));

  appointmentsUnsubscribe = onSnapshot(
    afsprakenQuery,
    async (afsprakenSnap) => {
      if (afsprakenSnap.empty) {
        appointments.value = [];
        loading.value = false;
        return;
      }

      const bedrijfIds = [
        ...new Set(afsprakenSnap.docs.map((doc) => doc.data().bedrijfId).filter(Boolean)),
      ];
      const bedrijvenMap = {};
      const locatiesMap = {};

      if (bedrijfIds.length > 0) {
        // Haal bedrijven op
        const bedrijvenQuery = query(collection(db, 'bedrijf'), where(documentId(), 'in', bedrijfIds));
        const bedrijvenSnap = await getDocs(bedrijvenQuery);
        bedrijvenSnap.forEach((docu) => {
          bedrijvenMap[docu.id] = docu.data();
        });
        // Haal locaties op
        const locatiesQuery = query(collection(db, 'companyLocations'), where('companyId', 'in', bedrijfIds));
        const locatiesSnap = await getDocs(locatiesQuery);
        locatiesSnap.forEach((docu) => {
          locatiesMap[docu.data().companyId] = docu.data();
        });
      }

      appointments.value = afsprakenSnap.docs.map((docu) => {
        const data = docu.data();
        const bedrijf = bedrijvenMap[data.bedrijfId] || {};
        const locatie = locatiesMap[data.bedrijfId];
        return {
          id: docu.id,
          ...data,
          status: data.status || 'upcoming',
          company: bedrijf.bedrijfsnaam || 'Onbekend Bedrijf',
          position: Array.isArray(bedrijf.opZoekNaar) ? bedrijf.opZoekNaar.join(', ') : (bedrijf.opZoekNaar || '-'),
          location: locatie?.locationName,
          hasSpecificLocation: !!locatie?.locationName,
          duration: bedrijf.gesprekDuur ? `${bedrijf.gesprekDuur} min` : (data.duur || '10 min'),
          avatar: (bedrijf.bedrijfsnaam || '?')[0],
          annuleringsReden: data.annuleringsReden || null,
          bedrijfId: data.bedrijfId
        };
      });

      loading.value = false;
    },
    (err) => {
      console.error('Fout bij ophalen van afspraken:', err);
      error.value = 'De afspraken konden niet geladen worden. Probeer het later opnieuw.';
      loading.value = false;
      toast.error('Fout bij het laden van afspraken.');
    }
  );
};

onMounted(() => {
  const authUnsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      if (appointmentsUnsubscribe) appointmentsUnsubscribe();
      setupAppointmentsListener(user.uid);
    } else {
      if (appointmentsUnsubscribe) appointmentsUnsubscribe();
      appointments.value = [];
      loading.value = false;
      error.value = 'U moet ingelogd zijn om uw afspraken te zien.';
    }
  });

  onBeforeUnmount(() => {
    authUnsubscribe();
  });
});

onBeforeUnmount(() => {
  if (appointmentsUnsubscribe) {
    appointmentsUnsubscribe();
  }
});

const filteredAppointments = computed(() => {
  if (activeFilter.value === 'all') return appointments.value;
  if (activeFilter.value === 'geannuleerd') return appointments.value.filter((a) => a.status === 'geannuleerd');
  if (activeFilter.value === 'upcoming') return appointments.value.filter((a) => a.status === 'upcoming');
  if (activeFilter.value === 'afgerond') return appointments.value.filter((a) => a.status === 'afgerond');
  return appointments.value;
});

const editingAppointmentId = ref(null);
const showTimeModal = ref(false);
const selectedTimeSlot = ref(null);
const editingAppointmentOriginalTime = ref(null);
const timeSlots = ref([]);
const takenSlots = ref([]);
const studentTakenSlots = ref([]);
const showCancelConfirmModal = ref(false);
const appointmentToCancelId = ref(null);

function generateTimeSlots(startTime, endTime, durationString) {
  const slots = [];
  const duration = parseInt(durationString.match(/\d+/)[0], 10);
  const lunchStart = 12;
  const lunchEnd = 13;

  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  let currentTime = parseTime(startTime);
  const endDateTime = parseTime(endTime);

  const startMinutes = currentTime.getMinutes();
  const remainder = startMinutes % duration;
  if (remainder !== 0) {
    currentTime.setMinutes(startMinutes + (duration - remainder));
  }

  let pauzeToegevoegd = false;

  while (currentTime < endDateTime) {
    const slotStart = new Date(currentTime);
    const slotEnd = new Date(currentTime.getTime() + duration * 60000);
    const slotStartHour = slotStart.getHours();

    if (slotStartHour >= lunchStart && slotStartHour < lunchEnd) {
      if (!pauzeToegevoegd) {
        slots.push('Pauze');
        pauzeToegevoegd = true;
      }
      currentTime.setMinutes(currentTime.getMinutes() + duration);
      continue;
    }

    if (slotEnd > endDateTime) break;

    const formatTime = (date) => date.toTimeString().substring(0, 5);
    slots.push(`${formatTime(slotStart)} - ${formatTime(slotEnd)}`);

    currentTime = slotEnd;
  }
  return slots;
}

const startEditTime = async (appointmentId) => {
  const appointment = appointments.value.find((a) => a.id === appointmentId);
  if (!appointment) return;

  editingAppointmentId.value = appointmentId;
  selectedTimeSlot.value = null;
  editingAppointmentOriginalTime.value = appointment.time;

  try {
    const bedrijfDocRef = doc(db, 'bedrijf', appointment.bedrijfId);
    const bedrijfDoc = await getDoc(bedrijfDocRef);
    if (!bedrijfDoc.exists()) throw new Error('Bedrijf niet gevonden');

    const bedrijfData = bedrijfDoc.data();
    const { starttijd, eindtijd, gesprekDuur } = bedrijfData;

    if (!starttijd || !eindtijd || !gesprekDuur) {
      timeSlots.value = ['Geen tijden beschikbaar'];
    } else {
      timeSlots.value = generateTimeSlots(starttijd, eindtijd, gesprekDuur);
    }

    const afsprakenSnap = await getDocs(
      query(collection(db, 'afspraken'), where('bedrijfId', '==', appointment.bedrijfId))
    );
    takenSlots.value = afsprakenSnap.docs.map((d) => d.data().time);

    const studentId = auth.currentUser?.uid;
    if (studentId) {
      const studentAfsprakenSnap = await getDocs(query(collection(db, 'afspraken'), where('studentUid', '==', studentId)));
      
      const afsprakenMetBedrijf = await Promise.all(studentAfsprakenSnap.docs.map(async (apptDoc) => {
        const apptData = apptDoc.data();
        if (!apptData.bedrijfId) return null;
        const bedrijfDoc = await getDoc(doc(db, 'bedrijf', apptData.bedrijfId));
        return {
          time: apptData.time,
          companyName: bedrijfDoc.exists() ? bedrijfDoc.data().bedrijfsnaam : 'een ander bedrijf'
        };
      }));

      studentTakenSlots.value = afsprakenMetBedrijf.filter(Boolean);

    } else {
      studentTakenSlots.value = [];
    }

    showTimeModal.value = true;
  } catch (err) {
    console.error('Fout bij ophalen van tijdsloten:', err);
    toast.error('Tijdsloten konden niet worden geladen.');
  }
};

function closeTimeModal() {
  showTimeModal.value = false;
  editingAppointmentId.value = null;
  selectedTimeSlot.value = null;
  editingAppointmentOriginalTime.value = null;
}

function selectTimeSlot(slot) {
  selectedTimeSlot.value = slot;
}

const parseSlotToDates = (slotString) => {
  if (!slotString || !slotString.includes(' - ')) return null;
  const [startTimeStr, endTimeStr] = slotString.split(' - ');
  const startDate = new Date();
  const [startHours, startMinutes] = startTimeStr.trim().split(':').map(Number);
  startDate.setHours(startHours, startMinutes, 0, 0);

  const endDate = new Date();
  const [endHours, endMinutes] = endTimeStr.trim().split(':').map(Number);
  endDate.setHours(endHours, endMinutes, 0, 0);

  return { start: startDate, end: endDate };
}

const doTimeRangesOverlap = (range1, range2) => {
  if (!range1 || !range2) return false;
  return range1.start < range2.end && range1.end > range2.start;
}

async function saveTime(id, slot) {
  const appt = appointments.value.find((a) => a.id === id);
  if (!appt) return;
  try {
    await updateDoc(doc(db, 'afspraken', id), { time: slot });
    appt.time = slot;
    closeTimeModal();
    toast.success('Afspraak succesvol aangepast.');
  } catch (err) {
    console.error('Fout bij opslaan:', err);
    toast.error('Er ging iets mis bij het aanpassen van de afspraak.');
  }
}

function getSlotStatus(slot) {
  if (slot === 'Pauze') {
    return { status: 'pauze' };
  }
  if (slot === editingAppointmentOriginalTime.value) {
    return { status: 'free' };
  }

  // Exacte match voor andere studenten bij dit bedrijf
  if (takenSlots.value.includes(slot) && slot !== editingAppointmentOriginalTime.value) {
    return { status: 'taken_by_other' };
  }

  // Overlap check voor afspraken van de student zelf
  const currentSlotRange = parseSlotToDates(slot);
  for (const studentAppointment of studentTakenSlots.value) {
    // Sla de afspraak die we nu aanpassen over in de check
    if (studentAppointment.time === editingAppointmentOriginalTime.value) {
      continue;
    }
    const existingSlotRange = parseSlotToDates(studentAppointment.time);
    if (doTimeRangesOverlap(currentSlotRange, existingSlotRange)) {
      return { status: 'taken_by_me', companyName: studentAppointment.companyName };
    }
  }

  return { status: 'free' };
}

const openCancelConfirmModal = (appointmentId) => {
  appointmentToCancelId.value = appointmentId;
  showCancelConfirmModal.value = true;
};

const closeCancelConfirmModal = () => {
  showCancelConfirmModal.value = false;
  appointmentToCancelId.value = null;
};

const confirmCancellation = async () => {
  if (!appointmentToCancelId.value) return;

  try {
    const appointment = appointments.value.find((a) => a.id === appointmentToCancelId.value);
    if (!appointment) return;

    await updateDoc(doc(db, 'afspraken', appointmentToCancelId.value), {
      status: 'geannuleerd',
    });

    const studentId = auth.currentUser?.uid;
    const studentDoc = await getDoc(doc(db, 'student', studentId));
    const studentData = studentDoc.exists() ? studentDoc.data() : {};
    const studentName = `${studentData.voornaam || 'Onbekende'} ${studentData.achternaam || 'Student'}`;

    await notificationService.createCompanyAppointmentCancelledNotification(
      appointment.bedrijfId,
      studentName,
      'Geannuleerd door student'
    );

    closeCancelConfirmModal();
    toast.success('Afspraak geannuleerd.');
  } catch (error) {
    console.error('Fout bij annuleren van afspraak:', error);
    toast.error('Er ging iets mis bij het annuleren van de afspraak.');
  }
};

function getStatusText(status) {
  switch (status) {
    case 'upcoming':
      return 'Komend';
    case 'afgerond':
      return 'Afgerond';
    case 'geannuleerd':
      return 'Geannuleerd';
    default:
      return status;
  }
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
  flex-wrap: wrap;
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
  background-color: #fef2f2;
  color: #ef4444;
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
  background-color: #16a34a;
  color: white;
}
.btn-save:hover:not(:disabled) {
  background-color: #15803d;
}
.btn-cancel-edit {
  background-color: #f3f4f6;
  color: #dc2626;
  border: 1px solid #e5e7eb;
}
.btn-cancel-edit:hover {
  background-color: #e5e7eb;
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
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.timeslot-btn {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}
.timeslot-btn:hover:not(:disabled):not(.pauze) {
  border-color: #c20000;
  background: #fef2f2;
  color: #c20000;
}
.timeslot-btn.selected {
  border-color: #c20000;
  background: #c20000;
  color: white;
}
.timeslot-btn.taken {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
  border-color: #d1d5db;
}
.timeslot-btn.pauze {
  background: #fef3c7;
  color: #92400e;
  border-color: #f59e0b;
  cursor: not-allowed;
  font-weight: 600;
}
.timeslot-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.modal-actions {
  display: flex;
  gap: 1rem;
  width: 100%;
  margin-top: 1rem;
}
.timeslot-break {
  grid-column: 1 / -1;
  text-align: center;
  font-weight: 600;
  color: #6c757d;
  background-color: #f8f9fa;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}
.cancellation-reason {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
}
.reason-header {
  font-weight: 600;
  color: #b91c1c;
  margin-bottom: 0.5rem;
}
.reason-text {
  margin: 0;
  color: #dc2626;
  font-style: italic;
}
.confirmation-modal {
  max-width: 450px;
  text-align: center;
}
.confirmation-modal h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}
.confirmation-modal p {
  color: #6b7280;
  margin: 1rem 0 1.5rem;
  line-height: 1.6;
}

.modal-actions button:hover {
  opacity: 0.9;
}

.timeslot-btn.taken-by-other {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
  border-color: #d1d5db;
}
.timeslot-btn.taken-by-me {
  background: #fff;
  border-color: #d1d5db;
  cursor: not-allowed;
  padding: 0.5rem;
  height: auto;
}

.taken-by-me-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1.2;
}

.taken-by-me-content .main-time {
  font-weight: 500;
  color: #9ca3af;
}

.taken-by-me-content .sub-text {
  font-size: 0.75rem;
  color: #dc2626;
  font-weight: 500;
}

/* --- STMATCH MODAL STIJL --- */
.stmatch-modal {
  background-color: white;
  padding: 2rem;
  border-radius: 0.5rem;
  width: 80%;
  max-width: 400px;
}
.stmatch-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.stmatch-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: #fff;
  cursor: pointer;
  transition: background-color 0.2s;
}
.stmatch-btn:hover {
  background-color: #f3f4f6;
}
.stmatch-btn.selected {
  background-color: #c20000;
  color: #fff;
}
.stmatch-btn.taken-by-other {
  background-color: #f3f4f6;
  cursor: not-allowed;
  color: #9ca3af;
}
.stmatch-btn.taken-by-me {
  background-color: #fff;
  border-color: #d1d5db;
  cursor: not-allowed;
  padding: 0.5rem;
  height: auto;
}
.stmatch-btn.pauze {
  background-color: #e5e7eb;
  color: #6b7280;
  cursor: not-allowed;
  font-style: italic;
}
.stmatch-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}
.stmatch-save {
  background-color: #c20000;
  color: #fff;
}
.stmatch-save:hover:not(:disabled) {
  background-color: #b91c1c;
}
.stmatch-cancel {
  background-color: #f3f4f6;
}
.stmatch-cancel:hover {
  background-color: #e5e7eb;
}
.location-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.map-link {
  font-size: 0.8rem;
  font-weight: 600;
  color: #c20000;
  text-decoration: underline;
  margin-top: 4px;
  cursor: pointer;
}

.map-link:hover {
  color: #991b1b;
}

.no-location {
  font-style: italic;
  font-size: 0.85rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .content-section {
    padding: 0;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .section-title {
    text-align: center;
    font-size: 1.25rem;
  }

  .filter-knoppen {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .filter-knop {
    padding: 0.6rem;
    font-size: 0.875rem;
    text-align: center;
  }

  .appointments-list {
    padding: 1rem;
  }

  .appointment-card {
    padding: 1rem;
  }

  .appointment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .company-info {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .status-badge {
    align-self: flex-start;
  }

  .appointment-details {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
    padding-top: 1rem;
    margin-top: 1rem;
    border-top: 1px solid #f0f0f0;
  }

  .detail-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .appointment-actions {
    flex-direction: column;
    gap: 0.5rem;
    padding-top: 1rem;
    margin-top: 1rem;
    border-top: 1px solid #f0f0f0;
  }

  .action-btn {
    width: 100%;
  }

  .modal-content {
    width: 90vw;
    max-width: 500px;
  }

  .timeslot-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 0.75rem;
  }
}
</style>
