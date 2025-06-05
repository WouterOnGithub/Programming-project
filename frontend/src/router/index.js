import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../pages/User/HomePage.vue';
import StudentsPage from '../pages/User/StudentsPage.vue';

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/students', name: 'Student', component: StudentsPage },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
