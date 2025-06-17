<template>
  <div class="admin-layout">
    <!-- Admin Header -->
    <header class="admin-header">
      <div class="header-content">
        <button class="menu-toggle" @click="toggleSidebar" :class="{ 'active': isSidebarOpen }">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <h1>Admin</h1>
      </div>
      <div class="header-actions">
        <a @click="handleLogout" class="logout-link">
          <i class="fas fa-sign-out-alt"></i>
          Uitloggen
        </a>
      </div>
    </header>

    <!-- Sidebar Overlay -->
    <div v-if="isSidebarOpen" class="sidebar-overlay" @click="toggleSidebar"></div>

    <!-- Admin Sidebar -->
    <aside class="admin-sidebar" :class="{ 'open': isSidebarOpen }">
      <AdminNavigation />
    </aside>

    <!-- Main Content Area -->
    <main class="admin-main">
      <div class="content-wrapper">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script>
import AdminNavigation from './AdminNavigation.vue'
import { useRouter } from 'vue-router'

export default {
  name: 'AdminLayout',
  components: {
    AdminNavigation
  },
  data() {
    return {
      isSidebarOpen: false
    }
  },
  setup() {
    const router = useRouter()

    const handleLogout = () => {
      router.push('/login')
    }

    return {
      handleLogout
    }
  },
  methods: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: grid;
  grid-template-areas: 
    "header header"
    "sidebar main";
  grid-template-columns: 250px 1fr;
  grid-template-rows: 60px 1fr;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.admin-header {
  grid-area: header;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 18px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.menu-toggle span {
  display: block;
  width: 100%;
  height: 2px;
  background-color: #1a1a1a;
  transition: all 0.3s ease;
}

.menu-toggle.active span:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.menu-toggle.active span:nth-child(2) {
  opacity: 0;
}

.menu-toggle.active span:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

.header-content h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #1a1a1a;
}

.header-actions {
  display: flex;
  align-items: center;
}

.logout-link {
  color: #666;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.logout-link:hover {
  color: #dc3545;
  text-decoration: underline;
}

.logout-link i {
  font-size: 1rem;
}

.admin-sidebar {
  grid-area: sidebar;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 20px 0;
  transition: transform 0.3s ease;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

.admin-main {
  grid-area: main;
  padding: 20px;
  overflow-y: auto;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .admin-layout {
    grid-template-areas: 
      "header"
      "main";
    grid-template-columns: 1fr;
    grid-template-rows: 60px 1fr;
  }

  .menu-toggle {
    display: flex;
  }

  .admin-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 999;
    transform: translateX(-100%);
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  }

  .admin-sidebar.open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block;
  }

  .logout-link {
    font-size: 0.9rem;
  }

  .logout-link i {
    font-size: 0.9rem;
  }
}
</style>

