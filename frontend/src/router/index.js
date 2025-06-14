import { createRouter, createWebHistory } from 'vue-router';

import HomePage from '../pages/User/HomePage.vue';
// import ContactPage from '../pages/user/ContactPage.vue';
// import SocialMedia from '../pages/user/SocialMedia.vue';
import LoginPage from '../pages/User/LoginPage.vue'; 
import RegisterPage from '../pages/User/RegisterPage.vue';
import StudentFavoriteList from '../pages/User/StudentFavoriteList.vue';
import CompanyFavoriteList from '../pages/User/CompanyFavoriteList.vue';
import StudentList from '../pages/User/StudentList.vue';
import Stprofielinvoer from '../pages/User/Stprofielinvoer.vue';
import Dashboard from '../pages/User/Dashboard.vue';

import adminRoutes from './admin-routes.js';

const userRoutes = [
  { path: '/', name: 'Home', component: HomePage },
  // { path: '/contact', component: ContactPage },
  // {path: '/sociale-media', component: SocialMedia},
  {path: '/login', name: 'Login', component: LoginPage},
  {path: '/register', name: 'Register', component: RegisterPage},
  { path: '/studentfavorite', name: 'StudentFavoriteList', component: StudentFavoriteList},
  {path: '/companyfavorite', name: 'CompanyFavoriteList', component: CompanyFavoriteList},
  {path: '/list', name: 'List', component: StudentList},
  { path: '/Stinvoer', name: 'Student', component: Stprofielinvoer },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
];

const routes = [
  ...userRoutes,
  ...adminRoutes
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
