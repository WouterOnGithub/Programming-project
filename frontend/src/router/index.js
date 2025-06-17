import { createRouter, createWebHistory } from 'vue-router'
 
// Gebruikersroutes van je team
import HomePage from '../pages/User/HomePage.vue'
import Stprofielinvoer from '../pages/User/Stprofielinvoer.vue'
import LoginPage from '../pages/User/LoginPage.vue'
import RegisterPage from '../pages/User/RegisterPage.vue'
import Dashboard from '../pages/User/Dashboard.vue'
import StudentDetail from '../pages/admin/Students/StudentDetail.vue'
import BedrijfProfielWijzigen from '../pages/User/Bedrijf/BedrijfProfielWijzigen.vue'
// Adminroutes van jou
import adminRoutes from './admin-routes.js'

const userRoutes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/Stinvoer', name: 'Student', component: Stprofielinvoer },
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/register', name: 'Register', component: RegisterPage },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/student/:id', name: 'StudentDetail', component: StudentDetail },
  { path: '/WijzigBd', name: 'WijzigBd', component: BedrijfProfielWijzigen }
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