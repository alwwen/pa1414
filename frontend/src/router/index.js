/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
// import { setupLayouts } from 'virtual:generated-layouts'
// import { routes } from 'vue-router'
import IndexView from '@/pages/index.vue'
import HomePage from '@/pages/home.vue'
import RegisterPage from '@/pages/register.vue'
import LoginPage from '@/pages/login.vue'
import CreateBox from '@/components/CreateBox.vue'; // Your Create Box page
import MyBoxes from '@/components/MyBoxes.vue';    // Your My Boxes page
import MyBox from '@/components/MyBox.vue';        // Your My Box page

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
    path: '/register',
    component: RegisterPage,
  },
  {
    path: '/login',
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
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token'); // Get JWT token from localStorage

  // Define public routes (those that don't require authentication)
  const publicRoutes = ['/', '/login', '/register'];

  // If the user is trying to access a protected route and is not authenticated
  if (!token && !publicRoutes.includes(to.path)) {
    // Redirect to the login page
    next('/');
  } else {
    // Allow access to the requested route
    next();
  }
});


// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
