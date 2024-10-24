<template>
  <div class="home">
    <div class="card">
      <h2 v-if="isLoggedIn">You are logged in</h2>
      <h2 v-else>You are not logged in</h2>

      <div class="button-container">
        <button class="btn primary" @click="goToLogin">Login</button>
        <button class="btn secondary" @click="goToRegister">Register</button>
        <button class="btn google" @click="login">Login with Google</button>
      </div>
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
    const { isAuthenticated, loginWithRedirect } = useAuth0();
    const isLoggedIn = ref(false);
    
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      if (token || isAuthenticated.value) {
        isLoggedIn.value = true;
        router.push('/home');
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
      await loginWithRedirect({
        appState: {
          target: '/home',
        },
      });
    };

    onMounted(() => {
      checkLoginStatus();
    });

    return {
      isLoggedIn,
      goToLogin,
      goToRegister,
      login,
    };
  },
};
</script>

<style scoped>
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  text-align: center;
}

h2 {
  margin-bottom: 20px;
  font-family: Arial, sans-serif;
  color: #333;
}

.button-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn {
  padding: 10px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-family: Arial, sans-serif;
  transition: background-color 0.3s ease;
}

.btn.primary {
  background-color: #4CAF50;
  color: white;
}

.btn.primary:hover {
  background-color: #45a049;
}

.btn.secondary {
  background-color: #008CBA;
  color: white;
}

.btn.secondary:hover {
  background-color: #007bb5;
}

.btn.google {
  background-color: #db4437;
  color: white;
}

.btn.google:hover {
  background-color: #c13b31;
}
</style>
