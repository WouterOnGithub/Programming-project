<template>
    <div class="dashboard-container">
      <!-- Sidebar -->
      <aside class="sidebar-nav">
  <div class="sidebar-header">
    <div class="sidebar-logo">
      <i class="fas fa-user-graduate"></i>
    </div>
    <div>
      <h1 class="sidebar-title">StudentMatch</h1>
      <p class="sidebar-subtitle">Studentdashboard</p>
    </div>
  </div>

  <nav class="sidebar-menu">
    <router-link
      v-for="item in navigation"
      :key="item.name"
      :to="item.href"
      :class="['sidebar-link', $route.path === item.href ? 'active' : '']"
    >
      <i :class="item.icon"></i>
      {{ item.name }}
    </router-link>
  </nav>

  <div class="sidebar-footer">
    <router-link to="/WijzigSt" class="sidebar-link">
      <i class="fas fa-pen"></i> Wijzig
    </router-link>
    <router-link to="/" class="sidebar-link">
      <i class="fas fa-sign-out-alt"></i> Uitloggen
    </router-link>
  </div>

  <!-- Gebruiker info VERPLAATST naar hier -->
  <div class="sidebar-user">
    <div class="sidebar-user-avatar">
      <i class="fas fa-user"></i>
    </div>
    <div>
      <p class="sidebar-user-name">{{ profiel.voornaam }} {{ profiel.achternaam }}</p>
      <p class="sidebar-user-role">Student</p>
    </div>
  </div>
</aside>

  
      <!-- Main Content -->
      <main class="dashboard-main">
        <header class="dashboard-header">
          <div>
            <h1>Welkom terug, {{ profiel.voornaam }}!</h1>
            <p>Profieloverzicht</p>
          </div>
          <div class="dashboard-header-actions">
            <div class="dashboard-profile-avatar">
              {{ profiel.voornaam[0] }}
            </div>
          </div>
        </header>
  
        <section class="hero-banner">
          <div class="hero-photo">
            <img :src="profiel.fotoPreview || profielfoto" alt="Profielfoto" />
          </div>
          <div class="hero-text">
            <h1>{{ profiel.voornaam }} {{ profiel.achternaam }}</h1>
            <p>{{ profiel.domein }} – {{ profiel.studiejaar }}</p>
          </div>
        </section>
  
        <section class="section-card">
          <h2>Introductie</h2>
          <p class="intro-text">{{ profiel.intro }}</p>
        </section>
  
        <section class="section-card">
          <h2>Informatie</h2>
          <ul class="info-list">
            <li><strong>Leeftijd:</strong> {{ profiel.leeftijd }}</li>
            <li><strong>Beschikbaar vanaf:</strong> {{ profiel.beschikbaarVanaf }}</li>
            <li><strong>Opportuniteit:</strong> {{ profiel.opportuniteit }}</li>
            <li><strong>LinkedIn:</strong> <a :href="profiel.linkedin" target="_blank">Bekijk profiel</a></li>
          </ul>
        </section>
  
        <section class="section-card">
          <h2>Vaardigheden</h2>
          <div class="chip-cloud">
            <span class="chip" v-for="skill in profiel.skills" :key="skill">{{ skill }}</span>
          </div>
        </section>
  
        <section class="section-card">
          <h2>Talenkennis</h2>
          <div class="badge-row">
            <span class="badge" v-for="taal in profiel.talenkennis" :key="taal">
              {{ taal }}<span v-if="taal === 'Andere'"> ({{ profiel.andereTaal }})</span>
            </span>
          </div>
        </section>
  
        <section class="grid-2">
          <div class="section-card">
            <h2>CV</h2>
            <p>
              <a :href="'/uploads/' + profiel.cv.naam" target="_blank">
                {{ profiel.cv.naam }} ({{ profiel.cv.grootte }})
              </a>
            </p>
          </div>
        </section>
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import profielfoto from '/Images/profielfoto.jpg'
  
  const profiel = ref({
    voornaam: 'Jonathan',
    achternaam: 'Primo',
    leeftijd: 22,
    domein: 'Cybersecurity',
    studiejaar: '3e jaar',
    beschikbaarVanaf: '2025-09-01',
    opportuniteit: 'Stage',
    linkedin: 'https://www.linkedin.com/in/jonathan-primo',
    intro: `Hallo,\nIk ben Jonathan,\nIk hou van cybersecurity,\nIk ben sociaal en heb al eerder teams geleid,\nAangenaam kennis te maken.`,
    talenkennis: ['Nederlands', 'Engels', 'Frans', 'Andere'],
    andereTaal: 'Japans',
    skills: ['Teamwork', 'Python', 'Machine Learning', 'Leiderschap'],
    toestemming: true,
    cv: { naam: 'cv-Jonathan-Primo.pdf', grootte: '84 kB' },
    fotoPreview: null
  })
  
  const navigation = [
    { name: 'Dashboard', href: '/student/dashboard', icon: 'fas fa-chart-pie' },
    { name: 'Favorieten', href: '/student/favorieten', icon: 'fas fa-star' },
    { name: 'Gesprekken', href: '/student/gesprekken', icon: 'fas fa-comments' },
    { name: 'Profiel', href: '/WeergaveSt', icon: 'fas fa-user' }
  ]
  </script>
  
  <!-- ✅ GLOBAAL (NIET-SCOPED): CSS-variabelen -->
  <style>
  :root {
    --rood: #c20000;
    --tekst-donker: #111827;
    --tekst-licht: #6b7280;
    --achtergrond-kaart: #fff;
    --achtergrond-pagina: #f5f5f7;
    --grens: #e5e7eb;
  }
  </style>
  
  <!-- ✅ COMPONENT SCOPED STYLES -->
  <style scoped>
  .dashboard-container {
    display: flex;
    font-family: 'Segoe UI', sans-serif;
    background: var(--achtergrond-pagina);
    min-height: 100vh;
  }
  
  .sidebar-nav {
    width: 16rem;
    background: #fff;
    border-right: 1px solid var(--grens);
    display: flex;
    flex-direction: column;
  }
  
  .sidebar-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem 1rem 1rem;
    border-bottom: 1px solid var(--grens);
  }
  
  .sidebar-logo {
    width: 2rem;
    height: 2rem;
    background: var(--rood);
    color: #fff;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
  }
  
  .sidebar-title {
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  .sidebar-subtitle {
    font-size: 0.8rem;
    color: var(--tekst-licht);
  }
  
  .sidebar-menu {
    padding: 1rem;
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
    color: var(--tekst-donker);
    text-decoration: none;
    font-weight: 500;
    transition: background 0.2s, color 0.2s;
  }
  
  .sidebar-link.active,
  .sidebar-link:hover {
    background: #f3f4f6;
    color: var(--rood);
  }
  
  .sidebar-user {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border-top: 1px solid var(--grens);
    background: #f9fafb;
  }
  
  .sidebar-user-avatar {
    width: 2rem;
    height: 2rem;
    background: var(--rood);
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
  }
  
  .sidebar-user-name {
    font-weight: 600;
  }
  
  .sidebar-user-role {
    font-size: 0.8rem;
    color: var(--tekst-licht);
  }
  
  .sidebar-footer {
    margin-top: auto;
    padding: 1rem;
    border-top: 1px solid var(--grens);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .dashboard-main {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    background: white;
    border-bottom: 1px solid var(--grens);
  }
  
  .dashboard-header h1 {
    color: var(--rood);
    font-size: 1.3rem;
    font-weight: 600;
  }
  
  .dashboard-header p {
    color: var(--tekst-licht);
  }
  
  .dashboard-profile-avatar {
    width: 2rem;
    height: 2rem;
    background: var(--rood);
    color: white;
    font-weight: bold;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .hero-banner {
    display: flex;
    gap: 2rem;
    align-items: center;
    background: linear-gradient(135deg, #fafafa, #fff1f1);
    padding: 2rem;
    border-radius: 24px;
    margin: 2rem;
  }
  
  .hero-photo img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--rood);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .section-card {
    background: white;
    margin: 1rem 2rem;
    border-left: 4px solid var(--rood);
    padding: 2rem;
    border-radius: 0.75rem;
  }
  
  .section-card h2 {
    color: var(--rood);
    margin-bottom: 1rem;
  }
  
  .intro-text {
    background: #fff3f3;
    padding: 1rem;
    border-left: 4px solid var(--rood);
    border-radius: 8px;
  }
  
  .info-list {
    list-style: none;
    padding: 0;
  }
  
  .info-list li {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px dashed #ddd;
  }
  
  .chip-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .chip {
    background: #f3f4f6;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
  }
  
  .badge-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .badge {
    background: #e5e7eb;
    padding: 0.3rem 0.7rem;
    border-radius: 12px;
  }
  </style>
  