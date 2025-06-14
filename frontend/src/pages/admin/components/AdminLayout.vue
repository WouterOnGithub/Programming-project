<template>
  <div class="admin-layout">
    <!-- Admin Header -->
    <header class="admin-header">
      <div class="header-content">
        <div class="logo">
          <router-link to="/admin/dashboard" class="admin-link">
            <h1>Admin</h1>
          </router-link>
        </div>
        <div class="user-info">
          <span class="user-name">Administrator</span>
          <div class="user-avatar">A</div>
        </div>
      </div>
    </header>

    <!-- Admin Sidebar -->
    <aside class="admin-sidebar">
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

export default {
  name: 'AdminLayout',
  components: {
    AdminNavigation
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
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.logo h1 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  color: #666;
  font-weight: 500;
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.admin-sidebar {
  grid-area: sidebar;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 20px 0;
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
  
  .admin-sidebar {
    display: none;
  }
}

.admin-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.admin-link:hover {
  opacity: 0.8;
}
</style>

