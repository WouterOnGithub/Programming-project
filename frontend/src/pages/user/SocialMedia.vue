<template>
    <div>
        <Navbar />
    <div class="social-page">
      <h1>Volg ons op sociale media</h1>
  
      <div class="platforms">
        <a href="https://www.facebook.com/erasmushogeschool" target="_blank" class="platform facebook">
          <img src="/Images/facebook-logo.png" alt="Facebook" />
          <span>Facebook</span>
        </a>
  
        <a href="https://www.instagram.com/erasmushogeschool" target="_blank" class="platform instagram">
          <img src="/Images/instagram-logo.png" alt="Instagram" />
          <span>Instagram</span>
        </a>
  
        <a href="https://www.linkedin.com/school/erasmushogeschool/" target="_blank" class="platform linkedin">
          <img src="/Images/linkedin-logo.png" alt="LinkedIn" />
          <span>LinkedIn</span>
        </a>
      </div>
    </div>
</div>
  </template>
  
  <script setup>
  import Navbar from '../../components/Navbar.vue'
  </script>
  
  <style scoped>
  .social-page {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
  
  .platforms {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1.5rem;
    align-items: center;
  }
  
  .platform {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem 1.5rem;
    border-radius: 10px;
    background-color: #f0f0f0;
    text-decoration: none;
    color: #000;
    font-weight: bold;
    transition: background-color 0.2s;
    width: 300px;
    justify-content: flex-start;
  }
  
  .platform:hover {
    background-color: #e0e0e0;
  }
  
  .platform img {
    width: 32px;
    height: 32px;
  }
  </style>
  