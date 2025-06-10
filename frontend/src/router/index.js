import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../pages/User/HomePage.vue';
import StudentsPage from '../pages/User/StudentsPage.vue';
import LoginPage from '../pages/User/LoginPage.vue';
import RegisterPage from '../pages/User/RegisterPage.vue';

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/students', name: 'Student', component: StudentsPage },
  {path: '/login', name: 'Login', component: LoginPage},
  {path: '/register', name: 'Register', component: RegisterPage}
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
