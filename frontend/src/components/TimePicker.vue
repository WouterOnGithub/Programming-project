<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
    default: '10:00'
  },
  label: {
    type: String,
    required: true
  },
  min: {
    type: String,
    default: '00:00'
  },
  max: {
    type: String,
    default: '23:59'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const selectedHour = ref(props.modelValue.split(':')[0])
const selectedMinute = ref(props.modelValue.split(':')[1])

const minHour = computed(() => parseInt(props.min.split(':')[0]))
const minMinute = computed(() => parseInt(props.min.split(':')[1]))
const maxHour = computed(() => parseInt(props.max.split(':')[0]))
const maxMinute = computed(() => parseInt(props.max.split(':')[1]))

const hours = computed(() => {
  const h = []
  for (let i = minHour.value; i <= maxHour.value; i++) {
    h.push(i.toString().padStart(2, '0'))
  }
  return h
})

const minutes = computed(() => {
  const allMinutes = ['00', '15', '30', '45'];
  const currentHour = parseInt(selectedHour.value);
  
  if (currentHour === maxHour.value) {
    return allMinutes.filter(m => parseInt(m) <= maxMinute.value);
  }
  
  if (currentHour === minHour.value) {
    return allMinutes.filter(m => parseInt(m) >= minMinute.value);
  }
  
  return allMinutes;
})

watch(selectedHour, (newHourStr) => {
    const newHour = parseInt(newHourStr);
    const currentMinute = parseInt(selectedMinute.value);

    // Als het geselecteerde uur het maximum uur is en de minuut ongeldig is, reset de minuut.
    if (newHour === maxHour.value && currentMinute > maxMinute.value) {
        selectedMinute.value = maxMinute.value.toString().padStart(2, '0');
    }
    // Als het geselecteerde uur het minimum uur is en de minuut ongeldig is, reset de minuut.
    if (newHour === minHour.value && currentMinute < minMinute.value) {
        selectedMinute.value = minMinute.value.toString().padStart(2, '0');
    }
});

watch([selectedHour, selectedMinute], () => {
  const newTime = `${selectedHour.value}:${selectedMinute.value}`
  if (newTime !== props.modelValue) {
    emit('update:modelValue', newTime)
  }
})

watch(() => props.modelValue, (newVal) => {
  const [hour, minute] = newVal.split(':');
  selectedHour.value = hour;
  selectedMinute.value = minute;
});

</script>

<template>
  <div class="time-picker-group">
    <label>{{ label }}</label>
    <div class="time-picker-inputs">
      <select v-model="selectedHour" class="time-picker-select" :disabled="disabled">
        <option v-for="hour in hours" :key="hour" :value="hour">{{ hour }}</option>
      </select>
      <span>:</span>
      <select v-model="selectedMinute" class="time-picker-select" :disabled="disabled">
        <option v-for="minute in minutes" :key="minute" :value="minute">{{ minute }}</option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.time-picker-group {
  display: flex;
  flex-direction: column;
}

.time-picker-group label {
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
}

.time-picker-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.time-picker-inputs span {
  font-size: 1.2rem;
  font-weight: bold;
}

.time-picker-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f8f9fa;
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27292.4%27%20height%3D%27292.4%27%3E%3Cpath%20fill%3D%27%23007CB2%27%20d%3D%27M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%27%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 0.7em top 50%, 0 0;
  background-size: 0.65em auto, 100%;
}

.time-picker-select:disabled {
  background-color: #ececec;
  color: #b0b0b0;
  cursor: not-allowed;
}
</style> 