import { createRouter, createWebHistory } from 'vue-router'
import adminRoutes from './admin-routes.js'
import HomePage from '../pages/User/HomePage.vue'
import Stprofielinvoer from '../pages/User/Stprofielinvoer.vue'
import LoginPage from '../pages/User/LoginPage.vue'
import RegisterPage from '../pages/User/RegisterPage.vue'
import Dashboard from '../pages/User/Dashboard.vue'
import Swipe from '../pages/User/Swipe.vue'
import Appointments from '../pages/User/Appointments.vue'
import Profile from '../pages/User/Profile.vue'
import StudentDetail from '../pages/admin/Students/StudentDetail.vue'
import BedrijfProfielWijzigen from '../pages/User/Bedrijf/BedrijfProfielWijzigen.vue'
import BedrijfProfielWeergave from '../pages/User/Bedrijf/BedrijfProfielWeergave.vue'
import BedrijfProfielGesprekken from '../pages/User/Bedrijf/BedrijfProfielGesprekken.vue'
import StProfielWeergave from '../pages/User/Student/StProfielWeergave.vue'
import StProfielFavorieten from '../pages/User/Student/StProfielFavorieten.vue'
import StProfielWijzigen from '../pages/User/Student/StProfielWijzigen.vue'
import BedrijfProfielInvoeren from '../pages/User/Bedrijf/BedrijfInvoeren.vue'
import BedrijfDashboard from '../pages/User/Bedrijf/BedrijfDashboard.vue'
import StMatch from '../pages/User/Student/StMatch.vue'
import BedrijfMatch from '../pages/User/Bedrijf/BedrijfMatch.vue'
import SettingsStu from '../pages/User/SettingsStu.vue'
import SettingsBe from '../pages/User/Bedrijf/SettingsBe.vue'
import NotFound from '../pages/User/NotFound.vue'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'



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
  { path: '/Favorietenst', name: 'Favorietenst', component: StProfielFavorieten },
  { path: '/WijzigenSt', name: 'WijzigenSt', component: StProfielWijzigen },
  { path: '/InvoerenBd', name: 'InvoerenBd', component: BedrijfProfielInvoeren },
  { path: '/BedrijfDashboard', name: 'BedrijfDashboard', component: BedrijfDashboard },
  { path: '/swipe', name: 'Swipe', component: Swipe },
  { path: '/appointments', name: 'Appointments', component: Appointments },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/SettingsStu', name: 'SettingsStu', component: SettingsStu },
  { path: '/SettingsBe', name: 'SettingsBe', component: SettingsBe },
  { path: '/InvoerenSt', name: 'InvoerenSt', component: Stprofielinvoer },
  { path: '/stmatch', name: 'Stmatch', component: StMatch},
  { path: '/bedrijfmatch', name: 'Bedrijfmatch', component: BedrijfMatch},
  { path: '/test', name: 'TestPage', component: () => import('../pages/User/TestPage.vue') },
]

  

 
// Combineer alles in één routerconfig
const routes = [
  ...userRoutes,
  ...adminRoutes,
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
]
 
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// === Navigation Guard voor rol-gebaseerde toegang ===
router.beforeEach(async (to, from, next) => {
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  // Altijd 404 tonen voor niet-bestaande routes
  if (to.name === 'NotFound') {
    return next();
  }

  // Admin-routes: alleen admin, anders altijd 404
  if (to.path.startsWith('/admin')) {
    if (!user) {
      return next({ name: 'NotFound' });
    }
    const adminDoc = await getDoc(doc(db, 'admin', user.uid));
    if (adminDoc.exists()) {
      return next();
    } else {
      return next({ name: 'NotFound' });
    }
  }

  // Wacht tot auth geladen is (voor page refresh)
  if (!user) {
    // Toegestaan: login, register, home
    if (["/login", "/register", "/"].includes(to.path)) {
      return next();
    }
    // Anders: forceer login
    return next('/login');
  }

  // Student-only routes
  const studentOnly = [
    '/dashboard', '/swipe', '/appointments', '/profile', '/WeergaveSt', '/Favorietenst', '/WijzigenSt', '/SettingsStu', '/Stinvoer', '/stmatch', '/InvoerenSt'
  ];
  if (studentOnly.some(p => to.path.startsWith(p))) {
    const q = query(collection(db, 'student'), where('authUid', '==', user.uid));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return next();
    } else {
      return next({ name: 'NotFound' });
    }
  }

  // Bedrijf-only routes
  const bedrijfOnly = [
    '/BedrijfDashboard', '/WijzigBd', '/WeergaveBd', '/GesprekkenBd', '/Favorietenbd', '/InvoerenBd', '/bedrijfmatch', '/SettingsBe'
  ];
  if (bedrijfOnly.some(p => to.path.startsWith(p))) {
    const q = query(collection(db, 'bedrijf'), where('authUid', '==', user.uid));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return next();
    } else {
      return next({ name: 'NotFound' });
    }
  }

  // Overige routes: altijd doorlaten
  return next();
});
// === Einde navigation guard ===

export default router