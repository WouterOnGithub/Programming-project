<script setup>
import { ref, computed } from 'vue'
import '../../css/keuzepagina-student.css'

const cards = ref([
  {
    logo: '/Images/RandomIT-logo.png',
    logoText: '',
    logoBorder: '',
    title: 'Random IT',
    location: 'Gesitueerd in Rotterdam - Laan van Magisch Realisme 73',
    description: `Al meer dan 175 jaar werken we samen met leiders over de hele wereld, van de Global 500® tot particuliere bedrijven,
    om hen te helpen een betere toekomst op te bouwen. Om hun mensen te ondersteunen. Om te slagen. En dat alles met oog voor onze samenleving.`,
    duration: '<b>Elk gesprek duurt 5 min</b>',
    campus: '<b>Op campus van<br>10 tot 15 uur.</b>'
  },
  {
    logo: '/Images/Deloitte-logo.png',
    logoText: '',
    logoBorder: '',
    title: 'Deloitte',
    location: 'Gesitueerd in Rotterdam',
    description: `Random-IT is een jong bedrijf met een brede kennis binnen de IT. Wij verzorgen voor onze klanten een
    breed scala aan diensten, en fungeren als vraagbaak voor alles wat met IT te maken heeft.`,
    duration: '<b>Elk gesprek duurt 10 min</b>',
    campus: '<b>Op campus van<br>10 tot 16 uur.</b>'
  }
])

const cardIndex = ref(0)
const currentCard = computed(() => cards.value[cardIndex.value])

function switchCard() {
  cardIndex.value = (cardIndex.value + 1) % cards.value.length
}
</script>

<template>
  <div class="main-bg">
    <main>
      <div class="card-row">
        <div class="card-logo" :style="currentCard.logoBorder">
          <template v-if="currentCard.logo">
            <img :src="currentCard.logo" alt="logo" />
          </template>
          <template v-else>
            <span class="logo-text">{{ currentCard.logoText }}</span>
          </template>
        </div>
        <div class="card-content">
          <div class="card-title">{{ currentCard.title }}</div>
          <div class="card-location" v-html="currentCard.location"></div>
          <div class="card-job">
            Biedt Job of studentjob aan<br />
            <a href="#">Linkedin</a>
          </div>
          <div class="card-desc">{{ currentCard.description }}</div>
          <div class="card-footer">
            <div class="card-duration">
              <span class="clock">⏱️</span>
              <span v-html="currentCard.duration"></span>
            </div>
            <div class="card-campus" v-html="currentCard.campus"></div>
          </div>
        </div>
      </div>
    </main>

    <div class="swipe-bar">
      <button class="swipe-btn" @click="switchCard">✕</button>
      <button class="swipe-btn" @click="switchCard">❤</button>
    </div>
  </div>
</template>
