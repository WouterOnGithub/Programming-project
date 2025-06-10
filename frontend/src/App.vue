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
</script>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f0f0f0;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
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

.footer-left {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.footer-left a {
  text-decoration: none;
  color: black;
  font-weight: bold;
  transition: color 0.2s;
}

.footer-left a:hover {
  color: #c20000;
}

.footer-right img {
  height: 40px;
}
</style>
