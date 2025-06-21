<template>
  <nav class="admin-navigation">
    <ul class="nav-list">
      <li class="nav-item">
        <router-link 
          to="/admin/dashboard" 
          class="nav-link"
          :class="{ active: $route.path === '/admin/dashboard' }"
          title="Dashboard"
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
          title="Studenten"
        >
          <span class="nav-icon">👥</span>
          <span class="nav-text">Studenten</span>
        </router-link>
      </li>
      
      <li class="nav-item">
        <router-link 
          to="/admin/companies" 
          class="nav-link"
          :class="{ active: $route.path.startsWith('/admin/companies') && !$route.path.includes('/verification') }"
          title="Bedrijven"
        >
          <span class="nav-icon">🏢</span>
          <span class="nav-text">Bedrijven</span>
        </router-link>
      </li>
      
      <li class="nav-item">
        <router-link 
          to="/admin/companies/verification" 
          class="nav-link"
          :class="{ active: $route.path.includes('/verification') }"
          title="Bedrijfsverificatie"
        >
          <span class="nav-icon">✅</span>
          <span class="nav-text">Bedrijfsverificatie</span>
        </router-link>
      </li>
      
      <li class="nav-item">
        <router-link 
          to="/admin/grondplan" 
          class="nav-link"
          :class="{ active: $route.path.startsWith('/admin/grondplan') }"
          title="Grondplan"
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
  padding: 20px 20px;
  transition: padding 0.3s ease;
  flex: 1;
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
  white-space: nowrap;
  overflow: hidden;
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
  flex-shrink: 0;
}

.nav-text {
  font-size: 0.95rem;
  transition: opacity 0.3s ease;
}

/* Collapsed sidebar styles */
.admin-layout.sidebar-collapsed .admin-navigation {
  padding: 20px 10px;
}

.admin-layout.sidebar-collapsed .nav-link {
  justify-content: center;
  padding: 12px 8px;
}

.admin-layout.sidebar-collapsed .nav-icon {
  margin-right: 0;
}

.admin-layout.sidebar-collapsed .nav-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

/* Mobile styles */
@media (max-width: 768px) {
  .admin-navigation {
    padding: 20px 20px;
  }
  
  .nav-link {
    justify-content: flex-start;
    padding: 12px 16px;
  }
  
  .nav-icon {
    margin-right: 12px;
  }
  
  .nav-text {
    opacity: 1;
    width: auto;
  }
  
  /* When sidebar is collapsed on mobile, hide text */
  .admin-sidebar.collapsed .nav-text {
    display: none;
  }
  
  .admin-sidebar.collapsed .nav-link {
    justify-content: center;
    padding: 12px;
  }
  
  .admin-sidebar.collapsed .nav-icon {
    margin-right: 0;
  }
}
</style>

