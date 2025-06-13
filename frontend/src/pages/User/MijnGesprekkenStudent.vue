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
  import '../../css/MijnGesprekkenStudent.css'
  const schedule = [
    { time: '12:20', name: 'Deloitte', aula: '6' },
    { time: '12:40', name: 'Random IT', aula: '3' },
    { time: '13:00', name: 'Belfius', aula: '1' },
    { time: '13:20', name: 'BNP pariba fortis', aula: '11' },
    { time: '13:40', name: 'Proximus', aula: '4' }
  ]
  </script>
  
  