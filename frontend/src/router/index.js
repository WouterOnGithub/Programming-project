import { createRouter, createWebHistory } from 'vue-router'

// Gebruikersroutes van je team
import HomePage from '../pages/User/HomePage.vue'
import Stprofielinvoer from '../pages/User/Stprofielinvoer.vue'
import ContactPage from '../pages/User/ContactPage.vue'
import SocialMedia from '../pages/User/SocialMedia.vue'
import LoginPage from '../pages/User/LoginPage.vue'
import RegisterPage from '../pages/User/RegisterPage.vue'

// Adminroutes van jou
import adminRoutes from './admin-routes.js'

const userRoutes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/Stinvoer', name: 'Student', component: Stprofielinvoer },
  { path: '/contact', name: 'Contact', component: ContactPage },
  { path: '/sociale-media', name: 'SocialMedia', component: SocialMedia },
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/register', name: 'Register', component: RegisterPage }
]

// Combineer alles in één routerconfig
const routes = [
  ...userRoutes,
  ...adminRoutes
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
