<template>
  <div class="test-nav-wrapper">
    <h1>Test Navigatie Pagina</h1>
    <p>Klik op een knop om direct naar een pagina te gaan (zonder inloggen).</p>
    <div class="test-nav-btns">
      <router-link to="/">
        <button class="test-btn">Home</button>
      </router-link>
      <router-link to="/Stinvoer">
        <button class="test-btn">Student Profiel Invoeren</button>
      </router-link>
      <router-link to="/InvoerenBd">
        <button class="test-btn">Bedrijf Profiel Invoeren</button>
      </router-link>
      <router-link to="/dashboard">
        <button class="test-btn">Student Dashboard</button>
      </router-link>
      <router-link to="/BedrijfDashboard">
        <button class="test-btn">Bedrijf Dashboard</button>
      </router-link>
      <router-link to="/admin/dashboard">
        <button class="test-btn admin-btn">Admin Dashboard <span class="admin-warning">(normaal beveiligd)</span></button>
      </router-link>
    </div>
  </div>
</template>

<script setup>
// Geen script nodig
</script>

<style scoped>
.test-nav-wrapper {
  padding: 2rem;
  max-width: 400px;
  margin: 3rem auto;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  text-align: center;
}
.test-nav-btns {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-top: 2.5rem;
}
.test-btn {
  padding: 0.9rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: #c20000;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.18s, box-shadow 0.18s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}
.test-btn:hover {
  background: #a50000;
}
.admin-btn {
  background: #333;
  color: #fff;
  position: relative;
}
.admin-btn:hover {
  background: #111;
}
.admin-warning {
  font-size: 0.85em;
  color: #ffb300;
  margin-left: 0.5em;
}
</style> 