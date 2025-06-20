<template>
  <div class="notfound-container">
    <h1>404 - Pagina niet gevonden</h1>
    <p>De pagina die je zoekt bestaat niet of je hebt geen toegang.</p>
    <router-link to="/">
      <button class="back-home">Terug naar home</button>
    </router-link>
  </div>
</template>

<script setup>
// Geen extra script nodig
</script>

<style scoped>
.notfound-container {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
h1 {
  font-size: 3rem;
  color: #c20000;
  margin-bottom: 1rem;
}
p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}
.back-home {
  background: #c20000;
  color: #fff;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.back-home:hover {
  background: #a40000;
}
</style> 