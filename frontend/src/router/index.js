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
import CreateBox from '@/components/CreateBox.vue'; // Your Create Box page
import MyBoxes from '@/components/MyBoxes.vue';    // Your My Boxes page
import MyBox from '@/components/MyBox.vue';        // Your My Box page
import User from '@/pages/user.vue';          // Your User page

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
    path: '/my-boxes/:id', // Dynamic route for box details
    component: MyBox,
  },
  {
    path: '/user',
    component: User,
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token'); // Get JWT token from localStorage
  const { isAuthenticated, isLoading } = useAuth0(); // Get Auth0 authentication status
  console.log('isAuthenticated', !isAuthenticated.value)
  console.log('token', !token)
  // Define public routes (those that don't require authentication)
  const publicRoutes = ['/', '/user/login', '/user/register'];
  console.log('publicroutes', publicRoutes.includes(to.path))
  // If the user is trying to access a protected route and is not authenticated
  if ((!token && !isAuthenticated.value) && !publicRoutes.includes(to.path)) {
    // Redirect to the login page
    console.log("HEjsan");
    next('/');
  } else {
    // Allow access to the requested route
    console.log("Ja?");
    next();
  }
});



// // Workaround for https://github.com/vitejs/vite/issues/11804
// router.onError((err, to) => {
//   if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
//     if (!localStorage.getItem('vuetify:dynamic-reload')) {
//       console.log('Reloading page to fix dynamic import error')
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
