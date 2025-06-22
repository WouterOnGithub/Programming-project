const TEST_MODE = false; // Zet op true om adminroutes altijd door te laten voor testen

import { useRouter } from 'vue-router';
 
const adminRoutes = [
  {
    path: '/admin',
    component: () => import('../pages/admin/components/AdminLayout.vue'),
    meta: { requiresAdmin: true },
    beforeEnter: async (to, from, next) => {
      if (TEST_MODE) {
        next();
        return;
      }
      
      // Import Firebase services inside the guard to ensure they're available
      const { auth, db } = await import('../firebase/config');
      const { doc, getDoc } = await import('firebase/firestore');
      
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
        path: 'students/:id/edit',
        name: 'AdminStudentEdit',
        component: () => import('../pages/admin/Students/StudentForm.vue'),
        props: true
      },
      {
        path: 'students/new',
        name: 'AdminStudentNew',
        component: () => import('../pages/admin/Students/StudentForm.vue')
      },
      {
        path: 'companies',
        name: 'AdminCompanies',
        component: () => import('../pages/admin/Companies/CompanyList.vue')
      },
      {
        path: 'companies/:id/edit',
        name: 'AdminCompanyEdit',
        component: () => import('../pages/admin/Companies/CompanyForm.vue'),
        props: true
      },
      {
        path: 'companies/:id',
        name: 'AdminCompanyDetail',
        component: () => import('../pages/admin/Companies/CompanyDetail.vue'),
        props: true
      },
{
  path: 'companies/verification',
  name: 'AdminCompanyVerification',
  component: () => import('../pages/admin/Companies/CompanyVerification.vue')
},
      {
        path: 'companies/new',
        name: 'AdminCompanyNew',
        component: () => import('../pages/admin/Companies/CompanyForm.vue')
      },
      {
        path: 'grondplan',
        name: 'AdminGrondplan',
        component: () => import('../pages/admin/Grondplan/GrondplanList.vue')
      },
      {
        path: 'matches',
        name: 'AdminMatches',
        component: () => import('../pages/admin/Matches/MatchesList.vue')
      },
      {
        path: 'appointments',
        name: 'AdminAppointments',
        component: () => import('../pages/admin/Appointments/AppointmentsList.vue')
      }
    ]
  }
]
 
export default adminRoutes