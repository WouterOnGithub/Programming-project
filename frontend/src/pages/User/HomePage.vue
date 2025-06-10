<template>
  <div class="home">
    <!-- Navigatiebalk -->
    <nav class="navbar">
      <img src="/Images/ehb-logo.png" alt="Erasmus logo" class="logo" />
      <div class="menu">
        <button class="btn">Log In</button>
        <button class="btn">Registratie</button>
      </div>
    </nav>

    <!-- Intro -->
    <section class="intro">
      <img src="/Images/carreer_launch2025.jpg" alt="carreer launch">
      <p>
        Het ultieme netwerkevent van de design- en technologieopleidingen.
        Deze jaarlijkse jobbeurs slaat de brug tussen onze innovatieve
        opleidingen en het dynamische werkveld.
      </p>
    </section>

    <!-- Planning -->
    <section class="planning">
      <h2>Dagplanning – Career Launch</h2>
      <p><strong>Datum:</strong> donderdag 13 maart 2025</p>
      <ul>
        <li>10:00 – Start van het evenement</li>
        <li>12:00 – 13:00 Lunchmoment</li>
        <li>16:00 – Einde van de beurs</li>
      </ul>
    </section>

    <!-- Bedrijvenoverzicht -->
    <section class="bedrijven">
      <h3>Deelnemende bedrijven:</h3>
      <div class="bedrijven-grid">
        <router-link
          v-for="(bedrijf, index) in bedrijven"
          :key="index"
          :to="bedrijf.link"
          class="bedrijf-tile"
        >
          <img :src="bedrijf.logo" alt="Bedrijfslogo" />
        </router-link>
      </div>
    </section>

    <!-- Map -->
    <section class="map">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2519.191826378012!2d4.3252036!3d50.8451087!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c3c487ad8d2cfb%3A0xe35ab02f7b324878!2sErasmushogeschool%20Brussel!5e0!3m2!1snl!2sbe!4v1717588888888"
        width="100%" height="250" style="border:0;" allowfullscreen
        loading="lazy" referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
    </section>

    <!-- Adres -->
    <footer class="adres">
      Nijverheidskaai 170,<br />
      1070 Anderlecht
    </footer>

  </div>
</template>

<script setup>
import '../../css/home.css'

const bedrijven = [
  {
    logo: '/Images/telenet-logo.png',
    link: '/bedrijf/telenet'
  },
  {
    logo: '/Images/cegeka-logo.jpg',
    link: '/bedrijf/cegeka'
  },
  {
    logo: '/Images/proximus-logo.png',
    link: '/bedrijf/proximus'
  },
  {
    logo: '/Images/cronos-logo.png',
    link: '/bedrijf/cronos'
  }
  
]
</script>
