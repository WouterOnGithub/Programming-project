<template>
  <div id="app" class="app">

    <main class="main-content">
      <router-view />
      <Footer v-if="!route.path.startsWith('/admin')" />
    </main>


  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue'
import { useRoute } from 'vue-router'
const route = useRoute()
</script>


<style scoped>
html, body {
  height: 100%;
  margin: 0;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

.footer {
  background-color: #e0e0e0;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #ccc;
  border-radius: 6px 6px 0 0;
}

</style>