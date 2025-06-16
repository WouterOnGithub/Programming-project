import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
 
const adminRoutes = [
  {
    path: '/admin',
    component: () => import('../pages/admin/components/AdminLayout.vue'),
    meta: { requiresAdmin: true },
    beforeEnter: async (to, from, next) => {
      const user = auth.currentUser;
      if (!user) {
        next('/login');
        return;
      }
 
      try {
        const userDoc = await getDoc(doc(db, 'admin', user.uid));
        if (userDoc.exists()) {
          next();
        } else {
          next('/');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        next('/');
      }
    },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../pages/admin/dashboard.vue')
      },
      {
        path: 'students',
        name: 'AdminStudents',
        component: () => import('../pages/admin/Students/StudentList.vue')
      },
      {
        path: 'students/:id',
        name: 'AdminStudentDetail',
        component: () => import('../pages/admin/Students/StudentDetail.vue'),
        props: true
      },
      {
        path: 'students/new',
        name: 'AdminStudentNew',
        component: () => import('../pages/admin/Students/StudentForm.vue')
      },
      {
        path: 'students/:id/edit',
        name: 'AdminStudentEdit',
        component: () => import('../pages/admin/Students/StudentForm.vue'),
        props: true
      },
      {
        path: 'companies',
        name: 'AdminCompanies',
        component: () => import('../pages/admin/Companies/CompanyList.vue')
      },
      {
        path: 'companies/new',
        name: 'AdminCompanyNew',
        component: () => import('../pages/admin/Companies/CompanyForm.vue')
      },
      {
        path: 'companies/:id/edit',
        name: 'AdminCompanyEdit',
        component: () => import('../pages/admin/Companies/CompanyForm.vue'),
        props: true
      },
      {
        path: 'grondplan',
        name: 'AdminGrondplan',
        component: () => import('../pages/admin/Grondplan/GrondplanList.vue')
      }
    ]
  }
]
 
export default adminRoutes