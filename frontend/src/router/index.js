import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../pages/User/HomePage.vue';
import Stprofielinvoer from '../pages/User/Stprofielinvoer.vue';
import ContactPage from '../pages/user/ContactPage.vue';
import SocialMedia from '../pages/user/SocialMedia.vue';
import LoginPage from '../pages/User/LoginPage.vue'; 
import RegisterPage from '../pages/User/RegisterPage.vue';



const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/Stinvoer', name: 'Student', component: Stprofielinvoer },
  { path: '/contact', component: ContactPage },
  {path: '/sociale-media', component: SocialMedia},
  {path: '/login', name: 'Login', component: LoginPage},
  {path: '/register', name: 'Register', component: RegisterPage}
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
