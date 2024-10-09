<template>
    <div class="home">
      <!-- Redirect to home if logged in -->
      <div v-if="isLoggedIn">
        <h2>You are logged in</h2>
        <button @click="goToLogin">Login</button>
        <button @click="goToRegister">Register</button>
        <button @click="login">Login with Google</button>
      </div>
      <div v-if="!isLoggedIn">
        <h2>You are not logged in</h2>
        <button @click="goToLogin">Login</button>
        <button @click="goToRegister">Register</button>
        <button @click="login">Login with Google</button>
      </div>
    </div>
  </template>
  
  <script>
    import { ref, onMounted } from 'vue';
    import { useAuth0 } from '@auth0/auth0-vue';
    import { useRouter } from 'vue-router';

    export default {
      setup() {
        const router = useRouter();
        const { isAuthenticated, loginWithRedirect,  } = useAuth0();
        const isLoggedIn = ref(false); // Reactive state for login status
        
        const checkLoginStatus = () => {
          const token = localStorage.getItem('token');
          if (token || isAuthenticated.value) {
            isLoggedIn.value = true;
            router.push('/home'); // Redirect to home if logged in
          } else {
            isLoggedIn.value = false;
          }
        };

        const goToLogin = () => {
          router.push('/user/login');
        };

        const goToRegister = () => {
          router.push('/user/register');
        };

        const login = async () => {
          console.log("Tjoho");
          await loginWithRedirect({
            appState: {
              target: '/home',
            },
          });
        };

        onMounted(() => {
          checkLoginStatus(); // Check login status when the component mounts
        });

        return {
          isLoggedIn,
          checkLoginStatus,
          goToLogin,
          goToRegister,
          login,
        };
      },
    };
</script>