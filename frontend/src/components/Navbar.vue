<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <nav class="navbar">
    <router-link to="/">
      <img src="/Images/ehb-logo.png" alt="Erasmus logo" class="logo" />
    </router-link>

    <div class="menu" v-if="!['/login', '/register'].includes(route.path)">
      <router-link to="/login" class="btn">Log In</router-link>
      <router-link to="/register" class="btn">Registratie</router-link>
    </div>
  </nav>
</template>


<style scoped>
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: white;
    padding: 1rem 1.5rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    margin: 1rem auto;
    max-width: 1200px;
}

.logo {
    height: 45px;
}

.menu {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.btn {
    background-color: #c20000;
    color: white;
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
}

.btn:hover {
    background-color: #a00000;
}

.menubar {
    font-size: 1.6rem;
    cursor: pointer;
}
</style>