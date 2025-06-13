<template>
  <nav class="admin-navigation">
    <ul class="nav-list">
      <li class="nav-item">
        <router-link 
          to="/admin/dashboard" 
          class="nav-link"
          :class="{ active: $route.path === '/admin/dashboard' }"
        >
          <span class="nav-icon">📊</span>
          <span class="nav-text">Dashboard</span>
        </router-link>
      </li>
      
      <li class="nav-item">
        <router-link 
          to="/admin/students" 
          class="nav-link"
          :class="{ active: $route.path.startsWith('/admin/students') }"
        >
          <span class="nav-icon">👥</span>
          <span class="nav-text">Studenten</span>
        </router-link>
      </li>
      
      <li class="nav-item">
        <router-link 
          to="/admin/companies" 
          class="nav-link"
          :class="{ active: $route.path.startsWith('/admin/companies') }"
        >
          <span class="nav-icon">🏢</span>
          <span class="nav-text">Bedrijven</span>
        </router-link>
      </li>
      
      <li class="nav-item">
        <router-link 
          to="/admin/grondplan" 
          class="nav-link"
          :class="{ active: $route.path.startsWith('/admin/grondplan') }"
        >
          <span class="nav-icon">📍</span>
          <span class="nav-text">Grondplan</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: 'AdminNavigation'
}
</script>

<style scoped>
.admin-navigation {
  padding: 0 20px;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  text-decoration: none;
  color: #666;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.nav-link:hover {
  background-color: #f0f8ff;
  color: #007bff;
}

.nav-link.active {
  background-color: #007bff;
  color: white;
}

.nav-icon {
  margin-right: 12px;
  font-size: 1.2rem;
}

.nav-text {
  font-size: 0.95rem;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-text {
    display: none;
  }
  
  .nav-link {
    justify-content: center;
    padding: 12px;
  }
  
  .nav-icon {
    margin-right: 0;
  }
}
</style>

