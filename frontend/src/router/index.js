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
import StProfielInvoerenNew from '../pages/User/Student/StProfielInvoerenNew.vue'
// Adminroutes van jou
import adminRoutes from './admin-routes.js'
StProfielInvoerenNew

import HomePage from '../pages/User/HomePage.vue'
import Stprofielinvoer from '../pages/User/Stprofielinvoer.vue'
import LoginPage from '../pages/User/LoginPage.vue'
import RegisterPage from '../pages/User/RegisterPage.vue'
import Dashboard from '../pages/User/Dashboard.vue'
import StudentDetail from '../pages/admin/Students/StudentDetail.vue'

import BedrijfProfielFavorieten from '../pages/User/Bedrijf/BedrijfProfielFavorieten.vue'
 
// Adminroutes van jou
import adminRoutes from './admin-routes.js'


import StProfielWijzigen from '../pages/User/Student/StProfielWijzigen.vue'
// Adminroutes van jou
import adminRoutes from './admin-routes.js'

import BedrijfProfielInvoeren from '../pages/User/Bedrijf/BedrijfInvoeren.vue'
import BedrijfDashboard from '../pages/User/Bedrijf/BedrijfDashboard.vue'
// Adminroutes van jou
import adminRoutes from './admin-routes.js'
// Voeg deze imports toe:
import Swipe from '../pages/User/Swipe.vue'
import Appointments from '../pages/User/Appointments.vue'





const userRoutes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/Stinvoer', name: 'Student', component: Stprofielinvoer },
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/register', name: 'Register', component: RegisterPage },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/student/:id', name: 'StudentDetail', component: StudentDetail },

  { path: '/Favorietenbd', name: 'Favorietenbd', component: BedrijfProfielFavorieten }


  { path: '/WijzigenSt', name: 'WijzigenSt', component: StProfielWijzigen }

  { path: '/InvoerenBd', name: 'InvoerenBd', component: BedrijfProfielInvoeren },
  { path: '/BedrijfDashboard', name: 'BedrijfDashboard', component: BedrijfDashboard },
  // Toevoegen:
  { path: '/swipe', name: 'Swipe', component: Swipe },

  { path: '/appointments', name: 'Appointments', component: Appointments },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/settings', name: 'Settings', component: Settings },
  { path: '/InvoerenSt', name: 'InvoerenSt', component: StProfielInvoerenNew }
]

  { path: '/appointments', name: 'Appointments', component: Appointments }



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