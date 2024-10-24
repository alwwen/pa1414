/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
// import { setupLayouts } from 'virtual:generated-layouts'
// import { routes } from 'vue-router'
import IndexView from '@/pages/testing.vue'
import HomePage from '@/pages/home.vue'
import RegisterPage from '@/pages/register.vue'
import LoginPage from '@/pages/login.vue'
import CreateBox from '@/components/CreateBox.vue';
import MyBoxes from '@/components/MyBoxes.vue';
import MyBox from '@/components/MyBox.vue';
import User from '@/pages/user.vue';
import VerifyAccount from '@/components/Verification.vue';
import Userprofile from '@/components/userprofile.vue';
import UserList from '@/components/UserList.vue';
import EditBox from '@/components/EditBox.vue';

const routes = [
  {
    path: '/',
    component: IndexView,
  },
  {
    path: '/home',
    component: HomePage,
  },
  {
    path: '/user/register',
    component: RegisterPage,
  },
  {
    path: '/user/login',
    component: LoginPage,
  },
  {
    path: '/create-box',
    component: CreateBox,
  },
  {
    path: '/my-boxes',
    component: MyBoxes,
  },
  {
    path: '/my-boxes/:id', 
    component: MyBox,
  },
  {
    path: '/user',
    component: User,
  },
  {
    path: '/verify',
    component: VerifyAccount,
  },
  {
    path: '/user-account',
    component: Userprofile,
  },
  {
    path: '/user-list',
    component: UserList,
  },
  {
    path: '/edit-box/:id',
    component: EditBox,
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const { isAuthenticated, isLoading } = useAuth0();
  
  

  const publicRoutes = ['/', '/user/login', '/user/register', '/verify'];

  const isPublicRoute = publicRoutes.includes(to.path) || /^\/my-boxes\/\d+$/.test(to.path);

  
  
  if ((!token && !isAuthenticated.value) && !isPublicRoute) {
    
    next('/');
  } else {
    
    next();
  }
});



// // Workaround for https://github.com/vitejs/vite/issues/11804
// router.onError((err, to) => {
//   if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
//     if (!localStorage.getItem('vuetify:dynamic-reload')) {
//       
//       localStorage.setItem('vuetify:dynamic-reload', 'true')
//       location.assign(to.fullPath)
//     } else {
//       console.error('Dynamic import error, reloading page did not fix it', err)
//     }
//   } else {
//     console.error(err)
//   }
// })

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
