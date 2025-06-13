<template>
  <div class="aula-selector">
    <div class="aula-title">
      <h2 v-if="!selectedAula && !confirmingAula" class="responsive-text static-header">
        In welke aula wilt u zich bevinden?
      </h2>
      <h2 v-if="selectedAula && !confirmingAula" class="responsive-text">
        U bevindt zich in {{ selectedAula }}.
      </h2>
    </div>

    <div class="aula-button-groups" v-if="!confirmingAula">
      <div class="aula-buttons" v-for="group in buttonGroups" :key="group[0]">
        <button v-for="aula in group" :key="aula" :class="getAulaClass(aula)" @click="handleAulaClick(aula)"
          :disabled="isTaken(aula) || selectedAula">
          {{ aula }}
        </button>
      </div>
    </div>

    <div class="popup-overlay" v-if="confirmingAula">
      <div class="popup-box">
        <p class="responsive-text">Bent u zeker dat u zich in {{ confirmingAula }} wilt bevinden?</p>
        <div class="warning-box">
          <strong class="warning-title">⚠️ Warning</strong>
          <p class="warning-text">Dit kan niet ongedaan worden.</p>
        </div>
        <div class="popup-buttons edge-align">
          <button @click="confirmSelection">Ja</button>
          <button @click="cancelSelection">Nee</button>
        </div>
      </div>
    </div>

    <img class="grondplan" src="../../../public/Images/grondplan.png" alt="Grondplan" />
    <button class="back-button">
      Terug naar profiel
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import '../../css/GrondplanKeuze.css'

const aulas = [
  'Aula 1', 'Aula 2', 'Aula 3', 'Aula 4', 'Aula 5', 'Aula 6',
  'Aula 7', 'Aula 8', 'Aula 9', 'Aula 10', 'Aula 11', 'Aula 12'
]

const selectedAula = ref(null)
const confirmingAula = ref(null)
const takenAulas = ref(['Aula 2', 'Aula 7'])
const windowWidth = ref(window.innerWidth)

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateWindowWidth)
})

const handleAulaClick = (aula) => {
  if (!isTaken(aula) && !selectedAula.value && !confirmingAula.value) {
    confirmingAula.value = aula
  }
}

const confirmSelection = () => {
  selectedAula.value = confirmingAula.value
  confirmingAula.value = null
}

const cancelSelection = () => {
  confirmingAula.value = null
}

const isTaken = (aula) => {
  return takenAulas.value.includes(aula) && aula !== selectedAula.value
}

const getAulaClass = (aula) => {
  if (selectedAula.value === aula) return 'aula-button selected'
  if (isTaken(aula)) return 'aula-button taken'
  return 'aula-button'
}

const groupSize = computed(() => {
  const width = windowWidth.value
  if (width > 1000) return 6
  if (width > 600) return 3
  return 2
})

const buttonGroups = computed(() => {
  const groups = []
  for (let i = 0; i < aulas.length; i += groupSize.value) {
    groups.push(aulas.slice(i, i + groupSize.value))
  }
  return groups
})
</script>
