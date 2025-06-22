<template>
  <div class="admin-layout" :class="{ 'sidebar-collapsed': !isSidebarOpen }">
    <!-- Admin Header -->
    <header class="admin-header">
      <div class="header-content">
        <button class="menu-toggle" @click="toggleSidebar" :class="{ 'active': isSidebarOpen }">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <router-link to="/admin/dashboard" class="admin-logo-link">
          <span class="admin-logo-text">Admin</span>
        </router-link>
      </div>
      <div class="header-actions">
        <a @click="handleLogout" class="logout-link">
          <i class="fas fa-sign-out-alt"></i>
          Uitloggen
        </a>
      </div>
    </header>

    <!-- Sidebar Overlay -->
    <div v-if="isSidebarOpen && isMobile" class="sidebar-overlay" @click="toggleSidebar"></div>

    <!-- Admin Sidebar -->
    <aside class="admin-sidebar" :class="{ 'open': isSidebarOpen, 'collapsed': !isSidebarOpen }">
      <div class="sidebar-header">
        <button class="sidebar-toggle-btn" @click="toggleSidebar" :title="isSidebarOpen ? 'Sidebar inklappen' : 'Sidebar uitklappen'">
          <span v-if="!isSidebarOpen">→</span>
          <span v-else>×</span>
        </button>
      </div>
      <AdminNavigation />
    </aside>

    <!-- Main Content Area -->
    <main class="admin-main">
      <div class="content-wrapper">
        <router-view />
      </div>
    </main>
    
    <footer class="admin-footer">
      <div class="admin-footer-content">
        <p>© 2025 Erasmus Hogeschool Brussel.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import AdminNavigation from './AdminNavigation.vue'
import { getAuth, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import { db } from '../../../firebase/config'

export default {
  name: 'AdminLayout',
  components: {
    AdminNavigation
  },
  data() {
    return {
      isSidebarOpen: true,
      isMobile: false
    }
  },
  setup() {
    const router = useRouter()
    const auth = getAuth()

    const handleLogout = async () => {
      const user = auth.currentUser
      let isAdmin = false

      if (user) {
        const adminDoc = await getDoc(doc(db, 'admin', user.uid))
        isAdmin = adminDoc.exists()
      }

      await signOut(auth)

      if (isAdmin) {
        router.push('/admin/loginAdmin')
      } else {
        router.push('/login')
      }
    }

    return {
      handleLogout
    }
  },

  mounted() {
    // Load sidebar state from localStorage
    const savedState = localStorage.getItem('adminSidebarOpen')
    if (savedState !== null) {
      this.isSidebarOpen = JSON.parse(savedState)
    }
    
    // Check if mobile
    this.checkMobile()
    window.addEventListener('resize', this.checkMobile)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile)
  },
  methods: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen
      // Save state to localStorage
      localStorage.setItem('adminSidebarOpen', JSON.stringify(this.isSidebarOpen))
    },
    checkMobile() {
      this.isMobile = window.innerWidth <= 768
    }
  }
}
</script>

<style scoped>
.admin-footer {
  background-color: #ffffff;
  border-top: 1px solid #e5e7eb;
  padding: 16px 24px;
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}
.admin-layout {
  display: grid;
  grid-template-areas: 
    "header header"
    "sidebar main";
  grid-template-columns: 250px 1fr;
  grid-template-rows: 60px 1fr;
  min-height: 100vh;
  background-color: #f5f5f5;
  transition: grid-template-columns 0.3s ease;
}

.admin-layout.sidebar-collapsed {
  grid-template-columns: 60px 1fr;
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
  gap: 16px;
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
  padding: 0;
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background: #f8f9fa;
}

.sidebar-toggle-btn {
  background: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 32px;
  min-height: 32px;
}

.sidebar-toggle-btn:hover {
  background: #f8f9fa;
  color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
}

.sidebar-toggle-btn span {
  font-size: 1.2rem;
  font-weight: bold;
  line-height: 1;
}

.admin-sidebar.collapsed {
  padding: 0;
}

.admin-sidebar.collapsed .sidebar-header {
  padding: 15px 10px;
  justify-content: center;
}

.admin-sidebar.collapsed .sidebar-toggle-btn {
  padding: 8px;
  width: 32px;
  height: 32px;
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
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

.content-wrapper {
  max-width: 100%;
  margin: 0;
}

.admin-logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  font-weight: 700;
  color: #1a1a1a;
  font-size: 1.5rem;
  transition: color 0.2s;
}

.admin-logo-link:hover {
  color: #2563eb;
}

.admin-logo-text {
  font-size: 1.5rem;
  font-weight: 700;
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

  .admin-layout.sidebar-collapsed {
    grid-template-columns: 1fr;
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
    width: 250px;
  }

  .admin-sidebar.open {
    transform: translateX(0);
  }

  .admin-sidebar.collapsed {
    transform: translateX(-100%);
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

