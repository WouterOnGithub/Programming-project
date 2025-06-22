<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <nav class="navbar">
    <router-link to="/">
      <img src="/Images/ehb-logo.png" alt="Erasmus logo" class="logo" />
    </router-link>
    <div class="menu">
      <router-link v-if="route.path === '/'" to="/login" class="btn">Log In</router-link>
    </div>
  </nav>
</template>


<style scoped>
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: white;
    padding: 1rem 2.5vw;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    border-radius: 16px;
    margin: 1.5rem auto 2.5rem auto;
    width: 97vw;
    max-width: 1200px;
    position: relative;
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
    padding: 0.6rem 1.5rem;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 500;
    font-size: 1rem;
    transition: background-color 0.2s;
    text-decoration: none;
}

.btn:hover {
    background-color: #a00000;
}

.menubar {
    font-size: 1.6rem;
    cursor: pointer;
}
</style>