<template>
    <div>
      <Navbar />
  
      <div class="contact-page">
        <h1>Contacteer ons</h1>
        <p>📧 E-mail: info@erasmushogeschool.be</p>
        <p>📞 Telefoon: 02 123 45 67</p>
        <p>📍 Adres: Nijverheidskaai 170, 1070 Anderlecht</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import Navbar from '../../components/Navbar.vue'
  </script>
  
  <style scoped>
  .contact-page {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .contact-page h1 {
    color: #c20000;
    margin-bottom: 1rem;
  }
  </style>
  