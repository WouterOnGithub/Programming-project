import { createRouter, createWebHistory } from 'vue-router'
 // Adminroutes van jou
import adminRoutes from './admin-routes.js'
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
import StProfielInvoerenNew from '../pages/User/Student/StProfielInvoerenNew.vue'
import StudentDetail from '../pages/admin/Students/StudentDetail.vue'
import BedrijfProfielWijzigen from '../pages/User/Bedrijf/BedrijfProfielWijzigen.vue'
import BedrijfProfielWeergave from '../pages/User/Bedrijf/BedrijfProfielWeergave.vue'
import BedrijfProfielGesprekken from '../pages/User/Bedrijf/BedrijfProfielGesprekken.vue'
import StProfielWeergave from '../pages/User/Student/StProfielWeergave.vue'
import BedrijfProfielFavorieten from '../pages/User/Bedrijf/BedrijfProfielFavorieten.vue'
import StProfielWijzigen from '../pages/User/Student/StProfielWijzigen.vue'
import BedrijfProfielInvoeren from '../pages/User/Bedrijf/BedrijfInvoeren.vue'
import BedrijfDashboard from '../pages/User/Bedrijf/BedrijfDashboard.vue'



const userRoutes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/Stinvoer', name: 'Student', component: Stprofielinvoer },
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/register', name: 'Register', component: RegisterPage },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/student/:id', name: 'StudentDetail', component: StudentDetail },
  { path: '/WijzigBd', name: 'WijzigBd', component: BedrijfProfielWijzigen },
  { path: '/WeergaveBd', name: 'WeergaveBd', component: BedrijfProfielWeergave },
  { path: '/GesprekkenBd', name: 'GesprekkenBd', component: BedrijfProfielGesprekken },
  { path: '/WeergaveSt', name: 'WeergaveSt', component: StProfielWeergave },
  { path: '/Favorietenbd', name: 'Favorietenbd', component: BedrijfProfielFavorieten },
  { path: '/WijzigenSt', name: 'WijzigenSt', component: StProfielWijzigen },
  { path: '/InvoerenBd', name: 'InvoerenBd', component: BedrijfProfielInvoeren },
  { path: '/BedrijfDashboard', name: 'BedrijfDashboard', component: BedrijfDashboard },
  { path: '/swipe', name: 'Swipe', component: Swipe },
  { path: '/appointments', name: 'Appointments', component: Appointments },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/settings', name: 'Settings', component: Settings },
  { path: '/InvoerenSt', name: 'InvoerenSt', component: StProfielInvoerenNew },
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