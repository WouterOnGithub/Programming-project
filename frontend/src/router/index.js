import { createRouter, createWebHistory } from 'vue-router'

// Gebruikersroutes van je team
import HomePage from '../pages/user/HomePage.vue'
import Stprofielinvoer from '../pages/user/Stprofielinvoer.vue'
// import ContactPage from '../pages/user/ContactPage.vue'
// import SocialMedia from '../pages/user/SocialMedia.vue'
import LoginPage from '../pages/user/LoginPage.vue'
import RegisterPage from '../pages/user/RegisterPage.vue'
import Dashboard from '../pages/user/Dashboard.vue'
import Swipe from '../pages/user/Swipe.vue'
import Appointments from '../pages/user/Appointments.vue'
import Profile from '../pages/user/Profile.vue'
import Settings from '../pages/user/Settings.vue'

// Adminroutes van jou
import adminRoutes from './admin-routes.js'

const userRoutes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/Stinvoer', name: 'Student', component: Stprofielinvoer },
  // { path: '/contact', name: 'Contact', component: ContactPage },
  // { path: '/sociale-media', name: 'SocialMedia', component: SocialMedia },
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/register', name: 'Register', component: RegisterPage },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/swipe', name: 'Swipe', component: Swipe },
  { path: '/appointments', name: 'Appointments', component: Appointments },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/settings', name: 'Settings', component: Settings }
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
