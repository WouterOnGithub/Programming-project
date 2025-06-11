import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../pages/User/HomePage.vue';
import StudentsPage from '../pages/User/StudentsPage.vue';
import ContactPage from '../pages/user/ContactPage.vue';
import SocialMedia from '../pages/user/SocialMedia.vue';
import LoginPage from '../pages/User/LoginPage.vue'; 
import RegisterPage from '../pages/User/RegisterPage.vue';
import FavoriteListStudent from '../pages/User/FavoriteListStudent.vue';
import FavoriteListCompany from '../pages/User/FavoriteListCompany.vue';
import StudentList from '../pages/User/StudentList.vue';


const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/students', name: 'Student', component: StudentsPage },
  { path: '/contact', component: ContactPage },
  {path: '/sociale-media', component: SocialMedia},
  {path: '/login', name: 'Login', component: LoginPage},
  {path: '/register', name: 'Register', component: RegisterPage},
  { path: '/favoritestudent', name: 'Favorite', component: FavoriteListStudent},
  {path: '/favoritecompany', name: 'Favorite', component: FavoriteListCompany},
  {path: '/list', name: 'List', component: StudentList},
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
