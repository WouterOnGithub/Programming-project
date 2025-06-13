
<template>
    <div class="container">
        <!Name text should get replaced with database/backedn>
      <h2 class="title">
        MATCH! 🎉<br />Deloitte wilt een gesprek met u,<br />Kies een tijdslot:</h2>
  
      <div class="grid">
        <button
          v-for="slot in timeSlots"
          :key="slot"
          :class="getButtonClass(slot)"
          :disabled="isTaken(slot) || selectedSlot"
          @click="handleClick(slot)"
        >
          {{ slot }}
        </button>
      </div>
  
      <div class="popup" v-if="confirmingSlot">
        <div class="popup-content">
          <p>Bent u zeker dat u <strong>{{ confirmingSlot }}</strong> wilt kiezen? Dit kan niet ongedaan worden.</p>
          <div class="popup-actions">
            <button @click="confirmSelection">Ja</button>
            <button @click="cancelSelection">Nee</button>
          </div>
        </div>
      </div>
  
      <button class="Back-button">Terug naar dashboard</button>
    </div>
  </template>
  
  <script setup>
import '../../css/KiesTijdStudent.css'
import { ref, reactive, onMounted } from 'vue'
  
  // Replace this with backend or real-time sync when ready
  const sharedTakenSlots = reactive(new Set(['10:00', '11:00'])) // Simulate other picking a timeslot
  
  const timeSlots = [
    '10:00', '10:15', '10:30',
    '10:45', '11:00', '11:15',
    '11:30', '11:45', '12:00',
    '13:00', '13:15', '13:30',
    '13:45', '14:00', '14:15',
    '14:30', '14:45', '15:00'
  ]
  
  const selectedSlot = ref(null)
  const confirmingSlot = ref(null)
  
  const handleClick = (slot) => {
    if (!isTaken(slot) && !selectedSlot.value) {
      confirmingSlot.value = slot
    }
  }
  
  const confirmSelection = () => {
    sharedTakenSlots.add(confirmingSlot.value)
    selectedSlot.value = confirmingSlot.value
    confirmingSlot.value = null
  }
  
  const cancelSelection = () => {
    confirmingSlot.value = null
  }
  
  const isTaken = (slot) => {
    return sharedTakenSlots.has(slot) && slot !== selectedSlot.value
  }
  
  const getButtonClass = (slot) => {
    if (selectedSlot.value === slot) return 'slot-button selected'
    if (isTaken(slot)) return 'slot-button taken'
    return 'slot-button'
  }
  </script>