import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../pages/User/HomePage.vue';
import StudentsPage from '../pages/User/StudentsPage.vue';

import ContactPage from '../pages/user/ContactPage.vue';
import SocialMedia from '../pages/user/SocialMedia.vue';


const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/students', name: 'Student', component: StudentsPage },

  { path: '/contact', component: ContactPage },
  {path: '/sociale-media', component: SocialMedia},
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
