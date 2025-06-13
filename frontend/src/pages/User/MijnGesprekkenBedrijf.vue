<template>
    <div class="schedule-container">
      <table class="schedule-table">
        <thead>
          <tr class="schedule-header">
            <th>Uur</th>
            <th>Student</th>
            <th>Aula</th>
          </tr>
        </thead>
        <tbody>
          <tr class="schedule-row" v-for="item in schedule" :key="item.time">
            <td>{{ item.time }}</td>
            <td><strong>{{ item.name }}</strong></td>
            <td>{{ item.aula }}</td>
          </tr>
        </tbody>
      </table>
  
      <button class="continue-button">Verder zoeken</button>
    </div>
  </template>
  
  <script setup>
  import '../../css/MijnGesprekkenBedrijf.css'
  const schedule = [
    { time: '12:20', name: 'Jonathan Primo', aula: '6' },
    { time: '12:40', name: 'Noor Denoir', aula: '3' },
    { time: '13:00', name: 'Milan Snap', aula: '1' },
    { time: '13:20', name: 'Lotte Vermeer', aula: '11' },
    { time: '13:40', name: 'Yannick Broos', aula: '4' }
  ]
  </script>
  
  