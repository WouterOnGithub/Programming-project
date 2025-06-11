<template>
  <div id="app" class="app">

    <main class="main-content">
      <router-view />
    </main>

    <footer class="footer">
      <div class="footer-left">
        <router-link to="/contact">Contact</router-link>
        <router-link to="/sociale-media">Sociale Media</router-link>
      </div>
      <div class="footer-right">
        <img src="/Images/ehb-logo.png" alt="Erasmus logo" />
      </div>
    </footer>
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue';
</script>
