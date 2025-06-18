<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <aside class="sidebar-nav">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <img src="/Images/ehb-logo.png" alt="EHB logo" class="ehb-logo-img" />
        </div>
        <div>
          <h1 class="sidebar-title">StudentMatch</h1>
          <p class="sidebar-subtitle">Bedrijfsdashboard</p>
        </div>
      </div>
      <nav class="sidebar-menu">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          class="sidebar-link"
          :class="{ active: $route.path === item.href }"
        >
          <i :class="item.icon"></i>
          {{ item.name }}
        </router-link>
      </nav>
    </aside>
    <main class="dashboard-main">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const $route = useRoute()
const userData = ref({ companyName: 'Cronos' })
const navigation = [
  { name: 'Dashboard', href: '/BedrijfDashboard', icon: 'fas fa-chart-pie' },
  { name: 'Favorieten', href: '/Favorietenbd', icon: 'fas fa-envelope' },
  { name: 'Afspraken', href: '/GesprekkenBd', icon: 'fas fa-calendar' },
  { name: 'Matches', href: '/bedrijfmatch', icon: 'fas fa-users' },
  { name: 'Profiel', href: '/WeergaveBd', icon: 'fas fa-user' },
  { name: 'Instellingen', href: '/SettingsBe', icon: 'fas fa-cog' }
]
</script>

<style scoped>
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
}
.sidebar-nav {
  width: 16rem;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 1rem 1rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}
.sidebar-logo {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  overflow: hidden;
}
.ehb-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.sidebar-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
}
.sidebar-subtitle {
  font-size: 0.8rem;
  color: #6b7280;
}
.sidebar-menu {
  flex: 1;
  padding: 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  color: #6b7280;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
}
.sidebar-link.active, .sidebar-link:hover {
  background: #f3f4f6;
  color: #c20000;
}
.dashboard-main {
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
}
</style> 